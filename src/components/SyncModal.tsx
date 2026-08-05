import React, { useState } from 'react';
import { QRCodeSVG } from 'qrcode.react';
import {
  Smartphone,
  Laptop,
  Copy,
  Check,
  RefreshCw,
  QrCode,
  AlertCircle,
  X,
  Share2,
  ShieldCheck,
} from 'lucide-react';
import { SyncState } from '../types';

interface SyncModalProps {
  isOpen: boolean;
  onClose: () => void;
  syncState: SyncState;
  onUpdateSyncCode: (newCode: string) => Promise<void>;
  onForceSync: () => Promise<void>;
}

export const SyncModal: React.FC<SyncModalProps> = ({
  isOpen,
  onClose,
  syncState,
  onUpdateSyncCode,
  onForceSync,
}) => {
  const [inputCode, setInputCode] = useState('');
  const [copiedLink, setCopiedLink] = useState(false);
  const [copiedCode, setCopiedCode] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  if (!isOpen) return null;

  const currentAppUrl = window.location.origin + window.location.pathname;
  const syncShareUrl = `${currentAppUrl}?sync=${syncState.syncCode}`;

  const handleCopyLink = () => {
    navigator.clipboard.writeText(syncShareUrl);
    setCopiedLink(true);
    setTimeout(() => setCopiedLink(false), 2000);
  };

  const handleCopyCode = () => {
    navigator.clipboard.writeText(syncState.syncCode);
    setCopiedCode(true);
    setTimeout(() => setCopiedCode(false), 2000);
  };

  const handleSwitchCode = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!inputCode.trim()) return;
    setIsLoading(true);
    await onUpdateSyncCode(inputCode.trim().toUpperCase());
    setIsLoading(false);
    setInputCode('');
  };

  const handleGenerateNewCode = async () => {
    const randomNum = Math.floor(1000 + Math.random() * 9000);
    const newCode = `SYNC-${randomNum}-JP`;
    setIsLoading(true);
    await onUpdateSyncCode(newCode);
    setIsLoading(false);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-sm animate-fade-in">
      <div className="relative w-full max-w-lg bg-slate-900 border border-slate-800 rounded-2xl shadow-2xl overflow-hidden text-slate-100">
        {/* Modal Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-800 bg-slate-900/50">
          <div className="flex items-center gap-2.5">
            <div className="p-2 bg-indigo-500/10 text-indigo-400 rounded-xl border border-indigo-500/20">
              <Smartphone className="w-5 h-5" />
            </div>
            <div>
              <h3 className="font-bold text-base text-white">PC・スマホ リアルタイム同期</h3>
              <p className="text-xs text-slate-400">同じ同期コードで全デバイスのブックマークを共有</p>
            </div>
          </div>
          <button
            type="button"
            id="close-sync-modal-btn"
            onClick={onClose}
            className="p-1 text-slate-400 hover:text-white rounded-lg hover:bg-slate-800 transition"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="p-6 space-y-6 max-h-[85vh] overflow-y-auto">
          {/* Active Sync Code Card */}
          <div className="p-4 bg-slate-950/80 border border-indigo-500/30 rounded-xl text-center space-y-3 relative overflow-hidden">
            <div className="absolute top-0 right-0 w-32 h-32 bg-indigo-500/5 rounded-full blur-2xl pointer-events-none"></div>

            <div className="flex items-center justify-center gap-2 text-xs font-semibold text-indigo-400 uppercase tracking-wider">
              <ShieldCheck className="w-4 h-4 text-emerald-400" />
              <span>現在の同期コード</span>
            </div>

            <div className="flex items-center justify-center gap-3">
              <span className="font-mono text-3xl font-black text-white tracking-widest bg-slate-900 px-4 py-2 rounded-xl border border-slate-800 shadow-inner">
                {syncState.syncCode}
              </span>
              <button
                type="button"
                id="copy-sync-code-btn"
                onClick={handleCopyCode}
                className="p-2.5 bg-slate-800 hover:bg-slate-700 text-slate-200 rounded-xl transition border border-slate-700"
                title="コードをコピー"
              >
                {copiedCode ? <Check className="w-4 h-4 text-emerald-400" /> : <Copy className="w-4 h-4" />}
              </button>
            </div>

            <div className="flex items-center justify-center gap-4 text-xs text-slate-400 pt-1">
              <span className="flex items-center gap-1">
                <span className="w-2 h-2 rounded-full bg-emerald-400"></span>
                オンライン同期中
              </span>
              <span>•</span>
              <span>
                最終同期:{' '}
                {syncState.lastSyncedAt
                  ? new Date(syncState.lastSyncedAt).toLocaleTimeString('ja-JP', {
                      hour: '2-digit',
                      minute: '2-digit',
                      second: '2-digit',
                    })
                  : '完了'}
              </span>
            </div>
          </div>

          {/* QR Code Section for Smartphone */}
          <div className="p-4 bg-slate-900 border border-slate-800 rounded-xl space-y-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <QrCode className="w-4 h-4 text-indigo-400" />
                <span className="text-xs font-semibold text-slate-200">スマホで読み取って即座に接続</span>
              </div>
              <button
                type="button"
                id="copy-sync-share-url-btn"
                onClick={handleCopyLink}
                className="text-xs text-indigo-400 hover:text-indigo-300 font-medium flex items-center gap-1"
              >
                {copiedLink ? (
                  <>
                    <Check className="w-3.5 h-3.5 text-emerald-400" />
                    <span>リンクコピー完了</span>
                  </>
                ) : (
                  <>
                    <Share2 className="w-3.5 h-3.5" />
                    <span>同期用URLをコピー</span>
                  </>
                )}
              </button>
            </div>

            <div className="flex flex-col sm:flex-row items-center gap-4 p-3 bg-slate-950 rounded-xl border border-slate-800/80">
              <div className="p-2.5 bg-white rounded-xl shadow-lg shrink-0">
                <QRCodeSVG value={syncShareUrl} size={120} level="M" />
              </div>
              <div className="text-xs text-slate-400 space-y-1.5 text-center sm:text-left">
                <p className="font-medium text-slate-200">📱 スマホのカメラでQRコードをスキャン</p>
                <p>
                  iPhone・Androidの標準カメラアプリでQRコードを読み取ると、同じ同期コードでこのアプリが起動します。
                </p>
                <p className="text-slate-500 text-[11px]">
                  ※PCで追加・削除したブックマークはスマホにもリアルタイムで反映されます。
                </p>
              </div>
            </div>
          </div>

          {/* Connect / Change Sync Code */}
          <form onSubmit={handleSwitchCode} className="space-y-3 pt-2 border-t border-slate-800">
            <label className="block text-xs font-medium text-slate-300">
              既存の同期コードに接続、または別の端末とコードを合わせる
            </label>
            <div className="flex gap-2">
              <input
                type="text"
                value={inputCode}
                onChange={(e) => setInputCode(e.target.value)}
                placeholder="例: SYNC-1234-JP"
                className="flex-1 px-3.5 py-2 bg-slate-950 border border-slate-700 rounded-xl text-sm text-slate-100 placeholder-slate-500 uppercase tracking-wider font-mono focus:outline-none focus:ring-2 focus:ring-indigo-500"
              />
              <button
                type="submit"
                id="connect-sync-code-btn"
                disabled={isLoading || !inputCode.trim()}
                className="px-4 py-2 bg-indigo-600 hover:bg-indigo-500 disabled:opacity-50 text-white text-xs font-semibold rounded-xl transition shadow"
              >
                接続・変更
              </button>
            </div>
            <div className="flex items-center justify-between pt-1">
              <button
                type="button"
                id="generate-new-code-btn"
                onClick={handleGenerateNewCode}
                className="text-xs text-slate-400 hover:text-indigo-400 transition flex items-center gap-1"
              >
                <RefreshCw className="w-3 h-3" />
                <span>新しい同期コードを発行</span>
              </button>
              <button
                type="button"
                id="force-sync-now-btn"
                onClick={onForceSync}
                className="text-xs text-indigo-400 hover:text-indigo-300 font-medium flex items-center gap-1"
              >
                <RefreshCw className={`w-3 h-3 ${syncState.isSyncing ? 'animate-spin' : ''}`} />
                <span>手動で今すぐ同期</span>
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};
