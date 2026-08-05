import React, { useState, useEffect } from 'react';
import {
  Sparkles,
  X,
  Plus,
  Tag,
  Folder,
  Star,
  Globe,
  RefreshCw,
  FileText,
  BookmarkCheck,
  Check,
} from 'lucide-react';
import { Bookmark, Collection, BookmarkCategory } from '../types';

interface AddBookmarkModalProps {
  isOpen: boolean;
  onClose: () => void;
  collections: Collection[];
  onSaveBookmark: (bookmark: Omit<Bookmark, 'id' | 'createdAt' | 'updatedAt'>) => void;
  initialUrl?: string;
}

const CATEGORY_OPTIONS: { value: BookmarkCategory; label: string; icon: string }[] = [
  { value: 'article', label: '📄 記事', icon: 'FileText' },
  { value: 'video', label: '📹 動画', icon: 'Video' },
  { value: 'tool', label: '🛠️ ツール', icon: 'Wrench' },
  { value: 'product', label: '🛒 買い物', icon: 'ShoppingBag' },
  { value: 'code', label: '💻 コード', icon: 'Code' },
  { value: 'doc', label: '📁 ドキュメント', icon: 'Folder' },
  { value: 'other', label: '🌐 その他', icon: 'Globe' },
];

export const AddBookmarkModal: React.FC<AddBookmarkModalProps> = ({
  isOpen,
  onClose,
  collections,
  onSaveBookmark,
  initialUrl = '',
}) => {
  const [url, setUrl] = useState(initialUrl);
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [favicon, setFavicon] = useState('');
  const [coverImage, setCoverImage] = useState('');
  const [category, setCategory] = useState<BookmarkCategory>('article');
  const [collectionId, setCollectionId] = useState(collections[0]?.id || 'work');
  const [notes, setNotes] = useState('');
  const [tags, setTags] = useState<string[]>([]);
  const [tagInput, setTagInput] = useState('');
  const [rating, setRating] = useState(0);
  const [isFavorite, setIsFavorite] = useState(false);
  const [isPinned, setIsPinned] = useState(false);
  const [readStatus, setReadStatus] = useState<'unread' | 'reading' | 'read'>('unread');
  const [aiSummary, setAiSummary] = useState('');
  const [aiKeyTakeaways, setAiKeyTakeaways] = useState<string[]>([]);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [hasAnalyzed, setHasAnalyzed] = useState(false);

  useEffect(() => {
    if (initialUrl) {
      setUrl(initialUrl);
      handleAnalyzeUrl(initialUrl);
    }
  }, [initialUrl]);

  if (!isOpen) return null;

  const handleAnalyzeUrl = async (targetUrl?: string) => {
    const fetchUrl = targetUrl || url;
    if (!fetchUrl.trim()) return;

    setIsAnalyzing(true);
    try {
      const res = await fetch('/api/metadata', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ url: fetchUrl }),
      });

      if (res.ok) {
        const data = await res.json();
        setUrl(data.url || fetchUrl);
        setTitle(data.title || '');
        setDescription(data.description || '');
        setFavicon(data.favicon || '');
        setCoverImage(data.coverImage || '');
        if (data.category) setCategory(data.category);
        if (data.suggestedTags && Array.isArray(data.suggestedTags)) {
          setTags((prev) => Array.from(new Set([...prev, ...data.suggestedTags])));
        }
        if (data.aiSummary) setAiSummary(data.aiSummary);
        if (data.aiKeyTakeaways) setAiKeyTakeaways(data.aiKeyTakeaways);
        setHasAnalyzed(true);
      }
    } catch (err) {
      console.error('Failed to parse URL metadata:', err);
    } finally {
      setIsAnalyzing(false);
    }
  };

  const handleAddTag = () => {
    const trimmed = tagInput.trim();
    if (trimmed && !tags.includes(trimmed)) {
      setTags([...tags, trimmed]);
      setTagInput('');
    }
  };

  const handleRemoveTag = (tagToRemove: string) => {
    setTags(tags.filter((t) => t !== tagToRemove));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!url.trim()) return;

    onSaveBookmark({
      url: url.trim(),
      title: title.trim() || url.trim(),
      description: description.trim(),
      favicon: favicon || `https://www.google.com/s2/favicons?domain=${url}&sz=64`,
      coverImage,
      category,
      tags,
      collectionId,
      notes: notes.trim(),
      isFavorite,
      isPinned,
      isArchived: false,
      readStatus,
      rating,
      aiSummary: aiSummary || description || 'Webページブックマーク',
      aiKeyTakeaways,
    });

    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-sm animate-fade-in">
      <div className="relative w-full max-w-2xl bg-slate-900 border border-slate-800 rounded-2xl shadow-2xl overflow-hidden text-slate-100">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-800 bg-slate-900/50">
          <div className="flex items-center gap-2">
            <div className="p-2 bg-indigo-500/10 text-indigo-400 rounded-xl">
              <BookmarkCheck className="w-5 h-5" />
            </div>
            <h3 className="font-bold text-base text-white">ブックマークを新規追加</h3>
          </div>
          <button
            type="button"
            id="close-add-modal-btn"
            onClick={onClose}
            className="p-1 text-slate-400 hover:text-white rounded-lg hover:bg-slate-800 transition"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-5 max-h-[80vh] overflow-y-auto">
          {/* URL Input & AI Fetch Button */}
          <div className="space-y-2">
            <label className="block text-xs font-semibold text-slate-300">
              WebサイトのURL <span className="text-rose-400">*</span>
            </label>
            <div className="flex gap-2">
              <div className="relative flex-1">
                <Globe className="w-4 h-4 text-slate-500 absolute left-3 top-3" />
                <input
                  type="text"
                  value={url}
                  onChange={(e) => setUrl(e.target.value)}
                  placeholder="https://example.com/article"
                  required
                  className="w-full pl-9 pr-3 py-2 bg-slate-950 border border-slate-700 rounded-xl text-sm text-slate-100 placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                />
              </div>
              <button
                type="button"
                id="ai-analyze-url-btn"
                onClick={() => handleAnalyzeUrl()}
                disabled={isAnalyzing || !url.trim()}
                className="px-4 py-2 bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-500 hover:to-purple-500 disabled:opacity-50 text-white text-xs font-semibold rounded-xl transition flex items-center gap-1.5 shadow"
              >
                {isAnalyzing ? (
                  <>
                    <RefreshCw className="w-4 h-4 animate-spin" />
                    <span>解析中...</span>
                  </>
                ) : (
                  <>
                    <Sparkles className="w-4 h-4" />
                    <span>AI自動取得</span>
                  </>
                )}
              </button>
            </div>
          </div>

          {/* AI Extracted Preview Card */}
          {hasAnalyzed && (
            <div className="p-3.5 bg-indigo-950/30 border border-indigo-500/30 rounded-xl space-y-2.5">
              <div className="flex items-center gap-2 text-xs font-semibold text-indigo-400">
                <Sparkles className="w-4 h-4" />
                <span>AI自動要約 & コンテンツ解析結果</span>
              </div>
              {aiSummary && <p className="text-xs text-slate-200 leading-relaxed bg-slate-950/60 p-2.5 rounded-lg border border-slate-800">{aiSummary}</p>}
              {aiKeyTakeaways.length > 0 && (
                <div className="space-y-1">
                  <span className="text-[11px] text-slate-400 font-medium">重要ポイント:</span>
                  <ul className="text-xs text-slate-300 space-y-1 pl-4 list-disc">
                    {aiKeyTakeaways.map((point, idx) => (
                      <li key={idx}>{point}</li>
                    ))}
                  </ul>
                </div>
              )}
            </div>
          )}

          {/* Title & Description */}
          <div className="grid grid-cols-1 gap-4">
            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1">タイトル</label>
              <input
                type="text"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                placeholder="ページタイトル"
                className="w-full px-3 py-2 bg-slate-950 border border-slate-700 rounded-xl text-sm text-slate-100 placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-indigo-500"
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1">説明・概要</label>
              <textarea
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                rows={2}
                placeholder="ページの簡単な概要"
                className="w-full px-3 py-2 bg-slate-950 border border-slate-700 rounded-xl text-xs text-slate-100 placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-indigo-500"
              />
            </div>
          </div>

          {/* Category & Collection */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1">カテゴリ</label>
              <select
                value={category}
                onChange={(e) => setCategory(e.target.value as BookmarkCategory)}
                className="w-full px-3 py-2 bg-slate-950 border border-slate-700 rounded-xl text-xs text-slate-100 focus:outline-none focus:ring-2 focus:ring-indigo-500"
              >
                {CATEGORY_OPTIONS.map((cat) => (
                  <option key={cat.value} value={cat.value}>
                    {cat.label}
                  </option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1">コレクション / フォルダ</label>
              <select
                value={collectionId}
                onChange={(e) => setCollectionId(e.target.value)}
                className="w-full px-3 py-2 bg-slate-950 border border-slate-700 rounded-xl text-xs text-slate-100 focus:outline-none focus:ring-2 focus:ring-indigo-500"
              >
                {collections.map((col) => (
                  <option key={col.id} value={col.id}>
                    {col.name}
                  </option>
                ))}
              </select>
            </div>
          </div>

          {/* Tags */}
          <div>
            <label className="block text-xs font-semibold text-slate-300 mb-1">タグ付け</label>
            <div className="flex gap-2 mb-2">
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
                placeholder="タグ名を入力してEnter"
                className="flex-1 px-3 py-1.5 bg-slate-950 border border-slate-700 rounded-xl text-xs text-slate-100 placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-indigo-500"
              />
              <button
                type="button"
                onClick={handleAddTag}
                className="px-3 py-1.5 bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs rounded-xl font-medium"
              >
                追加
              </button>
            </div>
            <div className="flex flex-wrap gap-1.5 min-h-[28px]">
              {tags.map((tag) => (
                <span
                  key={tag}
                  className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-medium bg-indigo-500/10 text-indigo-300 border border-indigo-500/20"
                >
                  #{tag}
                  <button
                    type="button"
                    onClick={() => handleRemoveTag(tag)}
                    className="hover:text-rose-400 ml-0.5"
                  >
                    ×
                  </button>
                </span>
              ))}
            </div>
          </div>

          {/* User Notes & Rating */}
          <div>
            <label className="block text-xs font-semibold text-slate-300 mb-1">メモ・備忘録</label>
            <textarea
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              rows={2}
              placeholder="自分用の読書メモ、要点、次回参照理由など"
              className="w-full px-3 py-2 bg-slate-950 border border-slate-700 rounded-xl text-xs text-slate-100 placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-indigo-500"
            />
          </div>

          {/* Flags: Favorite, Pin, Read Status & Star Rating */}
          <div className="flex flex-wrap items-center justify-between gap-4 pt-2 border-t border-slate-800 text-xs">
            <div className="flex items-center gap-4">
              <label className="flex items-center gap-1.5 cursor-pointer select-none">
                <input
                  type="checkbox"
                  checked={isFavorite}
                  onChange={(e) => setIsFavorite(e.target.checked)}
                  className="rounded border-slate-700 text-indigo-600 focus:ring-indigo-500 bg-slate-950"
                />
                <span>⭐ お気に入り</span>
              </label>
              <label className="flex items-center gap-1.5 cursor-pointer select-none">
                <input
                  type="checkbox"
                  checked={isPinned}
                  onChange={(e) => setIsPinned(e.target.checked)}
                  className="rounded border-slate-700 text-indigo-600 focus:ring-indigo-500 bg-slate-950"
                />
                <span>📌 上部に固定</span>
              </label>
            </div>

            <div className="flex items-center gap-3">
              <span className="text-slate-400">読了状況:</span>
              <select
                value={readStatus}
                onChange={(e) => setReadStatus(e.target.value as any)}
                className="px-2.5 py-1 bg-slate-950 border border-slate-700 rounded-lg text-xs text-slate-200"
              >
                <option value="unread">🕒 未読</option>
                <option value="reading">📖 読書中</option>
                <option value="read">✅ 完了</option>
              </select>
            </div>
          </div>

          {/* Form Actions */}
          <div className="flex items-center justify-end gap-3 pt-4 border-t border-slate-800">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 bg-slate-800 hover:bg-slate-700 text-slate-300 font-medium text-xs rounded-xl transition"
            >
              キャンセル
            </button>
            <button
              type="submit"
              id="save-bookmark-submit-btn"
              className="px-5 py-2 bg-indigo-600 hover:bg-indigo-500 text-white font-medium text-xs rounded-xl transition shadow-lg shadow-indigo-600/30 flex items-center gap-1.5"
            >
              <Check className="w-4 h-4" />
              <span>保存する</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
