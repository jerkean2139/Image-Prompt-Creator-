import Anthropic from '@anthropic-ai/sdk';

const anthropic = new Anthropic({
  apiKey: process.env.ANTHROPIC_API_KEY,
  baseURL: process.env.ANTHROPIC_BASE_URL
});

const GRADER_SYSTEM = `You are an expert prompt evaluator for image generation systems. Your job is to grade prompts on a scale of 0-100 and provide actionable improvement suggestions.

**Evaluation Rubric:**

1. **Clarity (25 points)**: Is the subject and intent crystal clear?
2. **Detail Level (25 points)**: Are visual details rich and specific?
3. **Technical Quality (20 points)**: Does it include quality boosters and technical specs?
4. **Composition Guidance (15 points)**: Does it guide framing, lighting, and atmosphere?
5. **Coherence (15 points)**: Are all elements consistent and non-contradictory?

**Scoring Guidelines:**
- 97-100: Exceptional, professional-grade prompt
- 90-96: Excellent, minor improvements possible
- 80-89: Good, needs refinement
- 70-79: Adequate, significant improvements needed
- Below 70: Poor, major revision required

**Output Format (JSON):**
{
  "score": 85,
  "rubricJson": {
    "clarity": 22,
    "detailLevel": 20,
    "technicalQuality": 18,
    "compositionGuidance": 13,
    "coherence": 12
  },
  "gradeNotes": "Concise feedback summary (2-3 sentences)",
  "improvements": [
    "Specific suggestion 1",
    "Specific suggestion 2"
  ],
  "improvedPrompt": "The revised prompt text (only if score < 97)"
}

**Instructions:**
- Be strict but fair
- Focus on actionable improvements
- If score >= 97, set "improvedPrompt" to null
- If score < 97, provide an improved version`;

export async function gradePrompt(promptText, idea) {
  try {
    const userMessage = `Grade this image generation prompt and provide improvement suggestions.

**Original Idea:** "${idea}"

**Prompt to Grade:**
${promptText}

Provide your evaluation as valid JSON matching the specified format.`;

    const response = await anthropic.messages.create({
      model: 'claude-sonnet-4-20250514',
      max_tokens: 1500,
      system: GRADER_SYSTEM,
      messages: [{
        role: 'user',
        content: userMessage
      }]
    });

    const content = response.content[0].text;
    
    // Parse JSON from response
    let gradeData;
    try {
      const jsonMatch = content.match(/```json\s*([\s\S]*?)\s*```/) || content.match(/\{[\s\S]*\}/);
      if (jsonMatch) {
        gradeData = JSON.parse(jsonMatch[1] || jsonMatch[0]);
      } else {
        throw new Error('No JSON found in response');
      }
    } catch (parseError) {
      console.error('Failed to parse grader response as JSON:', content);
      // Fallback: assume it needs improvement
      gradeData = {
        score: 85,
        rubricJson: { clarity: 20, detailLevel: 20, technicalQuality: 17, compositionGuidance: 15, coherence: 13 },
        gradeNotes: 'Automated grading failed, manual review recommended',
        improvements: ['Review prompt structure', 'Add more specific details'],
        improvedPrompt: null
      };
    }

    return {
      success: true,
      grade: gradeData,
      usage: {
        inputTokens: response.usage.input_tokens,
        outputTokens: response.usage.output_tokens
      }
    };
  } catch (error) {
    console.error('Prompt grader error:', error);
    return {
      success: false,
      error: error.message
    };
  }
}

export async function iterativeGrading(initialPrompt, idea, maxIterations = 5) {
  let currentPrompt = initialPrompt;
  let bestScore = 0;
  let bestPrompt = initialPrompt;
  let iterations = [];
  
  for (let i = 0; i < maxIterations; i++) {
    const result = await gradePrompt(currentPrompt.promptText, idea);
    
    if (!result.success) {
      break;
    }
    
    const { grade } = result;
    iterations.push({
      iteration: i + 1,
      score: grade.score,
      notes: grade.gradeNotes
    });
    
    // Track best prompt
    if (grade.score > bestScore) {
      bestScore = grade.score;
      bestPrompt = {
        ...currentPrompt,
        promptText: grade.improvedPrompt || currentPrompt.promptText
      };
    }
    
    // If score >= 97, we're done
    if (grade.score >= 97) {
      return {
        success: true,
        finalPrompt: bestPrompt,
        finalScore: grade.score,
        iterations,
        rubricJson: grade.rubricJson,
        gradeNotes: grade.gradeNotes
      };
    }
    
    // Use improved prompt for next iteration
    if (grade.improvedPrompt) {
      currentPrompt = {
        ...currentPrompt,
        promptText: grade.improvedPrompt
      };
    } else {
      // No improvement suggested, stop iterating
      break;
    }
  }
  
  return {
    success: true,
    finalPrompt: bestPrompt,
    finalScore: bestScore,
    iterations,
    rubricJson: iterations[iterations.length - 1]?.rubricJson || {},
    gradeNotes: `Reached ${bestScore}/100 after ${iterations.length} iterations`
  };
}
