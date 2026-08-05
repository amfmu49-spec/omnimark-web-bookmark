import React from 'react';
import {
  Star,
  Pin,
  ExternalLink,
  Edit3,
  Trash2,
  Copy,
  Sparkles,
  Check,
  Folder,
  Tag,
  Clock,
  BookOpen,
  CheckCircle2,
  FileText,
  Video,
  Wrench,
  ShoppingBag,
  Code,
  Globe,
  MoreVertical,
} from 'lucide-react';
import { Bookmark, Collection, BookmarkCategory } from '../types';

interface BookmarkGridProps {
  bookmarks: Bookmark[];
  collections: Collection[];
  onToggleFavorite: (id: string) => void;
  onTogglePin: (id: string) => void;
  onUpdateReadStatus: (id: string, status: 'unread' | 'reading' | 'read') => void;
  onDeleteBookmark: (id: string) => void;
  onOpenDetailModal: (bookmark: Bookmark) => void;
  onSelectTag: (tag: string) => void;
}

const CATEGORY_ICONS: Record<BookmarkCategory, React.ReactNode> = {
  article: <FileText className="w-3.5 h-3.5 text-sky-400" />,
  video: <Video className="w-3.5 h-3.5 text-rose-400" />,
  tool: <Wrench className="w-3.5 h-3.5 text-amber-400" />,
  product: <ShoppingBag className="w-3.5 h-3.5 text-emerald-400" />,
  code: <Code className="w-3.5 h-3.5 text-purple-400" />,
  doc: <Folder className="w-3.5 h-3.5 text-indigo-400" />,
  other: <Globe className="w-3.5 h-3.5 text-slate-400" />,
};

const CATEGORY_LABELS: Record<BookmarkCategory, string> = {
  article: '記事',
  video: '動画',
  tool: 'ツール',
  product: '買い物',
  code: 'コード',
  doc: 'ドキュメント',
  other: 'その他',
};

