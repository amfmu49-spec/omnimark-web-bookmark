import React, { useState } from 'react';
import {
  BookmarkPlus,
  Copy,
  Check,
  X,
  Sparkles,
  Smartphone,
  Laptop,
  Share2,
  ExternalLink,
  Download,
  Info,
} from 'lucide-react';

interface BookmarkletModalProps {
  isOpen: boolean;
  onClose: () => void;
  syncCode: string;
}

export const BookmarkletModal: React.FC<BookmarkletModalProps> = ({
  isOpen,
  onClose,
  syncCode,
}) => {
  const [activeTab, setActiveTab] = useState<'pc' | 'mobile' | 'test'>('mobile');
  const [copied, setCopied] = useState(false);
  const [copiedShortcut, setCopiedShortcut] = useState(false);

  if (!isOpen) return null;

  const appOrigin = window.location.origin;

  // JS code to open OmniMark and auto-save current tab URL with AI summary
  const bookmarkletCode = `javascript:(function(){var u=encodeURIComponent(window.location.href);var t=encodeURIComponent(document.title);window.open('${appOrigin}?url='+u+'&title='+t+'&sync=${syncCode}','_blank');})();`;

  // iOS Shortcuts URL scheme template or instructions
  const iosShortcutURL = `${appOrigin}?url=https://example.com&sync=${syncCode}`;

  const handleCopyCode = () => {
    navigator.clipboard.writeText(bookmarkletCode);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  // Test Native Web Share API
  const handleTestWebShare = async () => {
    if (navigator.share) {
      try {
        await navigator.share({
          title: 'OmniMark テスト記事',
          text: 'AIでスマートにブックマーク保存！',
          url: `${appOrigin}?url=https://github.com/trending&title=GitHub%20Trending&sync=${syncCode}`,
        });
      } catch (err) {
        console.log('Share canceled or failed', err);
      }
    } else {
      alert('お使いのブラウザはWeb Share APIに直接対応していません。PWA「ホーム画面に追加」をお試しください。');
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-md animate-fade-in">
      <div className="relative w-full max-w-xl bg-slate-900 border border-slate-800 rounded-2xl shadow-2xl overflow-hidden text-slate-100 flex flex-col max-h-[90vh]">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-800 bg-slate-950/60">
          <div className="flex items-center gap-2">
            <div className="p-2 rounded-xl bg-indigo-600/20 text-indigo-400 border border-indigo-500/30">
              <Share2 className="w-5 h-5" />
            </div>
            <div>
              <h3 className="font-bold text-base text-white">簡単登録連携ガイド</h3>
              <p className="text-[11px] text-slate-400">
                URL手動貼り付け不要！ブックマークレット & スマホの共有ボタンから1タップ保存
              </p>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="p-1.5 text-slate-400 hover:text-white rounded-xl hover:bg-slate-800 transition"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Tab Switcher */}
        <div className="flex border-b border-slate-800 bg-slate-950/40 text-xs font-semibold">
          <button
            type="button"
            onClick={() => setActiveTab('mobile')}
            className={`flex-1 py-3 px-4 flex items-center justify-center gap-2 border-b-2 transition ${
              activeTab === 'mobile'
                ? 'border-indigo-500 text-indigo-400 bg-indigo-500/10'
                : 'border-transparent text-slate-400 hover:text-slate-200'
            }`}
          >
            <Smartphone className="w-4 h-4" />
            <span>スマホの「共有ボタン」設定</span>
          </button>

          <button
            type="button"
            onClick={() => setActiveTab('pc')}
            className={`flex-1 py-3 px-4 flex items-center justify-center gap-2 border-b-2 transition ${
              activeTab === 'pc'
                ? 'border-indigo-500 text-indigo-400 bg-indigo-500/10'
                : 'border-transparent text-slate-400 hover:text-slate-200'
            }`}
          >
            <Laptop className="w-4 h-4" />
            <span>PC用ブックマークレット</span>
          </button>
        </div>

        {/* Modal Body Content */}
        <div className="p-6 overflow-y-auto space-y-5 text-xs text-slate-300 custom-scrollbar flex-1">
          {activeTab === 'mobile' ? (
            <div className="space-y-4">
              <div className="p-3 bg-indigo-50 border border-indigo-200 rounded-xl text-indigo-900 leading-relaxed flex items-start gap-2.5">
                <Sparkles className="w-5 h-5 text-indigo-600 shrink-0 mt-0.5" />
                <div>
                  <span className="font-bold block text-sm text-indigo-800">
                    TikTokやX(Twitter)アプリ・スマホの共有ボタンから1タップ追加！
                  </span>
                  TikTokアプリやXアプリ、ブラウザで動画や投稿を閲覧中、「共有（シェア）」メニューからAMUPOKEへワンタップでAI保存できます。
                </div>
              </div>

              {/* Android Guide */}
              <div className="p-4 bg-white border border-slate-200 rounded-xl space-y-2 shadow-sm">
                <div className="flex items-center gap-2 font-bold text-slate-800 text-xs">
                  <span className="px-2 py-0.5 bg-emerald-50 text-emerald-700 border border-emerald-200 rounded">
                    Android / Chrome
                  </span>
                  <span>「ホーム画面に追加」でTikTok・X共有に対応</span>
                </div>
                <ol className="list-decimal pl-4 space-y-1.5 text-slate-600 text-[11px] leading-normal">
                  <li>Chromeで本サイトを開き、右上メニューから <strong className="text-indigo-600">「ホーム画面に追加」</strong> を選択</li>
                  <li>
                    TikTokやXアプリで気になる動画・投稿を開き <strong className="text-indigo-600">「共有（シェア）」</strong> をタップ
                  </li>
                  <li>
                    送信先一覧から <strong className="text-indigo-600 font-bold">「AMUPOKE」</strong> を選ぶだけでAI要約付きで自動追加されます！
                  </li>
                </ol>
              </div>

              {/* iOS Guide */}
              <div className="p-4 bg-white border border-slate-200 rounded-xl space-y-2 shadow-sm">
                <div className="flex items-center gap-2 font-bold text-slate-800 text-xs">
                  <span className="px-2 py-0.5 bg-sky-50 text-sky-700 border border-sky-200 rounded">
                    iPhone / iOS Safari
                  </span>
                  <span>Safariの共有メニューまたはURL手動追加</span>
                </div>
                <ol className="list-decimal pl-4 space-y-1.5 text-slate-600 text-[11px] leading-normal">
                  <li>Safariの下部中央「共有」アイコン（四角に矢印）から <strong className="text-indigo-600">「ホーム画面に追加」</strong></li>
                  <li>
                    TikTokやXアプリで共有ボタン ➔ <strong className="text-indigo-600">「リンクをコピー」</strong> ➔ AMUPOKEの <strong className="text-indigo-600">「+追加」</strong> ボタンへ貼り付けて完了！
                  </li>
                </ol>
              </div>

              {/* Native Share Test Button */}
              <div className="p-3 bg-slate-950 border border-slate-800 rounded-xl flex items-center justify-between gap-3">
                <div className="space-y-0.5">
                  <span className="font-bold text-white block text-xs">スマホの共有動作テスト</span>
                  <span className="text-[11px] text-slate-400">現在お使いの端末でシェア機能をテストします</span>
                </div>
                <button
                  type="button"
                  onClick={handleTestWebShare}
                  className="px-4 py-2 bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-500 hover:to-purple-500 text-white font-bold rounded-xl shadow-lg transition shrink-0 flex items-center gap-1.5"
                >
                  <Share2 className="w-3.5 h-3.5" />
                  <span>シェアテスト</span>
                </button>
              </div>
            </div>
          ) : (
            <div className="space-y-4">
              <p className="leading-relaxed">
                PC（Chrome / Safari / Edge / Firefox）のブックマークバーに下記のボタンをドラッグ＆ドロップ登録してください。どんなWebサイトの閲覧時でも1クリックでOmniMarkにAI要約保存されます。
              </p>

              {/* Drag Target Button */}
              <div className="p-6 bg-slate-950 border border-indigo-500/30 rounded-2xl text-center space-y-3">
                <span className="text-slate-400 font-medium block text-xs">
                  👇 下のボタンをブラウザのブックマークバーへドラッグ！
                </span>

                <a
                  href={bookmarkletCode}
                  onClick={(e) => e.preventDefault()}
                  className="inline-flex items-center gap-2 px-6 py-3.5 bg-gradient-to-r from-indigo-600 via-purple-600 to-pink-600 text-white font-bold text-sm rounded-xl shadow-lg shadow-indigo-500/30 cursor-grab active:cursor-grabbing hover:scale-105 transition transform"
                >
                  <Sparkles className="w-4 h-4" />
                  <span>+ OmniMarkに保存</span>
                </a>
              </div>

              {/* Code Copy */}
              <div className="space-y-2 pt-2 border-t border-slate-800">
                <span className="font-semibold text-slate-200 block">手動用スクリプトコード</span>
                <div className="flex gap-2">
                  <input
                    type="text"
                    readOnly
                    value={bookmarkletCode}
                    className="flex-1 px-3 py-2 bg-slate-950 border border-slate-800 rounded-xl text-[10px] font-mono text-slate-400 overflow-hidden text-ellipsis"
                  />
                  <button
                    type="button"
                    onClick={handleCopyCode}
                    className="px-3.5 py-2 bg-indigo-600 hover:bg-indigo-500 text-white font-medium rounded-xl transition flex items-center gap-1 shrink-0"
                  >
                    {copied ? <Check className="w-3.5 h-3.5 text-emerald-300" /> : <Copy className="w-3.5 h-3.5" />}
                    <span>{copied ? 'コピー完了' : 'コードコピー'}</span>
                  </button>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Modal Footer */}
        <div className="p-4 border-t border-slate-800 bg-slate-950 flex items-center justify-between text-xs text-slate-400">
          <div className="flex items-center gap-1.5 font-mono">
            <span>同期コード:</span>
            <span className="text-indigo-400 font-bold px-1.5 py-0.5 bg-indigo-500/10 rounded border border-indigo-500/20">
              {syncCode}
            </span>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-1.5 bg-slate-800 hover:bg-slate-700 text-white rounded-xl font-medium transition"
          >
            閉じる
          </button>
        </div>
      </div>
    </div>
  );
};
