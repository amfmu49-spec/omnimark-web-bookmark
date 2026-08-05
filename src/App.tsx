import React, { useState, useEffect, useMemo, useCallback } from 'react';
import { Bookmark, Collection, FilterOptions, SyncState, BookmarkCategory } from './types';
import { INITIAL_BOOKMARKS, INITIAL_COLLECTIONS } from './data/sampleBookmarks';
import { Header } from './components/Header';
import { Sidebar } from './components/Sidebar';
import { BookmarkGrid } from './components/BookmarkGrid';
import { BookmarkList } from './components/BookmarkList';
import { BookmarkKanban } from './components/BookmarkKanban';
import { AddBookmarkModal } from './components/AddBookmarkModal';
import { SyncModal } from './components/SyncModal';
import { BookmarkDetailModal } from './components/BookmarkDetailModal';
import { BookmarkletModal } from './components/BookmarkletModal';
import { ImportExportModal } from './components/ImportExportModal';
import { BookmarkPlus, RefreshCw, Sparkles, Filter, SlidersHorizontal, Check } from 'lucide-react';

export default function App() {
  // Load initial sync code from URL query parameter or LocalStorage
  const getInitialSyncCode = () => {
    const params = new URLSearchParams(window.location.search);
    const syncParam = params.get('sync');
    if (syncParam) {
      return syncParam.toUpperCase().trim();
    }
    const saved = localStorage.getItem('omnimark_sync_code');
    if (saved) return saved;
    const randomNum = Math.floor(1000 + Math.random() * 9000);
    return `SYNC-${randomNum}-JP`;
  };

  const [syncState, setSyncState] = useState<SyncState>({
    syncCode: getInitialSyncCode(),
    lastSyncedAt: null,
    isSyncing: false,
    isOnline: true,
    connectedDevicesCount: 1,
  });

  // State
  const [bookmarks, setBookmarks] = useState<Bookmark[]>(() => {
    const saved = localStorage.getItem('omnimark_bookmarks');
    if (saved) {
      try {
        return JSON.parse(saved);
      } catch (e) {
        console.error('Failed to parse saved bookmarks', e);
      }
    }
    return INITIAL_BOOKMARKS;
  });

  const [collections, setCollections] = useState<Collection[]>(() => {
    const saved = localStorage.getItem('omnimark_collections');
    if (saved) {
      try {
        return JSON.parse(saved);
      } catch (e) {
        console.error('Failed to parse saved collections', e);
      }
    }
    return INITIAL_COLLECTIONS;
  });

  const [filterOptions, setFilterOptions] = useState<FilterOptions>({
    searchQuery: '',
    selectedCategory: 'all',
    selectedTags: [],
    selectedCollection: 'all',
    viewMode: 'grid',
    sortBy: 'newest',
    favoriteOnly: false,
    pinnedOnly: false,
    archivedOnly: false,
    readStatus: 'all',
  });

  // Modals visibility
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [initialUrlForAdd, setInitialUrlForAdd] = useState('');
  const [isSyncModalOpen, setIsSyncModalOpen] = useState(false);
  const [isBookmarkletModalOpen, setIsBookmarkletModalOpen] = useState(false);
  const [isImportExportModalOpen, setIsImportExportModalOpen] = useState(false);
  const [selectedBookmarkDetail, setSelectedBookmarkDetail] = useState<Bookmark | null>(null);
  const [isMobileSidebarOpen, setIsMobileSidebarOpen] = useState(false);
  const [isAddingQuick, setIsAddingQuick] = useState(false);

  // Save to local storage whenever bookmarks or collections change
  useEffect(() => {
    localStorage.setItem('omnimark_bookmarks', JSON.stringify(bookmarks));
  }, [bookmarks]);

  useEffect(() => {
    localStorage.setItem('omnimark_collections', JSON.stringify(collections));
  }, [collections]);

  useEffect(() => {
    localStorage.setItem('omnimark_sync_code', syncState.syncCode);
  }, [syncState.syncCode]);

  // Sync logic with backend Express server (/api/sync/:syncCode)
  const syncWithServer = useCallback(
    async (codeToSync: string, localBookmarks: Bookmark[], localCollections: Collection[]) => {
      setSyncState((prev) => ({ ...prev, isSyncing: true }));
      try {
        // Fetch remote state
        const getRes = await fetch(`/api/sync/${codeToSync}`);
        if (getRes.ok) {
          const remoteData = await getRes.json();
          if (remoteData.exists && remoteData.bookmarks) {
            // Merge remote and local bookmarks cleanly by ID
            const remoteMap = new Map<string, Bookmark>();
            remoteData.bookmarks.forEach((b: Bookmark) => remoteMap.set(b.id, b));
            localBookmarks.forEach((b) => {
              if (!remoteMap.has(b.id)) {
                remoteMap.set(b.id, b);
              }
            });
            const mergedBookmarks = Array.from(remoteMap.values());
            setBookmarks(mergedBookmarks);

            if (remoteData.collections) {
              const colMap = new Map<string, Collection>();
              remoteData.collections.forEach((c: Collection) => colMap.set(c.id, c));
              localCollections.forEach((c) => colMap.set(c.id, c));
              setCollections(Array.from(colMap.values()));
            }

            // Push updated merged state back to server
            await fetch(`/api/sync/${codeToSync}`, {
              method: 'POST',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify({
                bookmarks: mergedBookmarks,
                collections: localCollections,
              }),
            });
          } else {
            // Initial upload to server
            await fetch(`/api/sync/${codeToSync}`, {
              method: 'POST',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify({
                bookmarks: localBookmarks,
                collections: localCollections,
              }),
            });
          }
        }
        setSyncState((prev) => ({
          ...prev,
          isSyncing: false,
          isOnline: true,
          lastSyncedAt: new Date().toISOString(),
        }));
      } catch (err) {
        console.log('Server sync attempt offline / fallback', err);
        setSyncState((prev) => ({ ...prev, isSyncing: false, isOnline: false }));
      }
    },
    []
  );

  // Sync on mount and periodically every 10 seconds for real-time PC <-> Phone sync!
  useEffect(() => {
    syncWithServer(syncState.syncCode, bookmarks, collections);

    const interval = setInterval(() => {
      syncWithServer(syncState.syncCode, bookmarks, collections);
    }, 10000);

    return () => clearInterval(interval);
  }, [syncState.syncCode]);

  // Toast notification state
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 4000);
  };

  // Check URL query parameters for Bookmarklet or Mobile Share Target on mount
  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const quickUrlParam = params.get('quickUrl');
    const urlParam = params.get('url');
    const textParam = params.get('text');
    const titleParam = params.get('title');

    let targetUrl = quickUrlParam || urlParam;

    if (!targetUrl && textParam) {
      // Extract URL from shared text if available
      const urlMatch = textParam.match(/(https?:\/\/[^\s]+)/i);
      if (urlMatch) {
        targetUrl = urlMatch[0];
      }
    }

    if (targetUrl) {
      handleQuickAddUrl(targetUrl, titleParam || undefined);
      showToast('📱 スマホ共有 / ブックマークレットから新しいリンクをAI保存しました！');
      // Clean query params from address bar
      window.history.replaceState({}, document.title, window.location.pathname);
    }
  }, []);

  // Quick Add URL via top header, bookmarklet, or mobile share target
  const handleQuickAddUrl = async (urlToAdd: string, customTitle?: string) => {
    setIsAddingQuick(true);
    try {
      const res = await fetch('/api/metadata', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ url: urlToAdd }),
      });

      let newBm: Bookmark;
      if (res.ok) {
        const data = await res.json();
        newBm = {
          id: `bm-${Date.now()}`,
          url: data.url || urlToAdd,
          title: customTitle || data.title || urlToAdd,
          description: data.description || '',
          favicon: data.favicon || `https://www.google.com/s2/favicons?domain=${urlToAdd}&sz=64`,
          coverImage: data.coverImage,
          category: data.category || 'article',
          tags: data.suggestedTags || ['Web'],
          collectionId: collections[0]?.id || 'work',
          notes: '',
          isFavorite: false,
          isPinned: false,
          isArchived: false,
          readStatus: 'unread',
          rating: 0,
          aiSummary: data.aiSummary || '',
          aiKeyTakeaways: data.aiKeyTakeaways || [],
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString(),
        };
      } else {
        newBm = {
          id: `bm-${Date.now()}`,
          url: urlToAdd,
          title: customTitle || urlToAdd,
          description: '',
          favicon: `https://www.google.com/s2/favicons?domain=${urlToAdd}&sz=64`,
          category: 'article',
          tags: ['Web'],
          collectionId: collections[0]?.id || 'work',
          notes: '',
          isFavorite: false,
          isPinned: false,
          isArchived: false,
          readStatus: 'unread',
          rating: 0,
          aiSummary: 'Webページブックマーク',
          aiKeyTakeaways: [],
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString(),
        };
      }

      const updated = [newBm, ...bookmarks];
      setBookmarks(updated);
      syncWithServer(syncState.syncCode, updated, collections);
      showToast(`✨ 「${newBm.title.slice(0, 20)}...」を保存しました`);
    } catch (err) {
      console.error(err);
    } finally {
      setIsAddingQuick(false);
    }
  };

  // Switch Sync Code
  const handleUpdateSyncCode = async (newCode: string) => {
    setSyncState((prev) => ({ ...prev, syncCode: newCode }));
    await syncWithServer(newCode, bookmarks, collections);
  };

  // Force Manual Sync Now
  const handleForceSync = async () => {
    await syncWithServer(syncState.syncCode, bookmarks, collections);
  };

  // Add new Bookmark manually
  const handleSaveBookmark = (bmData: Omit<Bookmark, 'id' | 'createdAt' | 'updatedAt'>) => {
    const newBm: Bookmark = {
      ...bmData,
      id: `bm-${Date.now()}`,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };
    const updated = [newBm, ...bookmarks];
    setBookmarks(updated);
    syncWithServer(syncState.syncCode, updated, collections);
  };

  // Toggle Favorite
  const handleToggleFavorite = (id: string) => {
    const updated = bookmarks.map((b) => (b.id === id ? { ...b, isFavorite: !b.isFavorite } : b));
    setBookmarks(updated);
    if (selectedBookmarkDetail?.id === id) {
      setSelectedBookmarkDetail((prev) => (prev ? { ...prev, isFavorite: !prev.isFavorite } : null));
    }
    syncWithServer(syncState.syncCode, updated, collections);
  };

  // Toggle Pin
  const handleTogglePin = (id: string) => {
    const updated = bookmarks.map((b) => (b.id === id ? { ...b, isPinned: !b.isPinned } : b));
    setBookmarks(updated);
    syncWithServer(syncState.syncCode, updated, collections);
  };

  // Update Read Status
  const handleUpdateReadStatus = (id: string, status: 'unread' | 'reading' | 'read') => {
    const updated = bookmarks.map((b) => (b.id === id ? { ...b, readStatus: status } : b));
    setBookmarks(updated);
    syncWithServer(syncState.syncCode, updated, collections);
  };

  // Delete Bookmark
  const handleDeleteBookmark = (id: string) => {
    const updated = bookmarks.filter((b) => b.id !== id);
    setBookmarks(updated);
    if (selectedBookmarkDetail?.id === id) {
      setSelectedBookmarkDetail(null);
    }
    syncWithServer(syncState.syncCode, updated, collections);
  };

  // Update Bookmark details from Detail Modal
  const handleUpdateBookmark = (updatedBm: Bookmark) => {
    const updated = bookmarks.map((b) => (b.id === updatedBm.id ? updatedBm : b));
    setBookmarks(updated);
    setSelectedBookmarkDetail(updatedBm);
    syncWithServer(syncState.syncCode, updated, collections);
  };

  // Add Custom Collection
  const handleAddCollection = (name: string, color: string) => {
    const newCol: Collection = {
      id: `col-${Date.now()}`,
      name,
      icon: 'Folder',
      color,
    };
    const updated = [...collections, newCol];
    setCollections(updated);
    syncWithServer(syncState.syncCode, bookmarks, updated);
  };

  // Import Bookmarks
  const handleImportBookmarks = (imported: Bookmark[]) => {
    const mergedMap = new Map<string, Bookmark>();
    bookmarks.forEach((b) => mergedMap.set(b.id, b));
    imported.forEach((b) => mergedMap.set(b.id, b));
    const updated = Array.from(mergedMap.values());
    setBookmarks(updated);
    syncWithServer(syncState.syncCode, updated, collections);
  };

  // Extract all tags with counts
  const allTags = useMemo(() => {
    const counts: Record<string, number> = {};
    bookmarks.forEach((b) => {
      b.tags?.forEach((t) => {
        counts[t] = (counts[t] || 0) + 1;
      });
    });
    return Object.entries(counts)
      .map(([name, count]) => ({ name, count }))
      .sort((a, b) => b.count - a.count);
  }, [bookmarks]);

  // Compute counts for sidebar
  const totalCounts = useMemo(() => {
    const categoriesCount: Record<string, number> = {};
    let favorites = 0;
    let pinned = 0;
    let unread = 0;
    let archived = 0;

    bookmarks.forEach((b) => {
      if (b.isFavorite) favorites++;
      if (b.isPinned) pinned++;
      if (b.readStatus === 'unread') unread++;
      if (b.isArchived) archived++;
      categoriesCount[b.category] = (categoriesCount[b.category] || 0) + 1;
    });

    return {
      all: bookmarks.length,
      favorites,
      pinned,
      unread,
      archived,
      categories: categoriesCount,
    };
  }, [bookmarks]);

  // Filtered and Sorted Bookmarks list
  const filteredBookmarks = useMemo(() => {
    return bookmarks
      .filter((b) => {
        // Search query
        if (filterOptions.searchQuery.trim()) {
          const q = filterOptions.searchQuery.toLowerCase();
          const matchTitle = b.title.toLowerCase().includes(q);
          const matchUrl = b.url.toLowerCase().includes(q);
          const matchNotes = b.notes.toLowerCase().includes(q);
          const matchSummary = b.aiSummary.toLowerCase().includes(q);
          const matchTags = b.tags?.some((t) => t.toLowerCase().includes(q));
          if (!matchTitle && !matchUrl && !matchNotes && !matchSummary && !matchTags) {
            return false;
          }
        }

        // Category filter
        if (filterOptions.selectedCategory !== 'all' && b.category !== filterOptions.selectedCategory) {
          return false;
        }

        // Collection filter
        if (filterOptions.selectedCollection !== 'all' && b.collectionId !== filterOptions.selectedCollection) {
          return false;
        }

        // Tags filter
        if (filterOptions.selectedTags.length > 0) {
          const hasAllTags = filterOptions.selectedTags.every((t) => b.tags?.includes(t));
          if (!hasAllTags) return false;
        }

        // Favorite filter
        if (filterOptions.favoriteOnly && !b.isFavorite) return false;

        // Pinned filter
        if (filterOptions.pinnedOnly && !b.isPinned) return false;

        // Archived filter
        if (filterOptions.archivedOnly ? !b.isArchived : b.isArchived) return false;

        // Read Status filter
        if (filterOptions.readStatus !== 'all' && b.readStatus !== filterOptions.readStatus) {
          return false;
        }

        return true;
      })
      .sort((a, b) => {
        // Pinned bookmarks always stay on top
        if (a.isPinned !== b.isPinned) return a.isPinned ? -1 : 1;

        if (filterOptions.sortBy === 'newest') {
          return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
        }
        if (filterOptions.sortBy === 'oldest') {
          return new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime();
        }
        if (filterOptions.sortBy === 'title') {
          return a.title.localeCompare(b.title, 'ja');
        }
        return 0;
      });
  }, [bookmarks, filterOptions]);

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col font-sans antialiased">
      {/* Top Header */}
      <Header
        filterOptions={filterOptions}
        setFilterOptions={setFilterOptions}
        syncState={syncState}
        onOpenAddModal={(url) => {
          setInitialUrlForAdd(url || '');
          setIsAddModalOpen(true);
        }}
        onOpenSyncModal={() => setIsSyncModalOpen(true)}
        onOpenBookmarkletModal={() => setIsBookmarkletModalOpen(true)}
        onOpenImportExportModal={() => setIsImportExportModalOpen(true)}
        onQuickAddUrl={handleQuickAddUrl}
        isAddingQuick={isAddingQuick}
        isMobileSidebarOpen={isMobileSidebarOpen}
        setIsMobileSidebarOpen={setIsMobileSidebarOpen}
        totalBookmarksCount={bookmarks.length}
      />

      {/* Main Body */}
      <div className="flex-1 flex max-w-7xl w-full mx-auto">
        {/* Sidebar Navigation */}
        <Sidebar
          filterOptions={filterOptions}
          setFilterOptions={setFilterOptions}
          collections={collections}
          onAddCollection={handleAddCollection}
          allTags={allTags}
          totalCounts={totalCounts}
          onOpenSyncModal={() => setIsSyncModalOpen(true)}
          onOpenBookmarkletModal={() => setIsBookmarkletModalOpen(true)}
          onOpenImportExportModal={() => setIsImportExportModalOpen(true)}
          isMobileOpen={isMobileSidebarOpen}
          onCloseMobile={() => setIsMobileSidebarOpen(false)}
        />

        {/* Content Area */}
        <main className="flex-1 p-4 sm:p-6 lg:p-8 space-y-6 overflow-x-hidden min-w-0">
          {/* Active Filter Chips Bar */}
          <div className="flex flex-wrap items-center justify-between gap-3 pb-2 border-b border-slate-800">
            <div className="flex flex-wrap items-center gap-2 text-xs">
              <span className="font-semibold text-slate-400">表示中のブックマーク:</span>
              <span className="px-2.5 py-1 bg-indigo-600/20 text-indigo-300 border border-indigo-500/30 rounded-lg font-bold">
                {filteredBookmarks.length} 件
              </span>

              {filterOptions.selectedCategory !== 'all' && (
                <span className="px-2 py-0.5 bg-slate-800 text-slate-300 rounded-lg">
                  カテゴリ: {filterOptions.selectedCategory}
                </span>
              )}

              {filterOptions.selectedCollection !== 'all' && (
                <span className="px-2 py-0.5 bg-slate-800 text-slate-300 rounded-lg">
                  📁 {collections.find((c) => c.id === filterOptions.selectedCollection)?.name}
                </span>
              )}

              {filterOptions.selectedTags.map((tag) => (
                <span
                  key={tag}
                  className="px-2 py-0.5 bg-indigo-500/20 text-indigo-300 rounded-lg flex items-center gap-1"
                >
                  #{tag}
                  <button
                    onClick={() =>
                      setFilterOptions((prev) => ({
                        ...prev,
                        selectedTags: prev.selectedTags.filter((t) => t !== tag),
                      }))
                    }
                    className="hover:text-rose-400 ml-1"
                  >
                    ×
                  </button>
                </span>
              ))}

              {filterOptions.favoriteOnly && (
                <span className="px-2 py-0.5 bg-amber-500/20 text-amber-300 rounded-lg">
                  ⭐ お気に入り
                </span>
              )}
            </div>

            {/* Sort Dropdown */}
            <div className="flex items-center gap-2 text-xs">
              <span className="text-slate-400 hidden sm:inline">並び替え:</span>
              <select
                value={filterOptions.sortBy}
                onChange={(e) =>
                  setFilterOptions((prev) => ({ ...prev, sortBy: e.target.value as any }))
                }
                className="px-2.5 py-1 bg-slate-900 border border-slate-800 rounded-lg text-xs text-slate-200 focus:outline-none"
              >
                <option value="newest">📅 追加日時 (新しい順)</option>
                <option value="oldest">📅 追加日時 (古い順)</option>
                <option value="title">🔤 タイトル順</option>
              </select>
            </div>
          </div>

          {/* Bookmarks Display Area */}
          {filteredBookmarks.length === 0 ? (
            <div className="p-12 text-center bg-slate-900/60 border border-slate-800 rounded-2xl space-y-4 max-w-md mx-auto my-12">
              <div className="w-16 h-16 rounded-2xl bg-indigo-500/10 text-indigo-400 flex items-center justify-center mx-auto border border-indigo-500/20">
                <BookmarkPlus className="w-8 h-8" />
              </div>
              <div className="space-y-1">
                <h3 className="font-bold text-base text-white">該当するブックマークが見つかりません</h3>
                <p className="text-xs text-slate-400">
                  検索ワードやフィルター条件を変更するか、上の「ブックマーク追加」から新しいWebリンクを登録してください。
                </p>
              </div>
              <button
                type="button"
                id="empty-state-add-btn"
                onClick={() => setIsAddModalOpen(true)}
                className="px-4 py-2 bg-indigo-600 hover:bg-indigo-500 text-white font-medium text-xs rounded-xl shadow-lg shadow-indigo-600/30 transition"
              >
                + ブックマークを追加する
              </button>
            </div>
          ) : filterOptions.viewMode === 'grid' ? (
            <BookmarkGrid
              bookmarks={filteredBookmarks}
              collections={collections}
              onToggleFavorite={handleToggleFavorite}
              onTogglePin={handleTogglePin}
              onUpdateReadStatus={handleUpdateReadStatus}
              onDeleteBookmark={handleDeleteBookmark}
              onOpenDetailModal={(bm) => setSelectedBookmarkDetail(bm)}
              onSelectTag={(tag) =>
                setFilterOptions((prev) => ({
                  ...prev,
                  selectedTags: prev.selectedTags.includes(tag) ? prev.selectedTags : [...prev.selectedTags, tag],
                }))
              }
            />
          ) : filterOptions.viewMode === 'list' ? (
            <BookmarkList
              bookmarks={filteredBookmarks}
              collections={collections}
              onToggleFavorite={handleToggleFavorite}
              onTogglePin={handleTogglePin}
              onUpdateReadStatus={handleUpdateReadStatus}
              onDeleteBookmark={handleDeleteBookmark}
              onOpenDetailModal={(bm) => setSelectedBookmarkDetail(bm)}
              onSelectTag={(tag) =>
                setFilterOptions((prev) => ({
                  ...prev,
                  selectedTags: prev.selectedTags.includes(tag) ? prev.selectedTags : [...prev.selectedTags, tag],
                }))
              }
            />
          ) : (
            <BookmarkKanban
              bookmarks={filteredBookmarks}
              collections={collections}
              onToggleFavorite={handleToggleFavorite}
              onUpdateReadStatus={handleUpdateReadStatus}
              onOpenDetailModal={(bm) => setSelectedBookmarkDetail(bm)}
            />
          )}
        </main>
      </div>

      {/* Modals */}
      <AddBookmarkModal
        isOpen={isAddModalOpen}
        onClose={() => setIsAddModalOpen(false)}
        collections={collections}
        onSaveBookmark={handleSaveBookmark}
        initialUrl={initialUrlForAdd}
      />

      <SyncModal
        isOpen={isSyncModalOpen}
        onClose={() => setIsSyncModalOpen(false)}
        syncState={syncState}
        onUpdateSyncCode={handleUpdateSyncCode}
        onForceSync={handleForceSync}
      />

      <BookmarkDetailModal
        bookmark={selectedBookmarkDetail}
        onClose={() => setSelectedBookmarkDetail(null)}
        collections={collections}
        onUpdateBookmark={handleUpdateBookmark}
        onDeleteBookmark={handleDeleteBookmark}
      />

      <BookmarkletModal
        isOpen={isBookmarkletModalOpen}
        onClose={() => setIsBookmarkletModalOpen(false)}
        syncCode={syncState.syncCode}
      />

      <ImportExportModal
        isOpen={isImportExportModalOpen}
        onClose={() => setIsImportExportModalOpen(false)}
        bookmarks={bookmarks}
        onImportBookmarks={handleImportBookmarks}
      />

      {/* Toast Notification Banner */}
      {toastMessage && (
        <div className="fixed bottom-6 right-6 z-50 px-4 py-3 bg-indigo-600 text-white font-medium text-xs rounded-2xl shadow-2xl border border-indigo-400/40 flex items-center gap-2 animate-bounce-short">
          <Sparkles className="w-4 h-4 text-purple-300 shrink-0" />
          <span>{toastMessage}</span>
        </div>
      )}
    </div>
  );
}