export const BookmarkGrid: React.FC<BookmarkGridProps> = ({
  bookmarks,
  collections,
  onToggleFavorite,
  onTogglePin,
  onUpdateReadStatus,
  onDeleteBookmark,
  onOpenDetailModal,
  onSelectTag,
}) => {
  const [copiedId, setCopiedId] = React.useState<string | null>(null);

  const handleCopyUrl = (url: string, id: string, e: React.MouseEvent) => {
    e.stopPropagation();
    navigator.clipboard.writeText(url);
    setCopiedId(id);
    setTimeout(() => setCopiedId(null), 1800);
  };

  const getCollectionName = (colId: string) => {
    const col = collections.find((c) => c.id === colId);
    return col ? col.name : '未分類';
  };

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-2 xl:grid-cols-3 gap-5">
      {bookmarks.map((bm) => {
        const domain = new URL(bm.url).hostname;
        return (
          <div
            key={bm.id}
            onClick={() => onOpenDetailModal(bm)}
            className="group relative bg-slate-900 border border-slate-800/90 rounded-2xl overflow-hidden hover:border-indigo-500/50 hover:shadow-xl hover:shadow-indigo-500/10 transition-all duration-300 flex flex-col cursor-pointer text-slate-200"
          >
            {/* Pinned Badge */}
            {bm.isPinned && (
              <div className="absolute top-3 left-3 z-10 px-2 py-0.5 rounded-full bg-indigo-600 text-white font-medium text-[10px] shadow-md flex items-center gap-1">
                <Pin className="w-3 h-3 fill-white" />
                <span>ピン留め</span>
              </div>
            )}

            {/* Favorite Star Button */}
            <button
              type="button"
              onClick={(e) => {
                e.stopPropagation();
                onToggleFavorite(bm.id);
              }}
              className="absolute top-3 right-3 z-10 p-2 rounded-full bg-slate-950/70 hover:bg-slate-950 border border-slate-700/80 text-amber-400 transition shadow backdrop-blur-md"
              title="お気に入り切り替え"
            >
              <Star className={`w-4 h-4 ${bm.isFavorite ? 'fill-amber-400' : ''}`} />
            </button>

            {/* Cover Image or Visual Header */}
            <div className="relative h-36 w-full bg-slate-950 overflow-hidden shrink-0">
              {bm.coverImage ? (
                <img
                  src={bm.coverImage}
                  alt={bm.title}
                  className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500 opacity-85 group-hover:opacity-100"
                  onError={(e) => {
                    (e.target as HTMLElement).style.display = 'none';
                  }}
                />
              ) : (
                <div className="w-full h-full bg-gradient-to-br from-indigo-900/40 via-purple-900/30 to-slate-900 flex items-center justify-center p-4">
                  <Globe className="w-12 h-12 text-slate-700" />
                </div>
              )}
              <div className="absolute inset-0 bg-gradient-to-t from-slate-900 via-slate-900/40 to-transparent"></div>

              {/* Favicon & Domain Overlay */}
              <div className="absolute bottom-3 left-3 right-3 flex items-center gap-2">
                <img
                  src={bm.favicon}
                  alt={domain}
                  className="w-5 h-5 rounded bg-white/90 p-0.5 shrink-0 shadow"
                  onError={(e) => {
                    (e.target as HTMLImageElement).src =
                      'https://www.google.com/s2/favicons?domain=example.com';
                  }}
                />
                <span className="text-xs font-mono font-medium text-slate-300 truncate drop-shadow-md">
                  {domain}
                </span>
              </div>
            </div>

            {/* Card Body */}
            <div className="p-4 flex-1 flex flex-col justify-between space-y-3">
              <div className="space-y-2">
                {/* Category & Collection Header */}
                <div className="flex items-center justify-between text-[11px]">
                  <span className="inline-flex items-center gap-1.5 px-2 py-0.5 rounded-md bg-slate-800 text-slate-300 border border-slate-700/80 font-medium">
                    {CATEGORY_ICONS[bm.category]}
                    <span>{CATEGORY_LABELS[bm.category]}</span>
                  </span>

                  <span className="text-slate-400 font-medium text-[11px] truncate max-w-[130px]">
                    📁 {getCollectionName(bm.collectionId)}
                  </span>
                </div>

                {/* Title */}
                <h3 className="font-bold text-sm text-white group-hover:text-indigo-300 transition-colors line-clamp-2 leading-snug">
                  {bm.title}
                </h3>

                {/* AI Summary Box */}
                {bm.aiSummary && (
                  <div className="p-2.5 bg-indigo-950/40 border border-indigo-500/20 rounded-xl space-y-1">
                    <div className="flex items-center gap-1 text-[10px] font-semibold text-indigo-400">
                      <Sparkles className="w-3 h-3" />
                      <span>AI要約</span>
                    </div>
                    <p className="text-xs text-slate-300 leading-relaxed line-clamp-2">
                      {bm.aiSummary}
                    </p>
                  </div>
                )}

                {/* User Notes Preview */}
                {bm.notes && (
                  <p className="text-xs text-slate-400 italic line-clamp-2 border-l-2 border-indigo-500/50 pl-2 py-0.5">
                    "{bm.notes}"
                  </p>
                )}
              </div>

              {/* Tags */}
              {bm.tags && bm.tags.length > 0 && (
                <div className="flex flex-wrap gap-1 pt-1">
                  {bm.tags.slice(0, 4).map((tag) => (
                    <button
                      key={tag}
                      type="button"
                      onClick={(e) => {
                        e.stopPropagation();
                        onSelectTag(tag);
                      }}
                      className="px-2 py-0.5 bg-slate-800/80 hover:bg-slate-700 text-slate-300 text-[10px] rounded-md transition"
                    >
                      #{tag}
                    </button>
                  ))}
                  {bm.tags.length > 4 && (
                    <span className="text-[10px] text-slate-500 px-1 py-0.5">
                      +{bm.tags.length - 4}
                    </span>
                  )}
                </div>
              )}

              {/* Card Footer Actions */}
              <div className="pt-3 border-t border-slate-800/80 flex items-center justify-between gap-2 text-xs">
                {/* Read Status Selector */}
                <select
                  value={bm.readStatus}
                  onClick={(e) => e.stopPropagation()}
                  onChange={(e) =>
                    onUpdateReadStatus(bm.id, e.target.value as 'unread' | 'reading' | 'read')
                  }
                  className={`px-2 py-1 rounded-lg text-[11px] font-medium border border-slate-700 transition ${
                    bm.readStatus === 'unread'
                      ? 'bg-sky-500/10 text-sky-400 border-sky-500/30'
                      : bm.readStatus === 'reading'
                      ? 'bg-amber-500/10 text-amber-400 border-amber-500/30'
                      : 'bg-emerald-500/10 text-emerald-400 border-emerald-500/30'
                  }`}
                >
                  <option value="unread">🕒 未読</option>
                  <option value="reading">📖 読書中</option>
                  <option value="read">✅ 完了</option>
                </select>

                <div className="flex items-center gap-1">
                  {/* Copy URL Button */}
                  <button
                    type="button"
                    onClick={(e) => handleCopyUrl(bm.url, bm.id, e)}
                    className="p-1.5 text-slate-400 hover:text-white hover:bg-slate-800 rounded-lg transition"
                    title="URLをコピー"
                  >
                    {copiedId === bm.id ? (
                      <Check className="w-3.5 h-3.5 text-emerald-400" />
                    ) : (
                      <Copy className="w-3.5 h-3.5" />
                    )}
                  </button>

                  {/* Open Direct External Link */}
                  <a
                    href={bm.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    onClick={(e) => e.stopPropagation()}
                    className="p-1.5 text-slate-400 hover:text-indigo-400 hover:bg-slate-800 rounded-lg transition"
                    title="別タブで開く"
                  >
                    <ExternalLink className="w-3.5 h-3.5" />
                  </a>

                  {/* Delete Button */}
                  <button
                    type="button"
                    onClick={(e) => {
                      e.stopPropagation();
                      if (confirm(`「${bm.title}」を削除してもよろしいですか？`)) {
                        onDeleteBookmark(bm.id);
                      }
                    }}
                    className="p-1.5 text-slate-400 hover:text-rose-400 hover:bg-slate-800 rounded-lg transition"
                    title="削除"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>
            </div>
          </div>
        );
      })}
    </div>
  );
};
