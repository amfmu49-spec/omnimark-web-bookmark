import React from 'react';
import {
  Star,
  Pin,
  ExternalLink,
  Trash2,
  Copy,
  Check,
  FileText,
  Video,
  Wrench,
  ShoppingBag,
  Code,
  Globe,
  Folder,
  Sparkles,
} from 'lucide-react';
import { Bookmark, Collection, BookmarkCategory } from '../types';

interface BookmarkListProps {
  bookmarks: Bookmark[];
  collections: Collection[];
  onToggleFavorite: (id: string) => void;
  onTogglePin: (id: string) => void;
  onUpdateReadStatus: (id: string, status: 'unread' | 'reading' | 'read') => void;
  onDeleteBookmark: (id: string) => void;
  onOpenDetailModal: (bookmark: Bookmark) => void;
  onSelectTag: (tag: string) => void;
}

export const BookmarkList: React.FC<BookmarkListProps> = ({
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
    <div className="bg-slate-900 border border-slate-800 rounded-2xl overflow-hidden shadow-xl text-slate-200">
      <div className="overflow-x-auto">
        <table className="w-full text-left text-xs border-collapse">
          <thead>
            <tr className="bg-slate-950/80 border-b border-slate-800 text-slate-400 font-semibold uppercase tracking-wider text-[11px]">
              <th className="py-3 px-4 w-10"></th>
              <th className="py-3 px-4">タイトル / AI概要</th>
              <th className="py-3 px-4 hidden md:table-cell">カテゴリ</th>
              <th className="py-3 px-4 hidden lg:table-cell">コレクション</th>
              <th className="py-3 px-4 hidden sm:table-cell">タグ</th>
              <th className="py-3 px-4">状況</th>
              <th className="py-3 px-4 text-right">操作</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-800/80">
            {bookmarks.map((bm) => {
              const domain = new URL(bm.url).hostname;
              return (
                <tr
                  key={bm.id}
                  onClick={() => onOpenDetailModal(bm)}
                  className="hover:bg-slate-800/50 transition cursor-pointer group"
                >
                  {/* Favorite & Pin Column */}
                  <td className="py-3 px-4 text-center">
                    <button
                      type="button"
                      onClick={(e) => {
                        e.stopPropagation();
                        onToggleFavorite(bm.id);
                      }}
                      className="text-amber-400 hover:scale-110 transition"
                    >
                      <Star className={`w-4 h-4 ${bm.isFavorite ? 'fill-amber-400' : ''}`} />
                    </button>
                  </td>

                  {/* Title & Favicon */}
                  <td className="py-3 px-4">
                    <div className="flex items-start gap-2.5">
                      <img
                        src={bm.favicon}
                        alt={domain}
                        className="w-4 h-4 rounded mt-0.5 shrink-0 bg-white/90 p-0.5"
                        onError={(e) => {
                          (e.target as HTMLImageElement).src =
                            'https://www.google.com/s2/favicons?domain=example.com';
                        }}
                      />
                      <div className="space-y-0.5 min-w-0">
                        <div className="flex items-center gap-2">
                          {bm.isPinned && (
                            <span className="px-1.5 py-0.2 bg-indigo-600 text-white font-bold text-[9px] rounded">
                              PIN
                            </span>
                          )}
                          <span className="font-bold text-slate-100 group-hover:text-indigo-300 transition-colors line-clamp-1">
                            {bm.title}
                          </span>
                        </div>
                        <p className="text-[11px] text-slate-400 line-clamp-1 font-mono">
                          {domain} {bm.aiSummary && `• ${bm.aiSummary}`}
                        </p>
                      </div>
                    </div>
                  </td>

                  {/* Category */}
                  <td className="py-3 px-4 hidden md:table-cell">
                    <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded bg-slate-800 text-slate-300 font-medium text-[11px]">
                      {bm.category}
                    </span>
                  </td>

                  {/* Collection */}
                  <td className="py-3 px-4 text-slate-400 hidden lg:table-cell">
                    📁 {getCollectionName(bm.collectionId)}
                  </td>

                  {/* Tags */}
                  <td className="py-3 px-4 hidden sm:table-cell">
                    <div className="flex flex-wrap gap-1">
                      {bm.tags.slice(0, 2).map((tag) => (
                        <button
                          key={tag}
                          type="button"
                          onClick={(e) => {
                            e.stopPropagation();
                            onSelectTag(tag);
                          }}
                          className="px-1.5 py-0.5 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded text-[10px]"
                        >
                          #{tag}
                        </button>
                      ))}
                    </div>
                  </td>

                  {/* Read Status */}
                  <td className="py-3 px-4">
                    <select
                      value={bm.readStatus}
                      onClick={(e) => e.stopPropagation()}
                      onChange={(e) =>
                        onUpdateReadStatus(
                          bm.id,
                          e.target.value as 'unread' | 'reading' | 'read'
                        )
                      }
                      className="px-2 py-0.5 bg-slate-950 border border-slate-700 rounded text-[11px] text-slate-200"
                    >
                      <option value="unread">🕒 未読</option>
                      <option value="reading">📖 読書中</option>
                      <option value="read">✅ 完了</option>
                    </select>
                  </td>

                  {/* Actions */}
                  <td className="py-3 px-4 text-right">
                    <div className="flex items-center justify-end gap-1">
                      <button
                        type="button"
                        onClick={(e) => handleCopyUrl(bm.url, bm.id, e)}
                        className="p-1.5 text-slate-400 hover:text-white rounded transition"
                        title="URLコピー"
                      >
                        {copiedId === bm.id ? (
                          <Check className="w-3.5 h-3.5 text-emerald-400" />
                        ) : (
                          <Copy className="w-3.5 h-3.5" />
                        )}
                      </button>
                      <a
                        href={bm.url}
                        target="_blank"
                        rel="noopener noreferrer"
                        onClick={(e) => e.stopPropagation()}
                        className="p-1.5 text-slate-400 hover:text-indigo-400 rounded transition"
                        title="開く"
                      >
                        <ExternalLink className="w-3.5 h-3.5" />
                      </a>
                      <button
                        type="button"
                        onClick={(e) => {
                          e.stopPropagation();
                          if (confirm(`削除しますか？`)) {
                            onDeleteBookmark(bm.id);
                          }
                        }}
                        className="p-1.5 text-slate-400 hover:text-rose-400 rounded transition"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
};
