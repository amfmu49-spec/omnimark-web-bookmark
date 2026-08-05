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
    <header className="sticky top-0 z-30 bg-slate-900/90 backdrop-blur-md border-b border-slate-800 text-slate-100 shadow-md">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-3">
        <div className="flex items-center justify-between gap-3">
          {/* Brand & Mobile Sidebar Toggle */}
          <div className="flex items-center gap-3">
            <button
              type="button"
              id="mobile-menu-toggle-btn"
              onClick={() => setIsMobileSidebarOpen(!isMobileSidebarOpen)}
              className="lg:hidden p-2 text-slate-400 hover:text-white rounded-lg hover:bg-slate-800 transition"
              aria-label="メニュー切り替え"
            >
              <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
              </svg>
            </button>

            <div className="flex items-center gap-2.5">
              <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-indigo-500 via-purple-500 to-pink-500 p-0.5 shadow-lg shadow-indigo-500/20">
                <div className="w-full h-full bg-slate-950 rounded-[10px] flex items-center justify-center">
                  <BookmarkCheck className="w-5 h-5 text-indigo-400" />
                </div>
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <h1 className="font-bold text-lg tracking-tight bg-gradient-to-r from-white via-indigo-100 to-purple-200 bg-clip-text text-transparent">
                    OmniMark
                  </h1>
                  <span className="hidden sm:inline-block text-[10px] font-semibold tracking-wide uppercase px-2 py-0.5 rounded-full bg-indigo-500/10 text-indigo-400 border border-indigo-500/20">
                    Sync & AI
                  </span>
                </div>
                <p className="text-xs text-slate-400 hidden md:block">萬能Webブックマーク & ナレッジハブ</p>
              </div>
            </div>
          </div>

          {/* Quick Paste & AI Auto-Save Input */}
          <form onSubmit={handleQuickSubmit} className="hidden md:flex flex-1 max-w-xl mx-4">
            <div className="relative w-full flex items-center">
              <div className="absolute left-3 text-slate-400 flex items-center gap-1">
                <Sparkles className="w-4 h-4 text-indigo-400" />
              </div>
              <input
                type="text"
                value={quickUrl}
                onChange={(e) => setQuickUrl(e.target.value)}
                placeholder="URLを貼り付けてAI自動要約ブックマーク保存 (https://...)"
                className="w-full pl-9 pr-24 py-2 bg-slate-950/80 border border-slate-700/80 rounded-xl text-sm text-slate-200 placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-indigo-500/50 focus:border-indigo-500 transition shadow-inner"
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
          <div className="flex items-center gap-1.5 sm:gap-2">
            {/* View Mode Switcher (Available on both Mobile & PC) */}
            <div className="flex items-center p-0.5 sm:p-1 bg-slate-950 rounded-xl border border-slate-800">
              <button
                type="button"
                id="view-mode-grid-btn"
                onClick={() => setFilterOptions((prev) => ({ ...prev, viewMode: 'grid' }))}
                className={`p-1.5 rounded-lg transition ${
                  filterOptions.viewMode === 'grid'
                    ? 'bg-indigo-600 text-white shadow'
                    : 'text-slate-400 hover:text-slate-200'
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
                    ? 'bg-indigo-600 text-white shadow'
                    : 'text-slate-400 hover:text-slate-200'
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
                    ? 'bg-indigo-600 text-white shadow'
                    : 'text-slate-400 hover:text-slate-200'
                }`}
                title="かんばん表示"
              >
                <Columns className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
              </button>
            </div>

            {/* Share / Bookmarklet Button */}
            <button
              type="button"
              id="open-share-bookmarklet-btn"
              onClick={onOpenBookmarkletModal}
              className="px-2 py-1.5 sm:px-2.5 bg-gradient-to-r from-purple-600/20 to-indigo-600/20 hover:from-purple-600/30 hover:to-indigo-600/30 text-indigo-300 border border-indigo-500/30 rounded-xl text-xs font-semibold transition flex items-center gap-1 shadow-sm"
              title="スマホのシェアボタン & PCブックマークレット追加設定"
            >
              <Sparkles className="w-3.5 h-3.5 text-purple-400 shrink-0" />
              <span className="hidden md:inline">スマホ共有 & ブックマークレット</span>
              <span className="md:hidden text-[11px]">共有</span>
            </button>

            {/* Sync Status Badge (PC + Mobile) */}
            <button
              type="button"
              id="sync-status-badge-btn"
              onClick={onOpenSyncModal}
              className={`flex items-center gap-1 sm:gap-1.5 px-2 py-1.5 sm:px-3 rounded-xl border text-xs font-medium transition shadow-sm ${
                syncState.isSyncing
                  ? 'bg-amber-500/10 text-amber-400 border-amber-500/30 animate-pulse'
                  : syncState.isOnline
                  ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/30 hover:bg-emerald-500/20'
                  : 'bg-slate-800 text-slate-400 border-slate-700'
              }`}
              title="PC・スマホ同期設定"
            >
              <Smartphone className="w-3.5 h-3.5 shrink-0" />
              <span className="font-mono font-bold tracking-wide text-[11px] sm:text-xs">{syncState.syncCode}</span>
            </button>

            {/* Primary Add Button */}
            <button
              type="button"
              id="open-add-modal-btn"
              onClick={() => onOpenAddModal()}
              className="px-2.5 py-1.5 sm:px-3.5 sm:py-2 bg-indigo-600 hover:bg-indigo-500 text-white font-medium text-xs sm:text-sm rounded-xl transition flex items-center gap-1 sm:gap-1.5 shadow-lg shadow-indigo-600/30 shrink-0"
              title="ブックマークを新規追加"
            >
              <BookmarkPlus className="w-4 h-4" />
              <span className="hidden sm:inline">ブックマーク追加</span>
              <span className="sm:hidden text-xs">追加</span>
            </button>
          </div>
        </div>

        {/* Mobile Quick Paste Input */}
        <form onSubmit={handleQuickSubmit} className="md:hidden mt-2.5">
          <div className="relative w-full flex items-center">
            <input
              type="text"
              value={quickUrl}
              onChange={(e) => setQuickUrl(e.target.value)}
              placeholder="URLを貼り付けてAI即座保存..."
              className="w-full pl-3 pr-20 py-2 bg-slate-950 border border-slate-700 rounded-xl text-xs text-slate-200 placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-indigo-500"
            />
            <button
              type="submit"
              disabled={isAddingQuick || !quickUrl.trim()}
              className="absolute right-1 px-2.5 py-1 bg-indigo-600 disabled:opacity-50 text-white font-medium text-xs rounded-lg flex items-center gap-1"
            >
              {isAddingQuick ? <RefreshCw className="w-3 h-3 animate-spin" /> : <Sparkles className="w-3 h-3" />}
              <span>保存</span>
            </button>
          </div>
        </form>
      </div>
    </header>
  );
};
