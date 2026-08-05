import React from 'react';
import { Bookmark, Collection } from '../types';
import { Clock, BookOpen, CheckCircle2, ExternalLink, Sparkles, Star } from 'lucide-react';

interface BookmarkKanbanProps {
  bookmarks: Bookmark[];
  collections: Collection[];
  onToggleFavorite: (id: string) => void;
  onUpdateReadStatus: (id: string, status: 'unread' | 'reading' | 'read') => void;
  onOpenDetailModal: (bookmark: Bookmark) => void;
}

const COLUMNS = [
  {
    id: 'unread' as const,
    title: '未読 (後で読む)',
    icon: <Clock className="w-4 h-4 text-sky-600" />,
    color: 'border-sky-200 bg-sky-50/50',
  },
  {
    id: 'reading' as const,
    title: '読書中・作業中',
    icon: <BookOpen className="w-4 h-4 text-amber-600" />,
    color: 'border-amber-200 bg-amber-50/50',
  },
  {
    id: 'read' as const,
    title: '読了・アーカイブ済',
    icon: <CheckCircle2 className="w-4 h-4 text-emerald-600" />,
    color: 'border-emerald-200 bg-emerald-50/50',
  },
];

export const BookmarkKanban: React.FC<BookmarkKanbanProps> = ({
  bookmarks,
  collections,
  onToggleFavorite,
  onUpdateReadStatus,
  onOpenDetailModal,
}) => {
  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
      {COLUMNS.map((col) => {
        const columnBookmarks = bookmarks.filter((b) => b.readStatus === col.id);
        return (
          <div
            key={col.id}
            className={`p-4 rounded-2xl border ${col.color} flex flex-col space-y-3 min-h-[500px] shadow-sm`}
          >
            {/* Column Header */}
            <div className="flex items-center justify-between pb-2 border-b border-slate-200">
              <div className="flex items-center gap-2 font-bold text-sm text-slate-800">
                {col.icon}
                <span>{col.title}</span>
              </div>
              <span className="px-2 py-0.5 rounded-full bg-white border border-slate-200 text-xs font-mono font-bold text-slate-600">
                {columnBookmarks.length}
              </span>
            </div>

            {/* Column Cards Container */}
            <div className="flex-1 space-y-3">
              {columnBookmarks.map((bm) => {
                const domain = new URL(bm.url).hostname;
                return (
                  <div
                    key={bm.id}
                    onClick={() => onOpenDetailModal(bm)}
                    className="p-3.5 bg-white border border-slate-200/80 rounded-xl hover:border-indigo-400 hover:shadow-md transition cursor-pointer space-y-2 text-slate-800"
                  >
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-1.5">
                        <img
                          src={bm.favicon}
                          alt={domain}
                          className="w-3.5 h-3.5 rounded bg-white p-0.5 border border-slate-200"
                        />
                        <span className="text-[10px] font-mono font-semibold text-slate-500">{domain}</span>
                      </div>
                      <button
                        type="button"
                        onClick={(e) => {
                          e.stopPropagation();
                          onToggleFavorite(bm.id);
                        }}
                        className="text-amber-500"
                      >
                        <Star className={`w-3.5 h-3.5 ${bm.isFavorite ? 'fill-amber-400 text-amber-500' : 'text-slate-300'}`} />
                      </button>
                    </div>

                    <h4 className="font-bold text-xs text-slate-900 line-clamp-2 leading-snug">
                      {bm.title}
                    </h4>

                    {bm.aiSummary && (
                      <p className="text-[11px] text-slate-600 line-clamp-2 bg-gradient-to-r from-indigo-50/70 to-purple-50/50 p-2 rounded border border-indigo-100 font-medium">
                        {bm.aiSummary}
                      </p>
                    )}

                    <div className="flex items-center justify-between pt-1 text-[10px]">
                      <span className="text-indigo-400">#{bm.category}</span>
                      <a
                        href={bm.url}
                        target="_blank"
                        rel="noopener noreferrer"
                        onClick={(e) => e.stopPropagation()}
                        className="text-slate-400 hover:text-white flex items-center gap-1"
                      >
                        <span>開く</span>
                        <ExternalLink className="w-3 h-3" />
                      </a>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        );
      })}
    </div>
  );
};
