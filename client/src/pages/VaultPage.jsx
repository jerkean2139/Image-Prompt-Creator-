import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import Navbar from '../components/Navbar';

export default function VaultPage({ user, onLogout }) {
  const navigate = useNavigate();
  const [vaultItems, setVaultItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedItem, setSelectedItem] = useState(null);

  useEffect(() => {
    loadVaultItems();
  }, []);

  const loadVaultItems = async () => {
    try {
      const res = await fetch('/api/vault/items', {
        credentials: 'include'
      });
      
      if (res.ok) {
        const data = await res.json();
        setVaultItems(data.items);
      }
    } catch (error) {
      console.error('Failed to load vault items:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleRemove = async (itemId) => {
    if (!confirm('Remove this item from your vault?')) return;
    
    try {
      const res = await fetch(`/api/vault/items/${itemId}`, {
        method: 'DELETE',
        credentials: 'include'
      });
      
      if (res.ok) {
        setVaultItems(prev => prev.filter(item => item.id !== itemId));
        if (selectedItem?.id === itemId) {
          setSelectedItem(null);
        }
      }
    } catch (error) {
      alert('Failed to remove item');
    }
  };

  const copyPromptJson = (item) => {
    if (!item.imageOutput?.modelRun?.prompt) return;
    
    const prompt = item.imageOutput.modelRun.prompt;
    const promptJson = {
      masterPrompt: prompt.promptText,
      negatives: prompt.negatives,
      styleNotes: prompt.systemNotes,
      params: prompt.paramsJson,
      style: prompt.styleJson
    };
    
    navigator.clipboard.writeText(JSON.stringify(promptJson, null, 2));
    alert('Prompt JSON copied to clipboard! You can paste this in the Dashboard to reuse it.');
  };

  if (loading) {
    return (
      <div className="min-h-screen">
        <Navbar user={user} onLogout={onLogout} />
        <div className="flex items-center justify-center h-96">
          <div className="text-center">
            <div className="w-16 h-16 border-4 border-cyber-blue border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
            <p className="text-gray-400">Loading vault...</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen">
      <Navbar user={user} onLogout={onLogout} />
      
      <div className="max-w-7xl mx-auto px-4 py-8">
        <div className="mb-8">
          <h1 className="text-4xl font-bold gradient-text mb-2">Your Vault</h1>
          <p className="text-gray-400">Your favorite images and their prompts</p>
        </div>

        {vaultItems.length === 0 ? (
          <div className="card-glow text-center py-12">
            <p className="text-gray-400 mb-4">Your vault is empty</p>
            <p className="text-sm text-gray-500 mb-6">Heart images from your generations to save them here!</p>
            <button
              onClick={() => navigate('/dashboard')}
              className="px-6 py-2 bg-gradient-to-r from-cyber-blue to-cyber-purple rounded-lg"
            >
              Create Generation
            </button>
          </div>
        ) : (
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Image Grid */}
            <div className="lg:col-span-2">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {vaultItems.map(item => (
                  <div
                    key={item.id}
                    className={`card-glow cursor-pointer transition-all ${
                      selectedItem?.id === item.id ? 'ring-2 ring-cyber-blue' : ''
                    }`}
                    onClick={() => setSelectedItem(item)}
                  >
                    <div className="relative">
                      <img
                        src={item.imageOutput?.url}
                        alt="Vault item"
                        className="w-full h-auto rounded-lg"
                      />
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          handleRemove(item.id);
                        }}
                        className="absolute top-2 right-2 w-8 h-8 bg-red-500/80 hover:bg-red-500 rounded-full flex items-center justify-center transition-colors"
                      >
                        ×
                      </button>
                    </div>
                    <div className="mt-3">
                      <p className="text-sm font-medium text-cyber-blue">
                        {item.imageOutput?.modelRun?.provider?.replace(/_/g, ' ')}
                      </p>
                      <p className="text-xs text-gray-400 mt-1">
                        {new Date(item.createdAt).toLocaleDateString()}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Details Panel */}
            <div className="lg:col-span-1">
              {selectedItem ? (
                <div className="card-glow sticky top-4">
                  <h2 className="text-xl font-bold mb-4">Prompt Details</h2>
                  
                  {/* Image Preview */}
                  <img
                    src={selectedItem.imageOutput?.url}
                    alt="Selected"
                    className="w-full h-auto rounded-lg mb-4"
                  />
                  
                  {/* Provider Info */}
                  <div className="mb-4">
                    <p className="text-sm text-gray-400">Provider</p>
                    <p className="font-medium text-cyber-blue">
                      {selectedItem.imageOutput?.modelRun?.provider?.replace(/_/g, ' ')}
                    </p>
                  </div>
                  
                  {/* Dimensions */}
                  <div className="mb-4">
                    <p className="text-sm text-gray-400">Dimensions</p>
                    <p className="font-medium">
                      {selectedItem.imageOutput?.width} × {selectedItem.imageOutput?.height}
                    </p>
                  </div>
                  
                  {/* Prompt */}
                  {selectedItem.imageOutput?.modelRun?.prompt && (
                    <div className="mb-4">
                      <div className="flex items-center justify-between mb-2">
                        <p className="text-sm text-gray-400">Prompt</p>
                        <button
                          onClick={() => copyPromptJson(selectedItem)}
                          className="px-3 py-1 bg-cyber-purple/20 hover:bg-cyber-purple/30 rounded text-xs transition-colors"
                        >
                          📋 Copy JSON
                        </button>
                      </div>
                      <div className="p-3 bg-cyber-surface/50 rounded text-xs max-h-48 overflow-y-auto">
                        {selectedItem.imageOutput.modelRun.prompt.promptText}
                      </div>
                    </div>
                  )}
                  
                  {/* JSON Preview */}
                  {selectedItem.imageOutput?.modelRun?.prompt && (
                    <div>
                      <p className="text-sm text-gray-400 mb-2">Full JSON</p>
                      <pre className="p-3 bg-cyber-bg rounded text-xs max-h-64 overflow-y-auto">
                        {JSON.stringify({
                          masterPrompt: selectedItem.imageOutput.modelRun.prompt.promptText,
                          negatives: selectedItem.imageOutput.modelRun.prompt.negatives,
                          styleNotes: selectedItem.imageOutput.modelRun.prompt.systemNotes,
                          params: selectedItem.imageOutput.modelRun.prompt.paramsJson,
                          style: selectedItem.imageOutput.modelRun.prompt.styleJson
                        }, null, 2)}
                      </pre>
                    </div>
                  )}
                  
                  {/* Actions */}
                  <div className="mt-4 flex gap-2">
                    <button
                      onClick={() => {
                        const jobId = selectedItem.imageOutput?.modelRun?.jobId;
                        if (jobId) navigate(`/jobs/${jobId}`);
                      }}
                      className="flex-1 px-4 py-2 bg-cyber-blue/20 hover:bg-cyber-blue/30 rounded transition-colors text-sm"
                    >
                      View Job
                    </button>
                    <button
                      onClick={() => handleRemove(selectedItem.id)}
                      className="px-4 py-2 bg-red-500/20 hover:bg-red-500/30 rounded transition-colors text-sm"
                    >
                      Remove
                    </button>
                  </div>
                </div>
              ) : (
                <div className="card-glow text-center py-12">
                  <p className="text-gray-400">Select an image to view details</p>
                </div>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
