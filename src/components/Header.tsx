import React, { useState } from 'react';
import {
  BookmarkPlus,
  Search,
  Smartphone,
  Grid,
  List,
  Columns,
  Sparkles,
  QrCode,
  CheckCircle2,
  RefreshCw,
  FolderPlus,
  Download,
  BookmarkCheck,
} from 'lucide-react';
import { FilterOptions, ViewMode, SyncState } from '../types';

interface HeaderProps {
  filterOptions: FilterOptions;
  setFilterOptions: React.Dispatch<React.SetStateAction<FilterOptions>>;
  syncState: SyncState;
  onOpenAddModal: (initialUrl?: string) => void;
  onOpenSyncModal: () => void;
  onOpenBookmarkletModal: () => void;
  onOpenImportExportModal: () => void;
  onQuickAddUrl: (url: string) => Promise<void>;
  isAddingQuick: boolean;
  isMobileSidebarOpen: boolean;
  setIsMobileSidebarOpen: (open: boolean) => void;
  totalBookmarksCount: number;
}

export const Header: React.FC<HeaderProps> = ({
  filterOptions,
  setFilterOptions,
  syncState,
  onOpenAddModal,
  onOpenSyncModal,
  onOpenBookmarkletModal,
  onOpenImportExportModal,
  onQuickAddUrl,
  isAddingQuick,
  isMobileSidebarOpen,
  setIsMobileSidebarOpen,
  totalBookmarksCount,
}) => {
  const [quickUrl, setQuickUrl] = useState('');

  const handleQuickSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!quickUrl.trim()) return;
    await onQuickAddUrl(quickUrl);
    setQuickUrl('');
  };

  return (
    <header className="sticky top-0 z-30 bg-white/90 backdrop-blur-md border-b border-slate-200/80 text-slate-900 shadow-sm w-full overflow-hidden">
      {/* Top AI Gradient Accent Line */}
      <div className="h-0.5 w-full bg-gradient-to-r from-indigo-500 via-purple-500 to-pink-500"></div>
      <div className="max-w-7xl mx-auto px-3 sm:px-6 lg:px-8 py-2.5">
        <div className="flex items-center justify-between gap-2 sm:gap-3 w-full">
          {/* Brand & Mobile Sidebar Toggle */}
          <div className="flex items-center gap-2 sm:gap-3 shrink-0">
            <button
              type="button"
              id="mobile-menu-toggle-btn"
              onClick={() => setIsMobileSidebarOpen(!isMobileSidebarOpen)}
              className="lg:hidden p-1.5 text-slate-600 hover:text-slate-900 rounded-lg hover:bg-slate-100 transition"
              aria-label="メニュー切り替え"
            >
              <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
              </svg>
            </button>

            <div className="flex items-center gap-2">
              <div className="w-8 h-8 sm:w-10 sm:h-10 rounded-xl bg-gradient-to-tr from-indigo-500 via-purple-500 to-pink-500 p-0.5 shadow-md shadow-indigo-500/20 shrink-0">
                <div className="w-full h-full bg-white rounded-[10px] flex items-center justify-center">
                  <BookmarkCheck className="w-4 h-4 sm:w-5 sm:h-5 text-indigo-600" />
                </div>
              </div>
              <div>
                <div className="flex items-center gap-1.5">
                  <h1 className="font-extrabold text-base sm:text-xl tracking-tight bg-gradient-to-r from-indigo-600 via-purple-600 to-pink-600 bg-clip-text text-transparent">
                    AMUPOKE
                  </h1>
                  <span className="hidden sm:inline-block text-[10px] font-bold tracking-wide uppercase px-2 py-0.5 rounded-full bg-indigo-50 text-indigo-600 border border-indigo-200 shrink-0">
                    ver 1.0.0
                  </span>
                </div>
                <p className="text-xs text-slate-500 hidden md:block">萬能Webブックマーク & AIナレッジハブ</p>
              </div>
            </div>
          </div>

          {/* Quick Paste & AI Auto-Save Input */}
          <form onSubmit={handleQuickSubmit} className="hidden md:flex flex-1 max-w-xl mx-4">
            <div className="relative w-full flex items-center">
              <div className="absolute left-3 text-indigo-500 flex items-center gap-1">
                <Sparkles className="w-4 h-4 text-indigo-500" />
              </div>
              <input
                type="text"
                value={quickUrl}
                onChange={(e) => setQuickUrl(e.target.value)}
                placeholder="URLを貼り付けてAI自動要約ブックマーク保存 (https://...)"
                className="w-full pl-9 pr-24 py-2 bg-slate-50/80 border border-slate-200 rounded-xl text-sm text-slate-800 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-indigo-500/30 focus:border-indigo-500 transition shadow-inner"
              />
              <button
                type="submit"
                id="quick-add-submit-btn"
                disabled={isAddingQuick || !quickUrl.trim()}
                className="absolute right-1.5 px-3 py-1 bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-500 hover:to-purple-500 disabled:opacity-50 text-white font-medium text-xs rounded-lg transition flex items-center gap-1 shadow"
              >
                {isAddingQuick ? (
                  <>
                    <RefreshCw className="w-3.5 h-3.5 animate-spin" />
                    <span>解析中</span>
                  </>
                ) : (
                  <>
                    <Sparkles className="w-3.5 h-3.5" />
                    <span>AI追加</span>
                  </>
                )}
              </button>
            </div>
          </form>

          {/* Right Action Bar */}
          <div className="flex items-center gap-1.5 sm:gap-2 shrink-0">
            {/* View Mode Switcher */}
            <div className="flex items-center p-0.5 sm:p-1 bg-slate-100/90 rounded-xl border border-slate-200">
              <button
                type="button"
                id="view-mode-grid-btn"
                onClick={() => setFilterOptions((prev) => ({ ...prev, viewMode: 'grid' }))}
                className={`p-1.5 rounded-lg transition ${
                  filterOptions.viewMode === 'grid'
                    ? 'bg-gradient-to-r from-indigo-600 to-purple-600 text-white shadow-sm'
                    : 'text-slate-500 hover:text-slate-800'
                }`}
                title="カード表示"
              >
                <Grid className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
              </button>
              <button
                type="button"
                id="view-mode-list-btn"
                onClick={() => setFilterOptions((prev) => ({ ...prev, viewMode: 'list' }))}
                className={`p-1.5 rounded-lg transition ${
                  filterOptions.viewMode === 'list'
                    ? 'bg-gradient-to-r from-indigo-600 to-purple-600 text-white shadow-sm'
                    : 'text-slate-500 hover:text-slate-800'
                }`}
                title="リスト表示"
              >
                <List className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
              </button>
              <button
                type="button"
                id="view-mode-kanban-btn"
                onClick={() => setFilterOptions((prev) => ({ ...prev, viewMode: 'kanban' }))}
                className={`p-1.5 rounded-lg transition ${
                  filterOptions.viewMode === 'kanban'
                    ? 'bg-gradient-to-r from-indigo-600 to-purple-600 text-white shadow-sm'
                    : 'text-slate-500 hover:text-slate-800'
                }`}
                title="かんばん表示"
              >
                <Columns className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
              </button>
            </div>

            {/* Share / Bookmarklet Button (PC/Tablet only) */}
            <button
              type="button"
              id="open-share-bookmarklet-btn"
              onClick={onOpenBookmarkletModal}
              className="hidden lg:flex items-center gap-1 px-2.5 py-1.5 bg-purple-50 hover:bg-purple-100 text-purple-700 border border-purple-200 rounded-xl text-xs font-semibold transition shadow-sm"
              title="スマホのシェアボタン & PCブックマークレット追加設定"
            >
              <Sparkles className="w-3.5 h-3.5 text-purple-600 shrink-0" />
              <span>スマホ共有/拡張</span>
            </button>

            {/* Sync Status Badge (PC/Tablet only) */}
            <button
              type="button"
              id="sync-status-badge-btn"
              onClick={onOpenSyncModal}
              className={`hidden sm:flex items-center gap-1.5 px-3 py-1.5 rounded-xl border text-xs font-medium transition shadow-sm ${
                syncState.isSyncing
                  ? 'bg-amber-50 text-amber-700 border-amber-200 animate-pulse'
                  : syncState.isOnline
                  ? 'bg-emerald-50 text-emerald-700 border-emerald-200 hover:bg-emerald-100'
                  : 'bg-slate-100 text-slate-500 border-slate-200'
              }`}
              title="PC・スマホ同期設定"
            >
              <Smartphone className="w-3.5 h-3.5 shrink-0 text-emerald-600" />
              <span className="font-mono font-bold tracking-wide text-xs">{syncState.syncCode}</span>
            </button>

            {/* Primary Add Button */}
            <button
              type="button"
              id="open-add-modal-btn"
              onClick={() => onOpenAddModal()}
              className="px-2.5 py-1.5 sm:px-3.5 sm:py-2 bg-gradient-to-r from-indigo-600 via-purple-600 to-pink-600 hover:opacity-95 text-white font-medium text-xs sm:text-sm rounded-xl transition flex items-center gap-1 sm:gap-1.5 shadow-md shadow-indigo-500/20 shrink-0"
              title="ブックマークを新規追加"
            >
              <BookmarkPlus className="w-4 h-4" />
              <span className="hidden sm:inline">ブックマーク追加</span>
              <span className="sm:hidden text-xs">追加</span>
            </button>
          </div>
        </div>
      </div>
    </header>
  );
};
