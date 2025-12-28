import { useEffect, useState } from 'react';
import BottomNav from '../components/BottomNav';
import ImageViewer from '../components/ImageViewer';
import SkeletonLoader from '../components/SkeletonLoader';

export default function VaultPage() {
  const [items, setItems] = useState([]);
  const [collections, setCollections] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedCollection, setSelectedCollection] = useState('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [filterFavorites, setFilterFavorites] = useState(false);
  const [viewerImages, setViewerImages] = useState(null);
  const [viewerIndex, setViewerIndex] = useState(0);
  const [showCollectionModal, setShowCollectionModal] = useState(false);
  const [newCollectionName, setNewCollectionName] = useState('');

  useEffect(() => {
    loadVault();
    loadCollections();
  }, []);

  const loadVault = async () => {
    try {
      const res = await fetch('/api/vault', { credentials: 'include' });
      if (res.ok) {
        const data = await res.json();
        setItems(data.items || []);
      }
    } catch (error) {
      console.error('Failed to load vault:', error);
    } finally {
      setLoading(false);
    }
  };

  const loadCollections = async () => {
    try {
      const res = await fetch('/api/vault/collections', { credentials: 'include' });
      if (res.ok) {
        const data = await res.json();
        setCollections(data.collections || []);
      }
    } catch (error) {
      console.error('Failed to load collections:', error);
    }
  };

  const createCollection = async () => {
    if (!newCollectionName.trim()) return;
    
    try {
      const res = await fetch('/api/vault/collections', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({ name: newCollectionName })
      });
      
      if (res.ok) {
        setNewCollectionName('');
        setShowCollectionModal(false);
        loadCollections();
      }
    } catch (error) {
      console.error('Failed to create collection:', error);
    }
  };

  const toggleFavorite = async (itemId, currentState) => {
    try {
      await fetch(`/api/vault/${itemId}/favorite`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({ isFavorite: !currentState })
      });
      loadVault();
    } catch (error) {
      console.error('Failed to toggle favorite:', error);
    }
  };

  const deleteItem = async (itemId) => {
    if (!confirm('Delete this image from your vault?')) return;
    
    try {
      await fetch(`/api/vault/${itemId}`, {
        method: 'DELETE',
        credentials: 'include'
      });
      loadVault();
    } catch (error) {
      console.error('Failed to delete item:', error);
    }
  };

  const openViewer = (item, index) => {
    const images = filteredItems.map(i => ({
      url: i.asset?.url || i.imageOutput?.url,
      provider: i.title || 'Image'
    }));
    setViewerImages(images);
    setViewerIndex(index);
  };

  // Filter items
  const filteredItems = items.filter(item => {
    if (selectedCollection !== 'all' && item.collectionId !== selectedCollection) {
      return false;
    }
    if (filterFavorites && !item.isFavorite) {
      return false;
    }
    if (searchQuery) {
      const query = searchQuery.toLowerCase();
      return (
        item.title?.toLowerCase().includes(query) ||
        item.tags?.toLowerCase().includes(query) ||
        item.notes?.toLowerCase().includes(query)
      );
    }
    return true;
  });

  return (
    <div className="min-h-screen bg-slate-950 pb-20">
      {/* Header */}
      <div className="bg-gradient-to-r from-indigo-500 to-purple-500 pt-12 pb-6 px-6">
        <div className="max-w-4xl mx-auto">
          <h1 className="text-2xl font-bold text-white mb-4">My Vault</h1>
          
          {/* Search Bar */}
          <div className="relative">
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search by title, tags, or notes..."
              className="w-full px-4 py-3 pl-12 bg-white/10 backdrop-blur-sm border border-white/20 rounded-xl text-white placeholder-white/60 focus:outline-none focus:ring-2 focus:ring-white/50"
            />
            <svg className="w-5 h-5 text-white/60 absolute left-4 top-1/2 -translate-y-1/2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
            </svg>
          </div>
        </div>
      </div>

      <div className="max-w-4xl mx-auto px-6 py-6">
        {/* Filter Bar */}
        <div className="flex items-center justify-between mb-6 gap-4 overflow-x-auto pb-2">
          <div className="flex items-center space-x-2 flex-shrink-0">
            <button
              onClick={() => setSelectedCollection('all')}
              className={`px-4 py-2 rounded-xl font-medium transition-all ${
                selectedCollection === 'all'
                  ? 'bg-indigo-500 text-white'
                  : 'bg-slate-900 text-slate-400 hover:text-white'
              }`}
            >
              All
            </button>
            {collections.map(collection => (
              <button
                key={collection.id}
                onClick={() => setSelectedCollection(collection.id)}
                className={`px-4 py-2 rounded-xl font-medium transition-all whitespace-nowrap ${
                  selectedCollection === collection.id
                    ? 'bg-indigo-500 text-white'
                    : 'bg-slate-900 text-slate-400 hover:text-white'
                }`}
              >
                {collection.name}
              </button>
            ))}
            <button
              onClick={() => setShowCollectionModal(true)}
              className="px-4 py-2 rounded-xl bg-slate-900 text-slate-400 hover:text-white transition-colors"
            >
              + New
            </button>
          </div>

          <button
            onClick={() => setFilterFavorites(!filterFavorites)}
            className={`px-4 py-2 rounded-xl transition-all flex items-center space-x-2 flex-shrink-0 ${
              filterFavorites
                ? 'bg-pink-500 text-white'
                : 'bg-slate-900 text-slate-400 hover:text-white'
            }`}
          >
            <svg className="w-5 h-5" fill={filterFavorites ? 'currentColor' : 'none'} stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
            </svg>
            <span>Favorites</span>
          </button>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-3 gap-4 mb-6">
          <div className="bg-slate-900 rounded-xl p-4 border border-slate-800">
            <p className="text-slate-400 text-sm">Total Images</p>
            <p className="text-2xl font-bold text-white">{items.length}</p>
          </div>
          <div className="bg-slate-900 rounded-xl p-4 border border-slate-800">
            <p className="text-slate-400 text-sm">Collections</p>
            <p className="text-2xl font-bold text-white">{collections.length}</p>
          </div>
          <div className="bg-slate-900 rounded-xl p-4 border border-slate-800">
            <p className="text-slate-400 text-sm">Favorites</p>
            <p className="text-2xl font-bold text-white">{items.filter(i => i.isFavorite).length}</p>
          </div>
        </div>

        {/* Grid */}
        {loading ? (
          <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
            {[1, 2, 3, 4, 5, 6].map(i => (
              <SkeletonLoader key={i} type="image" />
            ))}
          </div>
        ) : filteredItems.length === 0 ? (
          <div className="text-center py-12 bg-slate-900 rounded-2xl border border-slate-800">
            <svg className="w-16 h-16 mx-auto text-slate-600 mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
            </svg>
            <p className="text-slate-400 mb-2">No images found</p>
            <p className="text-slate-500 text-sm">
              {searchQuery ? 'Try a different search' : 'Generate some images to get started!'}
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
            {filteredItems.map((item, idx) => (
              <div
                key={item.id}
                className="relative group animate-fade-in"
                style={{ animationDelay: `${idx * 30}ms` }}
              >
                <div
                  onClick={() => openViewer(item, idx)}
                  className="aspect-square rounded-xl overflow-hidden bg-slate-900 cursor-pointer"
                >
                  <img
                    src={item.asset?.url || item.imageOutput?.url}
                    alt={item.title || 'Image'}
                    className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-300"
                  />
                </div>
                
                {/* Overlay Actions */}
                <div className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 transition-opacity rounded-xl flex items-center justify-center space-x-2">
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      toggleFavorite(item.id, item.isFavorite);
                    }}
                    className="w-10 h-10 rounded-full bg-white/20 backdrop-blur-sm flex items-center justify-center hover:bg-white/30 transition-colors"
                  >
                    <svg className="w-5 h-5 text-white" fill={item.isFavorite ? 'currentColor' : 'none'} stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
                    </svg>
                  </button>
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      deleteItem(item.id);
                    }}
                    className="w-10 h-10 rounded-full bg-white/20 backdrop-blur-sm flex items-center justify-center hover:bg-red-500/80 transition-colors"
                  >
                    <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                    </svg>
                  </button>
                </div>

                {/* Favorite Badge */}
                {item.isFavorite && (
                  <div className="absolute top-2 right-2 w-8 h-8 rounded-full bg-pink-500 flex items-center justify-center">
                    <svg className="w-4 h-4 text-white" fill="currentColor" viewBox="0 0 24 24">
                      <path d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
                    </svg>
                  </div>
                )}

                {/* Title */}
                {item.title && (
                  <p className="mt-2 text-sm text-slate-300 line-clamp-1">{item.title}</p>
                )}
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Collection Modal */}
      {showCollectionModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 p-4">
          <div className="bg-slate-900 rounded-2xl p-6 max-w-md w-full">
            <h3 className="text-xl font-bold text-white mb-4">New Collection</h3>
            <input
              type="text"
              value={newCollectionName}
              onChange={(e) => setNewCollectionName(e.target.value)}
              placeholder="Collection name"
              className="w-full px-4 py-3 bg-slate-800 border border-slate-700 rounded-xl text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-indigo-500 mb-4"
              autoFocus
            />
            <div className="flex space-x-3">
              <button
                onClick={() => setShowCollectionModal(false)}
                className="flex-1 py-3 bg-slate-800 text-white rounded-xl hover:bg-slate-700 transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={createCollection}
                className="flex-1 py-3 bg-gradient-to-r from-indigo-500 to-purple-500 text-white rounded-xl hover:shadow-lg transition-all"
              >
                Create
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Image Viewer */}
      {viewerImages && (
        <ImageViewer
          images={viewerImages}
          initialIndex={viewerIndex}
          onClose={() => setViewerImages(null)}
        />
      )}

      <BottomNav />
    </div>
  );
}
