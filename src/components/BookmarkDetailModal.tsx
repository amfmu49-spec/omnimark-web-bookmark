import React, { useState } from 'react';
import {
  X,
  ExternalLink,
  Star,
  Pin,
  Trash2,
  Copy,
  Check,
  Sparkles,
  Folder,
  Tag,
  Globe,
  Edit3,
  BookOpen,
  Share2,
} from 'lucide-react';
import { Bookmark, Collection } from '../types';

interface BookmarkDetailModalProps {
  bookmark: Bookmark | null;
  onClose: () => void;
  collections: Collection[];
  onUpdateBookmark: (updated: Bookmark) => void;
  onDeleteBookmark: (id: string) => void;
}

export const BookmarkDetailModal: React.FC<BookmarkDetailModalProps> = ({
  bookmark,
  onClose,
  collections,
  onUpdateBookmark,
  onDeleteBookmark,
}) => {
  if (!bookmark) return null;

  const [notes, setNotes] = useState(bookmark.notes || '');
  const [tags, setTags] = useState<string[]>(bookmark.tags || []);
  const [tagInput, setTagInput] = useState('');
  const [rating, setRating] = useState(bookmark.rating || 0);
  const [readStatus, setReadStatus] = useState(bookmark.readStatus);
  const [copied, setCopied] = useState(false);
  const [isEditingNotes, setIsEditingNotes] = useState(false);

  const domain = new URL(bookmark.url).hostname;
  const collection = collections.find((c) => c.id === bookmark.collectionId);

  const handleCopyUrl = () => {
    navigator.clipboard.writeText(bookmark.url);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleAddTag = () => {
    const trimmed = tagInput.trim();
    if (trimmed && !tags.includes(trimmed)) {
      const newTags = [...tags, trimmed];
      setTags(newTags);
      setTagInput('');
      onUpdateBookmark({ ...bookmark, tags: newTags });
    }
  };

  const handleRemoveTag = (tagToRemove: string) => {
    const newTags = tags.filter((t) => t !== tagToRemove);
    setTags(newTags);
    onUpdateBookmark({ ...bookmark, tags: newTags });
  };

  const handleSaveNotes = () => {
    onUpdateBookmark({ ...bookmark, notes, rating, readStatus, tags });
    setIsEditingNotes(false);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-md animate-fade-in">
      <div className="relative w-full max-w-3xl bg-slate-900 border border-slate-800 rounded-2xl shadow-2xl overflow-hidden text-slate-100 flex flex-col max-h-[90vh]">
        {/* Top Cover Banner */}
        <div className="relative h-48 w-full bg-slate-950 shrink-0">
          {bookmark.coverImage ? (
            <img
              src={bookmark.coverImage}
              alt={bookmark.title}
              className="w-full h-full object-cover opacity-80"
            />
          ) : (
            <div className="w-full h-full bg-gradient-to-r from-indigo-900 to-slate-900 flex items-center justify-center">
              <Globe className="w-16 h-16 text-slate-700" />
            </div>
          )}
          <div className="absolute inset-0 bg-gradient-to-t from-slate-900 via-slate-900/40 to-transparent"></div>

          {/* Top Actions */}
          <div className="absolute top-4 right-4 flex items-center gap-2">
            <button
              type="button"
              onClick={() => onUpdateBookmark({ ...bookmark, isFavorite: !bookmark.isFavorite })}
              className="p-2 rounded-xl bg-slate-950/80 hover:bg-slate-950 text-amber-400 border border-slate-700 backdrop-blur-md"
            >
              <Star className={`w-4 h-4 ${bookmark.isFavorite ? 'fill-amber-400' : ''}`} />
            </button>
            <button
              type="button"
              onClick={onClose}
              className="p-2 rounded-xl bg-slate-950/80 hover:bg-slate-950 text-slate-300 hover:text-white border border-slate-700 backdrop-blur-md"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* Favicon & Title Overlay */}
          <div className="absolute bottom-4 left-6 right-6 space-y-1">
            <div className="flex items-center gap-2">
              <img src={bookmark.favicon} alt={domain} className="w-5 h-5 rounded bg-white p-0.5" />
              <span className="text-xs font-mono text-slate-300 font-semibold">{domain}</span>
            </div>
            <h2 className="font-bold text-xl text-white line-clamp-2 leading-tight">
              {bookmark.title}
            </h2>
          </div>
        </div>

        {/* Modal Body */}
        <div className="p-6 overflow-y-auto space-y-6 flex-1 custom-scrollbar">
          {/* Quick Info Bar */}
          <div className="flex flex-wrap items-center justify-between gap-3 p-3 bg-slate-950 rounded-xl border border-slate-800 text-xs">
            <div className="flex items-center gap-3">
              <span className="px-2.5 py-1 bg-indigo-600/20 text-indigo-300 border border-indigo-500/30 rounded-lg font-medium">
                {bookmark.category.toUpperCase()}
              </span>
              <span className="text-slate-400">📁 {collection?.name || '未分類'}</span>
            </div>

            <div className="flex items-center gap-2">
              <a
                href={bookmark.url}
                target="_blank"
                rel="noopener noreferrer"
                className="px-3 py-1.5 bg-indigo-600 hover:bg-indigo-500 text-white font-medium rounded-lg transition flex items-center gap-1.5 shadow"
              >
                <span>Webサイトを開く</span>
                <ExternalLink className="w-3.5 h-3.5" />
              </a>
              <button
                type="button"
                onClick={handleCopyUrl}
                className="px-3 py-1.5 bg-slate-800 hover:bg-slate-700 text-slate-200 rounded-lg transition flex items-center gap-1.5"
              >
                {copied ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
                <span>{copied ? 'コピー完了' : 'URLコピー'}</span>
              </button>
            </div>
          </div>

          {/* AI Summary Section */}
          <div className="p-4 bg-indigo-950/30 border border-indigo-500/30 rounded-xl space-y-3">
            <div className="flex items-center gap-2 font-semibold text-sm text-indigo-400">
              <Sparkles className="w-4 h-4" />
              <span>AIコンテンツ概要 & 要約</span>
            </div>
            <p className="text-xs text-slate-200 leading-relaxed bg-slate-950/60 p-3 rounded-lg border border-slate-800/80">
              {bookmark.aiSummary || bookmark.description || 'AI要約はありません'}
            </p>

            {bookmark.aiKeyTakeaways && bookmark.aiKeyTakeaways.length > 0 && (
              <div className="space-y-1.5 pt-1">
                <span className="text-xs font-medium text-slate-400">主要ポイント:</span>
                <ul className="text-xs text-slate-300 space-y-1 pl-4 list-disc">
                  {bookmark.aiKeyTakeaways.map((point, idx) => (
                    <li key={idx}>{point}</li>
                  ))}
                </ul>
              </div>
            )}
          </div>

          {/* User Notes & Ratings */}
          <div className="p-4 bg-slate-950/60 border border-slate-800 rounded-xl space-y-3">
            <div className="flex items-center justify-between">
              <span className="font-semibold text-xs text-slate-200">自分用読書メモ & 評価</span>
              <button
                type="button"
                onClick={() => setIsEditingNotes(!isEditingNotes)}
                className="text-xs text-indigo-400 hover:underline flex items-center gap-1"
              >
                <Edit3 className="w-3.5 h-3.5" />
                <span>{isEditingNotes ? '完了' : '編集'}</span>
              </button>
            </div>

            {isEditingNotes ? (
              <div className="space-y-3">
                <textarea
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                  rows={4}
                  placeholder="メモや読書感想を自由に入力してください..."
                  className="w-full px-3 py-2 bg-slate-900 border border-slate-700 rounded-xl text-xs text-slate-100 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                />
                <button
                  type="button"
                  onClick={handleSaveNotes}
                  className="px-4 py-1.5 bg-indigo-600 text-white rounded-lg text-xs font-medium"
                >
                  メモを保存
                </button>
              </div>
            ) : (
              <p className="text-xs text-slate-300 whitespace-pre-wrap leading-relaxed">
                {notes || 'メモは未入力です。「編集」ボタンから自分用の備忘録を追加できます。'}
              </p>
            )}
          </div>

          {/* Tags */}
          <div className="space-y-2">
            <span className="font-semibold text-xs text-slate-200">登録済みタグ</span>
            <div className="flex flex-wrap gap-1.5">
              {tags.map((tag) => (
                <span
                  key={tag}
                  className="px-2.5 py-1 rounded-full text-xs bg-indigo-500/10 text-indigo-300 border border-indigo-500/20 flex items-center gap-1"
                >
                  #{tag}
                  <button
                    type="button"
                    onClick={() => handleRemoveTag(tag)}
                    className="hover:text-rose-400 ml-1"
                  >
                    ×
                  </button>
                </span>
              ))}
            </div>
            <div className="flex gap-2 max-w-sm pt-1">
              <input
                type="text"
                value={tagInput}
                onChange={(e) => setTagInput(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === 'Enter') {
                    e.preventDefault();
                    handleAddTag();
                  }
                }}
                placeholder="タグを追加..."
                className="flex-1 px-3 py-1 bg-slate-950 border border-slate-800 rounded-lg text-xs text-slate-200 focus:outline-none"
              />
              <button
                type="button"
                onClick={handleAddTag}
                className="px-3 py-1 bg-slate-800 text-slate-200 text-xs rounded-lg font-medium"
              >
                追加
              </button>
            </div>
          </div>
        </div>

        {/* Modal Footer */}
        <div className="p-4 border-t border-slate-800 bg-slate-950 flex items-center justify-between text-xs">
          <span className="text-slate-500">
            登録日時: {new Date(bookmark.createdAt).toLocaleDateString('ja-JP')}
          </span>
          <button
            type="button"
            onClick={() => {
              if (confirm('このブックマークを削除しますか？')) {
                onDeleteBookmark(bookmark.id);
                onClose();
              }
            }}
            className="px-3 py-1.5 bg-rose-500/10 hover:bg-rose-500/20 text-rose-400 border border-rose-500/20 rounded-xl transition flex items-center gap-1.5 font-medium"
          >
            <Trash2 className="w-3.5 h-3.5" />
            <span>削除する</span>
          </button>
        </div>
      </div>
    </div>
  );
};
