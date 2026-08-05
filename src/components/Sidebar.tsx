import React, { useState } from 'react';
import {
  Bookmark,
  Star,
  Pin,
  Clock,
  Archive,
  FolderPlus,
  Folder,
  Tag,
  FileText,
  Video,
  Wrench,
  ShoppingBag,
  Code,
  Globe,
  Plus,
  Smartphone,
  BookmarkPlus,
  Download,
  Search,
  Filter,
  Check,
  ChevronRight,
  Layers,
  Sparkles,
} from 'lucide-react';
import { FilterOptions, Collection, BookmarkCategory } from '../types';

interface SidebarProps {
  filterOptions: FilterOptions;
  setFilterOptions: React.Dispatch<React.SetStateAction<FilterOptions>>;
  collections: Collection[];
  onAddCollection: (name: string, color: string) => void;
  allTags: { name: string; count: number }[];
  totalCounts: {
    all: number;
    favorites: number;
    pinned: number;
    unread: number;
    archived: number;
    categories: Record<string, number>;
  };
  onOpenSyncModal: () => void;
  onOpenBookmarkletModal: () => void;
  onOpenImportExportModal: () => void;
  isMobileOpen: boolean;
  onCloseMobile: () => void;
}

const CATEGORIES_LIST: { value: BookmarkCategory; label: string; icon: React.ReactNode }[] = [
  { value: 'article', label: '記事・ブログ', icon: <FileText className="w-4 h-4 text-sky-400" /> },
  { value: 'video', label: '動画・配信', icon: <Video className="w-4 h-4 text-rose-400" /> },
  { value: 'tool', label: 'ツール・Webアプリ', icon: <Wrench className="w-4 h-4 text-amber-400" /> },
  { value: 'product', label: '買い物・欲しいもの', icon: <ShoppingBag className="w-4 h-4 text-emerald-400" /> },
  { value: 'code', label: 'コード・GitHub', icon: <Code className="w-4 h-4 text-purple-400" /> },
  { value: 'doc', label: 'ドキュメント・資料', icon: <Folder className="w-4 h-4 text-indigo-400" /> },
  { value: 'other', label: 'その他', icon: <Globe className="w-4 h-4 text-slate-400" /> },
];

