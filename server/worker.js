import 'dotenv/config';
import { Worker, Queue } from 'bullmq';
import { PrismaClient } from '@prisma/client';
import IORedis from 'ioredis';
import { createPrompt } from './services/promptMaker.js';
import { iterativeGrading } from './services/promptGrader.js';
import { createMockPrompt, createProviderSpecificPrompts } from './services/mockPromptMaker.js';

// Use mock prompts when modelfarm is not available
const USE_MOCK_PROMPTS = process.env.USE_MOCK_PROMPTS === 'true' || true; // Default to true for testing
import { generateImage, PROVIDER_COSTS } from './services/imageGenerator.js';

const prisma = new PrismaClient();

// Redis connection
const connection = new IORedis(process.env.REDIS_URL || 'redis://localhost:6379', {
  maxRetriesPerRequest: null
});

// Create queue
export const jobQueue = new Queue('promptfusion-jobs', { connection });

// Prompt creation cost (Claude - now 2 calls: master + provider-specific)
const PROMPT_CREATION_COST = 50; // credits (increased for 2-stage process)

/**
 * Process a job: create master prompt, create provider-specific prompts, grade master, generate images
 */
async function processJob(job) {
  const { jobId } = job.data;
  
  console.log(`📝 Processing job ${jobId}`);
  
  try {
    // Get job details
    const jobData = await prisma.job.findUnique({
      where: { id: jobId },
      include: {
        user: true,
        referenceAssets: true
      }
    });
    
    if (!jobData) {
      throw new Error('Job not found');
    }
    
    // Update status to RUNNING
    await prisma.job.update({
      where: { id: jobId },
      data: { status: 'RUNNING' }
    });
    
    // Step 1: Create master prompt + provider-specific prompts
    console.log(`🤖 Creating prompts for job ${jobId}`);
    
    let promptResult;
    
    if (USE_MOCK_PROMPTS) {
      console.log('📝 Using mock prompt maker (modelfarm not available)');
      const mockPrompt = await createMockPrompt(
        jobData.idea,
        jobData.presetKey,
        jobData.aspectRatio,
        jobData.moodTags,
        jobData.presetAnswers
      );
      promptResult = {
        success: true,
        masterPrompt: mockPrompt,
        providerPrompts: mockPrompt.providerPrompts
      };
    } else {
      promptResult = await createPrompt(
        jobData.idea,
        jobData.referenceAssets,
        jobData.presetKey,
        jobData.aspectRatio,
        jobData.moodTags
      );
      
      if (!promptResult.success) {
        throw new Error(`Prompt creation failed: ${promptResult.error}`);
      }
    }
    
    // Save master prompt
    const masterPromptRecord = await prisma.prompt.create({
      data: {
        systemNotes: promptResult.masterPrompt.styleNotes || 'Master prompt',
        promptText: promptResult.masterPrompt.masterPrompt,
        negatives: promptResult.masterPrompt.negatives,
        paramsJson: { 
          aspectRatio: jobData.aspectRatio,
          presetKey: jobData.presetKey,
          moodTags: jobData.moodTags
        },
        styleJson: {
          preset: jobData.presetKey,
          providerSpecific: true
        }
      }
    });
    
    await prisma.job.update({
      where: { id: jobId },
      data: { draftPromptId: masterPromptRecord.id }
    });
    
    // Step 2: Grade the master prompt (optional - for quality assurance)
    console.log(`📊 Grading master prompt for job ${jobId}`);
    const gradingResult = await iterativeGrading(promptResult.masterPrompt, jobData.idea, 3);
    
    let finalMasterPrompt = promptResult.masterPrompt;
    let gradeScore = 85;
    let gradeNotes = 'Master prompt created';
    
    if (gradingResult.success) {
      finalMasterPrompt = gradingResult.finalPrompt;
      gradeScore = gradingResult.finalScore;
      gradeNotes = gradingResult.gradeNotes;
    }
    
    // Save graded master prompt
    const gradedPromptRecord = await prisma.prompt.create({
      data: {
        systemNotes: finalMasterPrompt.styleNotes || gradeNotes,
        promptText: finalMasterPrompt.masterPrompt || finalMasterPrompt.promptText,
        negatives: finalMasterPrompt.negatives,
        paramsJson: { 
          aspectRatio: jobData.aspectRatio,
          presetKey: jobData.presetKey,
          moodTags: jobData.moodTags
        },
        styleJson: {
          preset: jobData.presetKey,
          graded: true
        },
        rubricJson: gradingResult.rubricJson || {}
      }
    });
    
    await prisma.job.update({
      where: { id: jobId },
      data: {
        gradedPromptId: gradedPromptRecord.id,
        gradeScore: gradeScore,
        gradeNotes: gradeNotes
      }
    });
    
    // Deduct prompt creation cost
    await prisma.user.update({
      where: { id: jobData.userId },
      data: { creditsBalance: { decrement: PROMPT_CREATION_COST } }
    });
    
    await prisma.creditEvent.create({
      data: {
        userId: jobData.userId,
        type: 'SPEND',
        amount: -PROMPT_CREATION_COST,
        reason: 'Prompt creation (master + provider-specific)',
        jobId: jobId
      }
    });
    
    // Step 3: Generate images with provider-specific prompts
    const providers = ['OPENAI_GPT52_IMAGE', 'OPENAI_DALLE3', 'GEMINI_NANOBANANA_PRO', 'FLUX_PRO_2', 'IDEOGRAM'];
    
    for (const provider of providers) {
      console.log(`🎨 Generating with ${provider} for job ${jobId}`);
      
      // Get provider-specific prompt
      const providerPrompt = promptResult.providerPrompts[provider] || finalMasterPrompt.masterPrompt || finalMasterPrompt.promptText;
      
      // Save provider-specific prompt
      const providerPromptRecord = await prisma.prompt.create({
        data: {
          systemNotes: `Provider-specific for ${provider}`,
          promptText: providerPrompt,
          negatives: finalMasterPrompt.negatives,
          paramsJson: { 
            aspectRatio: jobData.aspectRatio,
            provider: provider
          },
          styleJson: {
            provider: provider,
            optimized: true
          }
        }
      });
      
      // Create model run
      const modelRun = await prisma.modelRun.create({
        data: {
          jobId: jobId,
          provider: provider,
          status: 'RUNNING',
          variations: 1,
          promptId: providerPromptRecord.id,
          costCredits: PROVIDER_COSTS[provider],
          startedAt: new Date()
        }
      });
      
      try {
        // Generate image with provider-specific prompt
        const genResult = await generateImage(
          provider,
          providerPrompt,
          jobData.aspectRatio || '1024x1024',
          1
        );
        
        if (genResult.success && genResult.images && genResult.images.length > 0) {
          // Save outputs
          for (const img of genResult.images) {
            await prisma.imageOutput.create({
              data: {
                modelRunId: modelRun.id,
                url: img.url,
                width: img.width,
                height: img.height,
                seed: img.seed,
                metaJson: img
              }
            });
          }
          
          // Update model run status
          await prisma.modelRun.update({
            where: { id: modelRun.id },
            data: {
              status: 'SUCCEEDED',
              finishedAt: new Date()
            }
          });
          
          // Deduct credits
          await prisma.user.update({
            where: { id: jobData.userId },
            data: { creditsBalance: { decrement: PROVIDER_COSTS[provider] } }
          });
          
          await prisma.creditEvent.create({
            data: {
              userId: jobData.userId,
              type: 'SPEND',
              amount: -PROVIDER_COSTS[provider],
              reason: `Image generation (${provider})`,
              jobId: jobId
            }
          });
        } else {
          throw new Error(genResult.error || 'No images generated');
        }
      } catch (error) {
        console.error(`❌ ${provider} failed for job ${jobId}:`, error);
        
        // Update model run with error
        await prisma.modelRun.update({
          where: { id: modelRun.id },
          data: {
            status: 'FAILED',
            error: error.message,
            finishedAt: new Date()
          }
        });
      }
    }
    
    // Mark job as succeeded
    await prisma.job.update({
      where: { id: jobId },
      data: { status: 'SUCCEEDED' }
    });
    
    console.log(`✅ Job ${jobId} completed successfully`);
  } catch (error) {
    console.error(`❌ Job ${jobId} failed:`, error);
    
    // Mark job as failed
    await prisma.job.update({
      where: { id: jobId },
      data: { status: 'FAILED' }
    });
    
    throw error;
  }
}

// Create worker
const worker = new Worker('promptfusion-jobs', processJob, {
  connection,
  concurrency: 2,
  limiter: {
    max: 10,
    duration: 60000 // 10 jobs per minute
  }
});

worker.on('completed', (job) => {
  console.log(`✅ Worker completed job ${job.id}`);
});

worker.on('failed', (job, err) => {
  console.error(`❌ Worker failed job ${job?.id}:`, err);
});

console.log('🚀 Runtz AI Image Maker worker started');

// Graceful shutdown
process.on('SIGINT', async () => {
  console.log('\n🛑 Shutting down worker...');
  await worker.close();
  await connection.quit();
  await prisma.$disconnect();
  process.exit(0);
});
