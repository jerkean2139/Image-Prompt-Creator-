import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import BottomNav from '../components/BottomNav';

export default function PromptLibraryPage() {
  const navigate = useNavigate();
  const [prompts, setPrompts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [editingPrompt, setEditingPrompt] = useState(null);
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    promptText: '',
    negativePrompt: '',
    presetKey: '',
    aspectRatio: '1024x1024',
    moodTags: '',
    seed: '',
    guidanceScale: 7.5
  });

  useEffect(() => {
    loadPrompts();
  }, []);

  const loadPrompts = async () => {
    try {
      const res = await fetch('/api/prompts/saved', { credentials: 'include' });
      if (res.ok) {
        const data = await res.json();
        setPrompts(data.prompts || []);
      }
    } catch (error) {
      console.error('Failed to load prompts:', error);
    } finally {
      setLoading(false);
    }
  };

  const savePrompt = async () => {
    try {
      const url = editingPrompt
        ? `/api/prompts/saved/${editingPrompt.id}`
        : '/api/prompts/saved';
      
      const res = await fetch(url, {
        method: editingPrompt ? 'PATCH' : 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify(formData)
      });

      if (res.ok) {
        setShowModal(false);
        setEditingPrompt(null);
        resetForm();
        loadPrompts();
      }
    } catch (error) {
      console.error('Failed to save prompt:', error);
    }
  };

  const deletePrompt = async (id) => {
    if (!confirm('Delete this saved prompt?')) return;
    
    try {
      await fetch(`/api/prompts/saved/${id}`, {
        method: 'DELETE',
        credentials: 'include'
      });
      loadPrompts();
    } catch (error) {
      console.error('Failed to delete prompt:', error);
    }
  };

  const usePrompt = (prompt) => {
    // Navigate to create page with prompt data
    navigate('/create', { state: { savedPrompt: prompt } });
  };

  const editPrompt = (prompt) => {
    setEditingPrompt(prompt);
    setFormData({
      name: prompt.name,
      description: prompt.description || '',
      promptText: prompt.promptText,
      negativePrompt: prompt.negativePrompt || '',
      presetKey: prompt.presetKey || '',
      aspectRatio: prompt.aspectRatio || '1024x1024',
      moodTags: prompt.moodTags || '',
      seed: prompt.seed?.toString() || '',
      guidanceScale: prompt.guidanceScale || 7.5
    });
    setShowModal(true);
  };

  const resetForm = () => {
    setFormData({
      name: '',
      description: '',
      promptText: '',
      negativePrompt: '',
      presetKey: '',
      aspectRatio: '1024x1024',
      moodTags: '',
      seed: '',
      guidanceScale: 7.5
    });
  };

  return (
    <div className="min-h-screen bg-slate-950 pb-20">
      {/* Header */}
      <div className="bg-gradient-to-r from-indigo-500 to-purple-500 pt-12 pb-6 px-6">
        <div className="max-w-4xl mx-auto flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-white">Prompt Library</h1>
            <p className="text-indigo-100 text-sm">Save and reuse your best prompts</p>
          </div>
          <button
            onClick={() => {
              resetForm();
              setEditingPrompt(null);
              setShowModal(true);
            }}
            className="px-4 py-2 bg-white/20 backdrop-blur-sm text-white rounded-xl hover:bg-white/30 transition-colors"
          >
            + New
          </button>
        </div>
      </div>

      <div className="max-w-4xl mx-auto px-6 py-6">
        {loading ? (
          <div className="text-center py-12">
            <div className="inline-block w-8 h-8 border-4 border-indigo-500 border-t-transparent rounded-full animate-spin"></div>
          </div>
        ) : prompts.length === 0 ? (
          <div className="text-center py-12 bg-slate-900 rounded-2xl border border-slate-800">
            <svg className="w-16 h-16 mx-auto text-slate-600 mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
            </svg>
            <p className="text-slate-400 mb-4">No saved prompts yet</p>
            <button
              onClick={() => setShowModal(true)}
              className="px-6 py-3 bg-gradient-to-r from-indigo-500 to-purple-500 text-white rounded-xl font-semibold"
            >
              Create Your First Prompt
            </button>
          </div>
        ) : (
          <div className="space-y-4">
            {prompts.map((prompt, idx) => (
              <div
                key={prompt.id}
                className="bg-slate-900 rounded-2xl border border-slate-800 p-6 hover:border-indigo-500/50 transition-all animate-slide-up"
                style={{ animationDelay: `${idx * 50}ms` }}
              >
                <div className="flex items-start justify-between mb-3">
                  <div className="flex-1">
                    <h3 className="text-lg font-bold text-white mb-1">{prompt.name}</h3>
                    {prompt.description && (
                      <p className="text-sm text-slate-400">{prompt.description}</p>
                    )}
                  </div>
                  {prompt.isFavorite && (
                    <svg className="w-5 h-5 text-pink-500 flex-shrink-0 ml-2" fill="currentColor" viewBox="0 0 24 24">
                      <path d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
                    </svg>
                  )}
                </div>

                <div className="bg-slate-800 rounded-xl p-4 mb-4">
                  <p className="text-sm text-slate-300 line-clamp-3">{prompt.promptText}</p>
                </div>

                <div className="flex flex-wrap gap-2 mb-4">
                  {prompt.presetKey && (
                    <span className="px-3 py-1 bg-indigo-500/20 text-indigo-400 rounded-lg text-xs font-medium">
                      {prompt.presetKey}
                    </span>
                  )}
                  {prompt.aspectRatio && (
                    <span className="px-3 py-1 bg-slate-800 text-slate-400 rounded-lg text-xs font-medium">
                      {prompt.aspectRatio}
                    </span>
                  )}
                  <span className="px-3 py-1 bg-slate-800 text-slate-400 rounded-lg text-xs font-medium">
                    Used {prompt.useCount || 0}x
                  </span>
                </div>

                <div className="flex space-x-2">
                  <button
                    onClick={() => usePrompt(prompt)}
                    className="flex-1 py-2 bg-gradient-to-r from-indigo-500 to-purple-500 text-white rounded-xl font-semibold hover:shadow-lg transition-all"
                  >
                    Use Prompt
                  </button>
                  <button
                    onClick={() => editPrompt(prompt)}
                    className="px-4 py-2 bg-slate-800 text-slate-300 rounded-xl hover:text-white transition-colors"
                  >
                    Edit
                  </button>
                  <button
                    onClick={() => deletePrompt(prompt.id)}
                    className="px-4 py-2 bg-slate-800 text-slate-300 rounded-xl hover:text-red-400 transition-colors"
                  >
                    Delete
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Modal */}
      {showModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 p-4 overflow-y-auto">
          <div className="bg-slate-900 rounded-2xl p-6 max-w-2xl w-full my-8">
            <h3 className="text-xl font-bold text-white mb-4">
              {editingPrompt ? 'Edit Prompt' : 'New Saved Prompt'}
            </h3>
            
            <div className="space-y-4 mb-6">
              <input
                type="text"
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                placeholder="Prompt name"
                className="w-full px-4 py-3 bg-slate-800 border border-slate-700 rounded-xl text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-indigo-500"
              />
              
              <textarea
                value={formData.promptText}
                onChange={(e) => setFormData({ ...formData, promptText: e.target.value })}
                placeholder="Prompt text"
                rows="4"
                className="w-full px-4 py-3 bg-slate-800 border border-slate-700 rounded-xl text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-indigo-500 resize-none"
              />
            </div>

            <div className="flex space-x-3">
              <button
                onClick={() => {
                  setShowModal(false);
                  setEditingPrompt(null);
                  resetForm();
                }}
                className="flex-1 py-3 bg-slate-800 text-white rounded-xl hover:bg-slate-700 transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={savePrompt}
                className="flex-1 py-3 bg-gradient-to-r from-indigo-500 to-purple-500 text-white rounded-xl hover:shadow-lg transition-all"
              >
                Save
              </button>
            </div>
          </div>
        </div>
      )}

      <BottomNav />
    </div>
  );
}