export const Sidebar: React.FC<SidebarProps> = ({
  filterOptions,
  setFilterOptions,
  collections,
  onAddCollection,
  allTags,
  totalCounts,
  onOpenSyncModal,
  onOpenBookmarkletModal,
  onOpenImportExportModal,
  isMobileOpen,
  onCloseMobile,
}) => {
  const [newColName, setNewColName] = useState('');
  const [showAddCol, setShowAddCol] = useState(false);
  const [tagSearch, setTagSearch] = useState('');

  const handleCreateCollection = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newColName.trim()) return;
    const colors = ['bg-indigo-500', 'bg-emerald-500', 'bg-purple-500', 'bg-rose-500', 'bg-amber-500'];
    const randomColor = colors[Math.floor(Math.random() * colors.length)];
    onAddCollection(newColName.trim(), randomColor);
    setNewColName('');
    setShowAddCol(false);
  };

  const handleToggleTag = (tagName: string) => {
    setFilterOptions((prev) => {
      const exists = prev.selectedTags.includes(tagName);
      const newTags = exists
        ? prev.selectedTags.filter((t) => t !== tagName)
        : [...prev.selectedTags, tagName];
      return { ...prev, selectedTags: newTags };
    });
  };

  const resetAllFilters = () => {
    setFilterOptions({
      searchQuery: '',
      selectedCategory: 'all',
      selectedTags: [],
      selectedCollection: 'all',
      viewMode: filterOptions.viewMode,
      sortBy: 'newest',
      favoriteOnly: false,
      pinnedOnly: false,
      archivedOnly: false,
      readStatus: 'all',
    });
  };

  const filteredTags = allTags.filter((t) => t.name.toLowerCase().includes(tagSearch.toLowerCase()));

  const content = (
    <div className="flex flex-col h-full bg-slate-900 border-r border-slate-800/80 text-slate-200 text-xs select-none">
      {/* Search Input Box */}
      <div className="p-3.5 border-b border-slate-800">
        <div className="relative">
          <Search className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
          <input
            type="text"
            value={filterOptions.searchQuery}
            onChange={(e) => setFilterOptions((prev) => ({ ...prev, searchQuery: e.target.value }))}
            placeholder="タイトル・メモ・URLを検索..."
            className="w-full pl-9 pr-3 py-1.5 bg-slate-950 border border-slate-800 rounded-xl text-xs text-slate-100 placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-indigo-500/50"
          />
        </div>
      </div>

      <div className="flex-1 overflow-y-auto px-3 py-3 space-y-5 custom-scrollbar">
        {/* Main Quick Filters */}
        <div className="space-y-1">
          <div className="px-2 text-[10px] font-semibold tracking-wider text-slate-400 uppercase">
            フィルター
          </div>

          <button
            type="button"
            onClick={resetAllFilters}
            className={`w-full flex items-center justify-between px-2.5 py-1.5 rounded-lg transition font-medium ${
              filterOptions.selectedCategory === 'all' &&
              !filterOptions.favoriteOnly &&
              !filterOptions.pinnedOnly &&
              !filterOptions.archivedOnly &&
              filterOptions.readStatus === 'all' &&
              filterOptions.selectedCollection === 'all' &&
              filterOptions.selectedTags.length === 0
                ? 'bg-indigo-600 text-white shadow'
                : 'text-slate-300 hover:bg-slate-800/60'
            }`}
          >
            <div className="flex items-center gap-2">
              <Layers className="w-4 h-4" />
              <span>すべてのブックマーク</span>
            </div>
            <span className="px-1.5 py-0.5 rounded-full bg-slate-800/80 text-[10px]">
              {totalCounts.all}
            </span>
          </button>

          <button
            type="button"
            onClick={() =>
              setFilterOptions((prev) => ({
                ...prev,
                favoriteOnly: !prev.favoriteOnly,
                archivedOnly: false,
              }))
            }
            className={`w-full flex items-center justify-between px-2.5 py-1.5 rounded-lg transition font-medium ${
              filterOptions.favoriteOnly
                ? 'bg-amber-500/20 text-amber-300 border border-amber-500/30'
                : 'text-slate-300 hover:bg-slate-800/60'
            }`}
          >
            <div className="flex items-center gap-2">
              <Star className="w-4 h-4 text-amber-400 fill-amber-400/20" />
              <span>お気に入り</span>
            </div>
            <span className="px-1.5 py-0.5 rounded-full bg-slate-800/80 text-[10px]">
              {totalCounts.favorites}
            </span>
          </button>

          <button
            type="button"
            onClick={() =>
              setFilterOptions((prev) => ({
                ...prev,
                readStatus: prev.readStatus === 'unread' ? 'all' : 'unread',
              }))
            }
            className={`w-full flex items-center justify-between px-2.5 py-1.5 rounded-lg transition font-medium ${
              filterOptions.readStatus === 'unread'
                ? 'bg-sky-500/20 text-sky-300 border border-sky-500/30'
                : 'text-slate-300 hover:bg-slate-800/60'
            }`}
          >
            <div className="flex items-center gap-2">
              <Clock className="w-4 h-4 text-sky-400" />
              <span>未読アイテム</span>
            </div>
            <span className="px-1.5 py-0.5 rounded-full bg-slate-800/80 text-[10px]">
              {totalCounts.unread}
            </span>
          </button>

          <button
            type="button"
            onClick={() =>
              setFilterOptions((prev) => ({
                ...prev,
                archivedOnly: !prev.archivedOnly,
                favoriteOnly: false,
              }))
            }
            className={`w-full flex items-center justify-between px-2.5 py-1.5 rounded-lg transition font-medium ${
              filterOptions.archivedOnly
                ? 'bg-purple-500/20 text-purple-300 border border-purple-500/30'
                : 'text-slate-300 hover:bg-slate-800/60'
            }`}
          >
            <div className="flex items-center gap-2">
              <Archive className="w-4 h-4 text-slate-400" />
              <span>アーカイブ</span>
            </div>
            <span className="px-1.5 py-0.5 rounded-full bg-slate-800/80 text-[10px]">
              {totalCounts.archived}
            </span>
          </button>
        </div>

        {/* Collections / Folders */}
        <div className="space-y-1 pt-2 border-t border-slate-800/80">
          <div className="flex items-center justify-between px-2 text-[10px] font-semibold tracking-wider text-slate-400 uppercase">
            <span>コレクション</span>
            <button
              type="button"
              onClick={() => setShowAddCol(!showAddCol)}
              className="p-1 hover:text-white rounded hover:bg-slate-800 transition"
              title="新しいコレクションを作成"
            >
              <Plus className="w-3.5 h-3.5" />
            </button>
          </div>

          {showAddCol && (
            <form onSubmit={handleCreateCollection} className="px-2 py-1.5 space-y-2">
              <input
                type="text"
                value={newColName}
                onChange={(e) => setNewColName(e.target.value)}
                placeholder="コレクション名"
                className="w-full px-2.5 py-1 bg-slate-950 border border-slate-700 rounded-lg text-xs text-white placeholder-slate-500 focus:outline-none focus:ring-1 focus:ring-indigo-500"
                autoFocus
              />
              <div className="flex gap-1 justify-end">
                <button
                  type="button"
                  onClick={() => setShowAddCol(false)}
                  className="px-2 py-0.5 bg-slate-800 text-slate-300 rounded text-[11px]"
                >
                  キャンセル
                </button>
                <button
                  type="submit"
                  className="px-2.5 py-0.5 bg-indigo-600 text-white rounded text-[11px] font-medium"
                >
                  作成
                </button>
              </div>
            </form>
          )}

          <button
            type="button"
            onClick={() => setFilterOptions((prev) => ({ ...prev, selectedCollection: 'all' }))}
            className={`w-full flex items-center justify-between px-2.5 py-1.5 rounded-lg transition font-medium ${
              filterOptions.selectedCollection === 'all'
                ? 'text-indigo-400 bg-slate-800/40'
                : 'text-slate-300 hover:bg-slate-800/60'
            }`}
          >
            <span>すべてのコレクション</span>
          </button>

          {collections.map((col) => (
            <button
              key={col.id}
              type="button"
              onClick={() =>
                setFilterOptions((prev) => ({
                  ...prev,
                  selectedCollection: prev.selectedCollection === col.id ? 'all' : col.id,
                }))
              }
              className={`w-full flex items-center justify-between px-2.5 py-1.5 rounded-lg transition ${
                filterOptions.selectedCollection === col.id
                  ? 'bg-indigo-600 text-white font-medium shadow'
                  : 'text-slate-300 hover:bg-slate-800/60'
              }`}
            >
              <div className="flex items-center gap-2 truncate">
                <span className={`w-2.5 h-2.5 rounded-full ${col.color || 'bg-indigo-500'}`}></span>
                <span className="truncate">{col.name}</span>
              </div>
            </button>
          ))}
        </div>

        {/* Categories */}
        <div className="space-y-1 pt-2 border-t border-slate-800/80">
          <div className="px-2 text-[10px] font-semibold tracking-wider text-slate-400 uppercase">
            カテゴリ
          </div>

          {CATEGORIES_LIST.map((cat) => {
            const count = totalCounts.categories[cat.value] || 0;
            const isSelected = filterOptions.selectedCategory === cat.value;
            return (
              <button
                key={cat.value}
                type="button"
                onClick={() =>
                  setFilterOptions((prev) => ({
                    ...prev,
                    selectedCategory: prev.selectedCategory === cat.value ? 'all' : cat.value,
                  }))
                }
                className={`w-full flex items-center justify-between px-2.5 py-1.5 rounded-lg transition ${
                  isSelected
                    ? 'bg-slate-800 text-white font-medium border border-slate-700'
                    : 'text-slate-300 hover:bg-slate-800/60'
                }`}
              >
                <div className="flex items-center gap-2">
                  {cat.icon}
                  <span>{cat.label}</span>
                </div>
                <span className="px-1.5 py-0.5 rounded-full bg-slate-950/80 text-[10px] text-slate-400">
                  {count}
                </span>
              </button>
            );
          })}
        </div>

        {/* Tag Cloud */}
        <div className="space-y-2 pt-2 border-t border-slate-800/80">
          <div className="flex items-center justify-between px-2 text-[10px] font-semibold tracking-wider text-slate-400 uppercase">
            <span>タグ一覧</span>
            {filterOptions.selectedTags.length > 0 && (
              <button
                type="button"
                onClick={() => setFilterOptions((prev) => ({ ...prev, selectedTags: [] }))}
                className="text-indigo-400 hover:underline text-[10px]"
              >
                クリア
              </button>
            )}
          </div>

          {allTags.length > 8 && (
            <div className="px-1">
              <input
                type="text"
                value={tagSearch}
                onChange={(e) => setTagSearch(e.target.value)}
                placeholder="タグ絞り込み..."
                className="w-full px-2 py-1 bg-slate-950 border border-slate-800 rounded text-[11px] text-slate-300 placeholder-slate-500 focus:outline-none"
              />
            </div>
          )}

          <div className="flex flex-wrap gap-1 px-1 max-h-48 overflow-y-auto custom-scrollbar">
            {filteredTags.map((t) => {
              const isSelected = filterOptions.selectedTags.includes(t.name);
              return (
                <button
                  key={t.name}
                  type="button"
                  onClick={() => handleToggleTag(t.name)}
                  className={`px-2 py-0.5 rounded-full text-[11px] font-medium transition flex items-center gap-1 ${
                    isSelected
                      ? 'bg-indigo-600 text-white shadow'
                      : 'bg-slate-800/80 text-slate-300 hover:bg-slate-700'
                  }`}
                >
                  <span>#{t.name}</span>
                  <span className="text-[10px] opacity-75">({t.count})</span>
                </button>
              );
            })}
          </div>
        </div>
      </div>

      {/* Sidebar Footer Actions */}
      <div className="p-3 border-t border-slate-800 space-y-1.5 bg-slate-950/60">
        <button
          type="button"
          onClick={onOpenSyncModal}
          className="w-full py-2 px-3 bg-indigo-500/10 hover:bg-indigo-500/20 text-indigo-300 border border-indigo-500/20 rounded-xl transition flex items-center justify-center gap-2 font-medium"
        >
          <Smartphone className="w-4 h-4" />
          <span>PC・スマホ同期設定</span>
        </button>

        <div className="grid grid-cols-2 gap-1.5">
          <button
            type="button"
            onClick={onOpenBookmarkletModal}
            className="py-1.5 px-2 bg-indigo-600/20 hover:bg-indigo-600/30 text-indigo-300 border border-indigo-500/30 rounded-lg transition flex items-center justify-center gap-1 text-[11px] font-medium"
            title="スマホ共有 & ブックマークレット連携"
          >
            <Sparkles className="w-3.5 h-3.5 text-purple-400" />
            <span>スマホ共有/拡張</span>
          </button>
          <button
            type="button"
            onClick={onOpenImportExportModal}
            className="py-1.5 px-2 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded-lg transition flex items-center justify-center gap-1 text-[11px]"
            title="インポート / エクスポート"
          >
            <Download className="w-3.5 h-3.5" />
            <span>入出力</span>
          </button>
        </div>
      </div>
    </div>
  );

  return (
    <>
      {/* Desktop Persistent Sidebar */}
      <aside className="hidden lg:block w-64 shrink-0 h-[calc(100vh-61px)] sticky top-[61px]">
        {content}
      </aside>

      {/* Mobile Drawer Overlay */}
      {isMobileOpen && (
        <div className="fixed inset-0 z-40 lg:hidden flex">
          <div
            className="fixed inset-0 bg-slate-950/80 backdrop-blur-sm"
            onClick={onCloseMobile}
          ></div>
          <div className="relative w-72 max-w-[80vw] bg-slate-900 h-full shadow-2xl z-50 animate-slide-in">
            {content}
          </div>
        </div>
      )}
    </>
  );
};
