import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import Navbar from '../components/Navbar';
import RemixModal from '../components/RemixModal';

export default function JobDetailPage({ user, onLogout }) {
  const { id } = useParams();
  const navigate = useNavigate();
  const [job, setJob] = useState(null);
  const [loading, setLoading] = useState(true);
  const [favorites, setFavorites] = useState(new Set());
  const [showPromptJson, setShowPromptJson] = useState(false);
  const [remixImage, setRemixImage] = useState(null);

  useEffect(() => {
    loadJob();
    const interval = setInterval(loadJob, 3000);
    return () => clearInterval(interval);
  }, [id]);

  const loadJob = async () => {
    try {
      const res = await fetch(`/api/jobs/${id}`, {
        credentials: 'include'
      });
      
      if (res.ok) {
        const data = await res.json();
        setJob(data.job);
        
        // Load favorites status
        if (data.job.modelRuns) {
          data.job.modelRuns.forEach(run => {
            run.outputs?.forEach(output => {
              if (output.isFavorited) {
                setFavorites(prev => new Set(prev).add(output.id));
              }
            });
          });
        }
      }
    } catch (error) {
      console.error('Failed to load job:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleToggleFavorite = async (imageOutputId) => {
    const isFavorited = favorites.has(imageOutputId);
    
    try {
      const res = await fetch('/api/vault/items', {
        method: isFavorited ? 'DELETE' : 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({ imageOutputId })
      });

      if (res.ok) {
        setFavorites(prev => {
          const newSet = new Set(prev);
          if (isFavorited) {
            newSet.delete(imageOutputId);
          } else {
            newSet.add(imageOutputId);
          }
          return newSet;
        });
      } else {
        alert('Failed to update favorite');
      }
    } catch (error) {
      alert('Network error');
    }
  };

  const copyPromptJson = () => {
    if (!job?.gradedPrompt) return;
    
    const promptJson = {
      masterPrompt: job.gradedPrompt.promptText,
      negatives: job.gradedPrompt.negatives,
      styleNotes: job.gradedPrompt.systemNotes,
      params: job.gradedPrompt.paramsJson,
      style: job.gradedPrompt.styleJson
    };
    
    navigator.clipboard.writeText(JSON.stringify(promptJson, null, 2));
    alert('Prompt JSON copied to clipboard!');
  };

  if (loading) {
    return (
      <div className="min-h-screen">
        <Navbar user={user} onLogout={onLogout} />
        <div className="flex items-center justify-center h-96">
          <div className="text-center">
            <div className="w-16 h-16 border-4 border-cyber-blue border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
            <p className="text-gray-400">Loading job...</p>
          </div>
        </div>
      </div>
    );
  }

  if (!job) {
    return (
      <div className="min-h-screen">
        <Navbar user={user} onLogout={onLogout} />
        <div className="max-w-7xl mx-auto px-4 py-8">
          <div className="card-glow text-center py-12">
            <p className="text-gray-400">Job not found</p>
            <button onClick={() => navigate('/dashboard')} className="mt-4 px-6 py-2 bg-cyber-blue rounded-lg">
              Back to Dashboard
            </button>
          </div>
        </div>
      </div>
    );
  }

  const statusColors = {
    PENDING: 'text-yellow-400',
    RUNNING: 'text-blue-400',
    SUCCEEDED: 'text-green-400',
    FAILED: 'text-red-400'
  };

  const allOutputs = job.modelRuns?.flatMap(run => 
    run.outputs?.map(output => ({
      ...output,
      provider: run.provider,
      promptId: run.promptId
    })) || []
  ) || [];

  return (
    <div className="min-h-screen">
      <Navbar user={user} onLogout={onLogout} />
      
      <div className="max-w-7xl mx-auto px-4 py-8">
        {/* Job Header */}
        <div className="card-glow mb-8">
          <div className="flex items-start justify-between mb-4">
            <div>
              <h1 className="text-3xl font-bold gradient-text mb-2">Generation Results</h1>
              <p className="text-gray-400">{job.idea}</p>
            </div>
            <span className={`px-3 py-1 rounded-full text-sm font-medium ${statusColors[job.status]}`}>
              {job.status}
            </span>
          </div>

          {/* Prompt Display */}
          {job.gradedPrompt && (
            <div className="mt-4 p-4 bg-cyber-surface/50 rounded-lg border border-cyber-border">
              <div className="flex items-center justify-between mb-2">
                <h3 className="text-lg font-semibold">Master Prompt</h3>
                <div className="flex gap-2">
                  <button
                    onClick={() => setShowPromptJson(!showPromptJson)}
                    className="px-3 py-1 bg-cyber-blue/20 hover:bg-cyber-blue/30 rounded text-sm transition-colors"
                  >
                    {showPromptJson ? 'Hide JSON' : 'Show JSON'}
                  </button>
                  <button
                    onClick={copyPromptJson}
                    className="px-3 py-1 bg-cyber-purple/20 hover:bg-cyber-purple/30 rounded text-sm transition-colors"
                  >
                    📋 Copy JSON
                  </button>
                </div>
              </div>
              
              {showPromptJson ? (
                <pre className="text-xs bg-cyber-bg p-3 rounded overflow-x-auto">
                  {JSON.stringify({
                    masterPrompt: job.gradedPrompt.promptText,
                    negatives: job.gradedPrompt.negatives,
                    styleNotes: job.gradedPrompt.systemNotes,
                    params: job.gradedPrompt.paramsJson,
                    style: job.gradedPrompt.styleJson
                  }, null, 2)}
                </pre>
              ) : (
                <p className="text-sm text-gray-300">{job.gradedPrompt.promptText}</p>
              )}
              
              {job.gradeScore && (
                <div className="mt-2 text-sm text-gray-400">
                  Quality Score: <span className="text-cyber-blue font-semibold">{job.gradeScore}/100</span>
                </div>
              )}
            </div>
          )}
        </div>

        {/* Model Runs Progress */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
          {job.modelRuns?.map(run => (
            <div key={run.id} className="card-glow text-center">
              <h3 className="font-semibold mb-2 text-sm">{run.provider.replace(/_/g, ' ')}</h3>
              <span className={`text-xs ${statusColors[run.status]}`}>{run.status}</span>
              {run.outputs && run.outputs.length > 0 && (
                <p className="text-xs text-gray-400 mt-1">{run.outputs.length} image(s)</p>
              )}
            </div>
          ))}
        </div>

        {/* Image Gallery */}
        {allOutputs.length > 0 && (
          <div>
            <h2 className="text-2xl font-bold mb-4">Generated Images</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {allOutputs.map(output => (
                <div key={output.id} className="card-glow group relative">
                  <div className="relative">
                    <img
                      src={output.url}
                      alt="Generated"
                      className="w-full h-auto rounded-lg"
                    />
                    
                    {/* Action Buttons Overlay */}
                    <div className="absolute top-3 right-3 flex gap-2">
                      <button
                        onClick={() => handleToggleFavorite(output.id)}
                        className="w-10 h-10 bg-black/50 backdrop-blur-sm rounded-full flex items-center justify-center hover:bg-black/70 transition-all"
                      >
                        {favorites.has(output.id) ? (
                          <span className="text-xl">❤️</span>
                        ) : (
                          <span className="text-xl text-gray-300 hover:text-red-400">🤍</span>
                        )}
                      </button>
                      <button
                        onClick={() => setRemixImage(output)}
                        className="w-10 h-10 bg-black/50 backdrop-blur-sm rounded-full flex items-center justify-center hover:bg-black/70 transition-all"
                        title="Remix"
                      >
                        <span className="text-xl">🔄</span>
                      </button>
                    </div>
                  </div>
                  
                  <div className="mt-3 flex items-center justify-between">
                    <div>
                      <p className="text-sm font-medium text-cyber-blue">
                        {output.provider?.replace(/_/g, ' ')}
                      </p>
                      <p className="text-xs text-gray-400 mt-1">
                        {output.width} × {output.height}
                      </p>
                    </div>
                    <button
                      onClick={() => setRemixImage(output)}
                      className="px-3 py-1.5 bg-gradient-to-r from-indigo-500 to-purple-500 text-white text-sm rounded-lg hover:shadow-lg transition-all"
                    >
                      Remix
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* No Results Yet */}
        {allOutputs.length === 0 && job.status === 'RUNNING' && (
          <div className="text-center py-12">
            <div className="w-16 h-16 border-4 border-cyber-blue border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
            <p className="text-gray-400">Generating images...</p>
          </div>
        )}

        {/* No images generated (all providers failed) */}
        {allOutputs.length === 0 && job.status === 'SUCCEEDED' && (
          <div className="text-center py-12 card-glow">
            <p className="text-gray-400 mb-2">No images were generated</p>
            <p className="text-sm text-gray-500">All image generation providers may have encountered issues. Please try again.</p>
            <button 
              onClick={() => navigate('/create')}
              className="mt-4 px-6 py-2 bg-gradient-to-r from-cyber-blue to-cyber-purple rounded-lg hover:opacity-90 transition-all"
            >
              Try Again
            </button>
          </div>
        )}
      </div>

      {/* Remix Modal */}
      {remixImage && (
        <RemixModal
          image={remixImage}
          originalPrompt={job?.gradedPrompt?.promptText || job?.idea}
          onClose={() => setRemixImage(null)}
        />
      )}
    </div>
  );
}
