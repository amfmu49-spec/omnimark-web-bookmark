import React, { useState } from 'react';
import { Download, Upload, Check, X, FileText, Database, AlertCircle } from 'lucide-react';
import { Bookmark } from '../types';

interface ImportExportModalProps {
  isOpen: boolean;
  onClose: () => void;
  bookmarks: Bookmark[];
  onImportBookmarks: (imported: Bookmark[]) => void;
}

export const ImportExportModal: React.FC<ImportExportModalProps> = ({
  isOpen,
  onClose,
  bookmarks,
  onImportBookmarks,
}) => {
  const [importStatus, setImportStatus] = useState<string | null>(null);

  if (!isOpen) return null;

  // Export JSON
  const handleExportJSON = () => {
    const dataStr = 'data:text/json;charset=utf-8,' + encodeURIComponent(JSON.stringify(bookmarks, null, 2));
    const downloadAnchor = document.createElement('a');
    downloadAnchor.setAttribute('href', dataStr);
    downloadAnchor.setAttribute('download', `omnimark_bookmarks_${new Date().toISOString().slice(0, 10)}.json`);
    document.body.appendChild(downloadAnchor);
    downloadAnchor.click();
    downloadAnchor.remove();
  };

  // Export HTML Netscape Bookmark format (Chrome / Safari compatible)
  const handleExportHTML = () => {
    let html = `<!DOCTYPE NETSCAPE-Bookmark-file-1>\n<!-- This is an automatically generated file. -->\n<META HTTP-EQUIV="Content-Type" CONTENT="text/html; charset=UTF-8">\n<TITLE>Bookmarks</TITLE>\n<H1>Bookmarks</H1>\n<DL><p>\n`;
    bookmarks.forEach((bm) => {
      html += `    <DT><A HREF="${bm.url}" ADD_DATE="${Math.floor(new Date(bm.createdAt).getTime() / 1000)}">${bm.title}</A>\n`;
    });
    html += `</DL><p>\n`;

    const blob = new Blob([html], { type: 'text/html' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `omnimark_browser_bookmarks_${new Date().toISOString().slice(0, 10)}.html`;
    a.click();
  };

  // Import JSON / HTML file
  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (event) => {
      const content = event.target?.result as string;
      if (!content) return;

      try {
        if (file.name.endsWith('.json')) {
          const parsed = JSON.parse(content);
          if (Array.isArray(parsed)) {
            onImportBookmarks(parsed);
            setImportStatus(`${parsed.length} 件のブックマークをインポートしました！`);
          }
        } else {
          // Parse HTML bookmarks
          const parser = new DOMParser();
          const doc = parser.parseFromString(content, 'text/html');
          const links = doc.querySelectorAll('a');
          const newBookmarks: Bookmark[] = [];

          links.forEach((link, idx) => {
            const href = link.getAttribute('href');
            const text = link.textContent?.trim() || href || 'ブックマーク';
            if (href && /^https?:\/\//i.test(href)) {
              newBookmarks.push({
                id: `imported-${Date.now()}-${idx}`,
                url: href,
                title: text,
                description: `インポート済みリンク`,
                favicon: `https://www.google.com/s2/favicons?domain=${new URL(href).hostname}&sz=64`,
                category: 'article',
                tags: ['インポート'],
                collectionId: 'work',
                notes: 'ブラウザからインポートしたブックマーク',
                isFavorite: false,
                isPinned: false,
                isArchived: false,
                readStatus: 'unread',
                rating: 0,
                aiSummary: 'インポート済みWebリンク',
                aiKeyTakeaways: [],
                createdAt: new Date().toISOString(),
                updatedAt: new Date().toISOString(),
              });
            }
          });

          if (newBookmarks.length > 0) {
            onImportBookmarks(newBookmarks);
            setImportStatus(`${newBookmarks.length} 件のブラウザブックマークを取り込みました！`);
          } else {
            setImportStatus('有効なブックマークリンクが見つかりませんでした。');
          }
        }
      } catch (err) {
        console.error(err);
        setImportStatus('ファイルの読み込みに失敗しました。正しいJSONまたはHTML形式か確認してください。');
      }
    };
    reader.readAsText(file);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-sm animate-fade-in">
      <div className="relative w-full max-w-lg bg-slate-900 border border-slate-800 rounded-2xl shadow-2xl overflow-hidden text-slate-100">
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-800">
          <div className="flex items-center gap-2">
            <Database className="w-5 h-5 text-indigo-400" />
            <h3 className="font-bold text-base text-white">データのインポート & エクスポート</h3>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="p-1 text-slate-400 hover:text-white rounded-lg hover:bg-slate-800 transition"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="p-6 space-y-6 text-xs text-slate-300">
          {/* Export Options */}
          <div className="p-4 bg-slate-950 border border-slate-800 rounded-xl space-y-3">
            <span className="font-bold text-slate-200 block text-sm">📤 エクスポート (バックアップ)</span>
            <p className="text-slate-400">現在保存されている全 {bookmarks.length} 件のブックマークを出力します。</p>
            <div className="flex gap-2">
              <button
                type="button"
                onClick={handleExportJSON}
                className="px-4 py-2 bg-indigo-600 hover:bg-indigo-500 text-white font-semibold rounded-xl transition flex items-center gap-1.5"
              >
                <Download className="w-4 h-4" />
                <span>JSONファイル出力</span>
              </button>
              <button
                type="button"
                onClick={handleExportHTML}
                className="px-4 py-2 bg-slate-800 hover:bg-slate-700 text-slate-200 font-semibold rounded-xl transition flex items-center gap-1.5"
              >
                <FileText className="w-4 h-4" />
                <span>ブラウザHTML出力</span>
              </button>
            </div>
          </div>

          {/* Import Options */}
          <div className="p-4 bg-slate-950 border border-slate-800 rounded-xl space-y-3">
            <span className="font-bold text-slate-200 block text-sm">📥 インポート (取り込み)</span>
            <p className="text-slate-400">Chrome, Safari, Edgeから書き出したHTMLファイル、またはJSONファイルを一括インポートできます。</p>
            <label className="inline-flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-500 hover:to-indigo-500 text-white font-semibold rounded-xl transition cursor-pointer shadow">
              <Upload className="w-4 h-4" />
              <span>ファイルを選択して読み込み</span>
              <input
                type="file"
                accept=".json,.html,.htm"
                onChange={handleFileUpload}
                className="hidden"
              />
            </label>
          </div>

          {importStatus && (
            <div className="p-3 bg-indigo-950/60 border border-indigo-500/30 rounded-xl text-indigo-200 text-xs flex items-center gap-2">
              <Check className="w-4 h-4 text-emerald-400 shrink-0" />
              <span>{importStatus}</span>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
