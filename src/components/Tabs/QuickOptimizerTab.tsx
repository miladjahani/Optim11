import React, { useState, useRef } from 'react';
import {
  Zap,
  Copy,
  Check,
  QrCode,
  Sliders,
  Sparkles,
  RefreshCw,
  Upload,
  Download,
  AlertCircle,
  FileCode2
} from 'lucide-react';
import { ParsedProxyConfig, Language, AppTab } from '../../types';
import { translations } from '../../i18n';
import { resolveInputToConfigs, buildOptimizedVlessUri, buildSingBoxJson } from '../../utils/config-parser';
import { saveBatchConfigs } from '../../utils/db';

interface Props {
  lang: Language;
  onOpenQr: (title: string, url: string) => void;
  activeConfigs: ParsedProxyConfig[];
  setActiveConfigs: (cfgs: ParsedProxyConfig[]) => void;
  onNavigateTab: (tab: AppTab) => void;
}

export const QuickOptimizerTab: React.FC<Props> = ({
  lang,
  onOpenQr,
  activeConfigs,
  setActiveConfigs,
  onNavigateTab
}) => {
  const t = translations[lang];
  const isFa = lang === 'fa';
  const fileInputRef = useRef<HTMLInputElement>(null);

  const [inputConfig, setInputConfig] = useState(
    'https://edge-relay-cbbf.miladjahanii.workers.dev/feed/milad'
  );

  // Core Fragment & Protocol Parameters (Exactly matching original cf-optimizor)
  const [fragmentLength, setFragmentLength] = useState('100-200');
  const [fragmentInterval, setFragmentInterval] = useState('10-20');
  const [fragmentPackets, setFragmentPackets] = useState('1-3');
  const [earlyData, setEarlyData] = useState('2048');
  const [fingerprint, setFingerprint] = useState('chrome');
  const [alpn, setAlpn] = useState('h2,http/1.1');
  const [cleanIpOption, setCleanIpOption] = useState<'multi' | 'mci' | 'mtn' | 'rtl' | 'custom'>('multi');
  const [customIp, setCustomIp] = useState('104.16.1.1');

  const [copiedId, setCopiedId] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [optimizedOutputs, setOptimizedOutputs] = useState<string[]>([]);

  const handleOptimize = async () => {
    setLoading(true);
    setError('');
    try {
      const parsedList = await resolveInputToConfigs(inputConfig);
      if (parsedList.length === 0) {
        throw new Error(isFa ? 'کانفیگ یا لینک سابسکریپشن وارد شده نامعتبر است' : 'Invalid config or sub URL');
      }

      setActiveConfigs(parsedList);
      saveBatchConfigs(parsedList);

      const outputs: string[] = [];

      for (const p of parsedList) {
        const baseOpt: ParsedProxyConfig = {
          ...p,
          earlyData: earlyData || '2048',
          fingerprint: fingerprint || 'chrome',
          alpn: alpn || 'h2,http/1.1',
          fragmentEnabled: true,
          fragmentLength: fragmentLength || '100-200',
          fragmentInterval: fragmentInterval || '10-20',
          fragmentPackets: fragmentPackets || '1-3'
        };

        if (cleanIpOption === 'multi') {
          // Generate 4 operator variants
          outputs.push(buildOptimizedVlessUri(baseOpt, '104.16.1.1', `${p.name} 🟢 [همراه اول]`));
          outputs.push(buildOptimizedVlessUri(baseOpt, '104.17.2.2', `${p.name} 🟡 [ایرانسل]`));
          outputs.push(buildOptimizedVlessUri(baseOpt, '162.159.192.1', `${p.name} 🟣 [رایتل]`));
          outputs.push(buildOptimizedVlessUri(baseOpt, '172.67.182.11', `${p.name} 🔵 [مخابرات / شاتل]`));
        } else if (cleanIpOption === 'mci') {
          outputs.push(buildOptimizedVlessUri(baseOpt, '104.16.1.1', `${p.name} 🟢 [همراه اول]`));
        } else if (cleanIpOption === 'mtn') {
          outputs.push(buildOptimizedVlessUri(baseOpt, '104.17.2.2', `${p.name} 🟡 [ایرانسل]`));
        } else if (cleanIpOption === 'rtl') {
          outputs.push(buildOptimizedVlessUri(baseOpt, '162.159.192.1', `${p.name} 🟣 [رایتل]`));
        } else {
          outputs.push(buildOptimizedVlessUri(baseOpt, customIp || p.server, `${p.name} ⚡ [Clean IP]`));
        }
      }

      setOptimizedOutputs(outputs);
    } catch (err: any) {
      setError(err.message || 'خطا در بهینه‌سازی');
    } finally {
      setLoading(false);
    }
  };

  const handleApplyPreset = (presetType: 'anti_dpi' | 'gaming' | 'extreme') => {
    if (presetType === 'anti_dpi') {
      setFragmentLength('100-200');
      setFragmentInterval('10-20');
      setFragmentPackets('1-3');
    } else if (presetType === 'gaming') {
      setFragmentLength('50-100');
      setFragmentInterval('1-3');
      setFragmentPackets('1-2');
    } else if (presetType === 'extreme') {
      setFragmentLength('10-30');
      setFragmentInterval('5-15');
      setFragmentPackets('tlshello');
    }
  };

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (event) => {
      const content = event.target?.result as string;
      if (content) {
        setInputConfig(content);
      }
    };
    reader.readAsText(file);
  };

  const downloadJsonConfig = () => {
    if (activeConfigs.length === 0) return;
    const jsonStr = buildSingBoxJson(activeConfigs);
    const blob = new Blob([jsonStr], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'sing-box-config.json';
    a.click();
    URL.revokeObjectURL(url);
  };

  const handleCopy = (text: string, id: string) => {
    navigator.clipboard.writeText(text);
    setCopiedId(id);
    setTimeout(() => setCopiedId(null), 2000);
  };

  const handleCopyAll = () => {
    navigator.clipboard.writeText(optimizedOutputs.join('\n'));
    setCopiedId('all');
    setTimeout(() => setCopiedId(null), 2000);
  };

  return (
    <div className="space-y-6 max-w-5xl mx-auto animate-fadeIn">
      {/* Top Header Card */}
      <div className="glass-card rounded-3xl p-6 sm:p-8 border border-lime/30 shadow-2xl space-y-2">
        <div className="flex items-center gap-3 text-lime">
          <div className="p-3 bg-lime/10 border border-lime/30 rounded-2xl shadow-[0_0_20px_rgba(0,255,136,0.2)]">
            <Zap className="w-6 h-6" />
          </div>
          <div>
            <h2 className="text-xl sm:text-2xl font-black text-white">بهینه‌ساز پیشرفته کانفیگ و تزریق فرگمنت</h2>
            <p className="text-xs sm:text-sm text-slate-400 mt-0.5">
              تکه‌تکه‌سازی پکت‌های TLS ClientHello، تنظیم بازه‌های زمانی و تزریق آی‌پی‌های تمیز اپراتورها
            </p>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left Form: Clean, Pure, Focused */}
        <div className="lg:col-span-5 glass-card rounded-3xl p-6 border border-white/10 shadow-xl space-y-4 text-xs">
          <div>
            <div className="flex items-center justify-between mb-1.5">
              <label className="block text-slate-300 font-bold">کانفیگ خام یا آدرس سابسکریپشن:</label>
              <div className="flex items-center gap-2">
                <input
                  type="file"
                  ref={fileInputRef}
                  onChange={handleFileUpload}
                  accept=".json,.txt,.data,.dat,.cfg"
                  className="hidden"
                />
                <button
                  type="button"
                  onClick={() => fileInputRef.current?.click()}
                  className="text-[11px] font-bold text-cyan hover:underline flex items-center gap-1 cursor-pointer"
                >
                  <Upload className="w-3 h-3" />
                  <span>آپلود فایل</span>
                </button>
              </div>
            </div>
            <textarea
              rows={4}
              value={inputConfig}
              onChange={(e) => {
                setInputConfig(e.target.value);
                setError('');
              }}
              placeholder="vless://, trojan:// یا آدرس فید https://.../feed/..."
              className="w-full bg-slate-950 border border-slate-800 rounded-2xl p-3 text-white font-mono text-[11px] focus:border-lime focus:outline-none leading-relaxed"
              dir="ltr"
            />
          </div>

          {error && (
            <div className="p-3 bg-rose-500/15 border border-rose-500/30 rounded-xl text-rose-400 text-xs font-bold flex items-center gap-2">
              <AlertCircle className="w-4 h-4 shrink-0" />
              <span>{error}</span>
            </div>
          )}

          {/* Fragment Controls (Clean 3-Column Inputs) */}
          <div className="space-y-2 p-3.5 bg-slate-950/80 rounded-2xl border border-slate-800/90">
            <div className="flex items-center justify-between">
              <span className="font-bold text-white flex items-center gap-1.5">
                <Sliders className="w-3.5 h-3.5 text-lime" />
                <span>تنظیمات فرگمنت (TLS Fragment):</span>
              </span>
              <div className="flex items-center gap-1">
                <button
                  type="button"
                  onClick={() => handleApplyPreset('anti_dpi')}
                  className="px-2 py-0.5 rounded text-[10px] bg-slate-900 text-lime hover:bg-slate-800 border border-lime/20 cursor-pointer"
                >
                  ضد فیلتر
                </button>
                <button
                  type="button"
                  onClick={() => handleApplyPreset('gaming')}
                  className="px-2 py-0.5 rounded text-[10px] bg-slate-900 text-cyan hover:bg-slate-800 border border-cyan/20 cursor-pointer"
                >
                  گیمینگ
                </button>
              </div>
            </div>

            <div className="grid grid-cols-3 gap-2 pt-1 font-mono">
              <div>
                <span className="text-[10px] text-slate-400 block mb-1">Length:</span>
                <input
                  type="text"
                  value={fragmentLength}
                  onChange={(e) => setFragmentLength(e.target.value)}
                  className="w-full bg-slate-900 border border-slate-800 rounded-xl p-2 text-center text-lime font-bold"
                />
              </div>
              <div>
                <span className="text-[10px] text-slate-400 block mb-1">Interval:</span>
                <input
                  type="text"
                  value={fragmentInterval}
                  onChange={(e) => setFragmentInterval(e.target.value)}
                  className="w-full bg-slate-900 border border-slate-800 rounded-xl p-2 text-center text-lime font-bold"
                />
              </div>
              <div>
                <span className="text-[10px] text-slate-400 block mb-1">Packets:</span>
                <input
                  type="text"
                  value={fragmentPackets}
                  onChange={(e) => setFragmentPackets(e.target.value)}
                  className="w-full bg-slate-900 border border-slate-800 rounded-xl p-2 text-center text-lime font-bold"
                />
              </div>
            </div>
          </div>

          {/* Clean IP & Operator Strategy */}
          <div className="space-y-2">
            <label className="block text-slate-300 font-bold">استراتژی آی‌پی تمیز و اپراتورها:</label>
            <div className="grid grid-cols-2 gap-2">
              <button
                type="button"
                onClick={() => setCleanIpOption('multi')}
                className={`p-2.5 rounded-xl border text-xs font-bold transition-all cursor-pointer ${
                  cleanIpOption === 'multi'
                    ? 'bg-lime/10 border-lime text-white'
                    : 'bg-slate-950/60 border-slate-800 text-slate-400'
                }`}
              >
                🌐 تفکیک ۴ اپراتور
              </button>
              <button
                type="button"
                onClick={() => setCleanIpOption('mci')}
                className={`p-2.5 rounded-xl border text-xs font-bold transition-all cursor-pointer ${
                  cleanIpOption === 'mci'
                    ? 'bg-lime/10 border-lime text-lime'
                    : 'bg-slate-950/60 border-slate-800 text-slate-400'
                }`}
              >
                🟢 فقط همراه اول
              </button>
              <button
                type="button"
                onClick={() => setCleanIpOption('mtn')}
                className={`p-2.5 rounded-xl border text-xs font-bold transition-all cursor-pointer ${
                  cleanIpOption === 'mtn'
                    ? 'bg-amber-400/10 border-amber-400 text-amber-300'
                    : 'bg-slate-950/60 border-slate-800 text-slate-400'
                }`}
              >
                🟡 فقط ایرانسل
              </button>
              <button
                type="button"
                onClick={() => setCleanIpOption('custom')}
                className={`p-2.5 rounded-xl border text-xs font-bold transition-all cursor-pointer ${
                  cleanIpOption === 'custom'
                    ? 'bg-cyan/10 border-cyan text-cyan'
                    : 'bg-slate-950/60 border-slate-800 text-slate-400'
                }`}
              >
                ⚡ آی‌پی تمیز دلخواه
              </button>
            </div>

            {cleanIpOption === 'custom' && (
              <div className="pt-1 font-mono">
                <input
                  type="text"
                  value={customIp}
                  onChange={(e) => setCustomIp(e.target.value)}
                  placeholder="104.16.1.1"
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-cyan text-xs focus:border-cyan focus:outline-none"
                  dir="ltr"
                />
              </div>
            )}
          </div>

          {/* Main Action Button */}
          <button
            onClick={handleOptimize}
            disabled={loading}
            className="w-full py-3.5 bg-lime text-black font-black text-xs rounded-2xl hover:shadow-[0_0_20px_rgba(0,255,136,0.4)] transition-all cursor-pointer flex items-center justify-center gap-2 disabled:opacity-50"
          >
            {loading ? (
              <>
                <span className="w-4 h-4 border-2 border-black border-t-transparent rounded-full animate-spin" />
                <span>در حال بهینه‌سازی...</span>
              </>
            ) : (
              <>
                <Sparkles className="w-4 h-4" />
                <span>بهینه‌سازی و اعمال فرگمنت</span>
              </>
            )}
          </button>
        </div>

        {/* Right Output: Clean, Direct, Action-Oriented */}
        <div className="lg:col-span-7 glass-card rounded-3xl p-6 border border-white/10 shadow-xl space-y-4 flex flex-col justify-between">
          <div className="space-y-3">
            <div className="flex items-center justify-between border-b border-slate-800 pb-3 flex-wrap gap-2">
              <div className="flex items-center gap-2">
                <span className="text-xs font-bold text-slate-300">
                  کانفیگ‌های بهینه‌شده:
                </span>
                {optimizedOutputs.length > 0 && (
                  <span className="text-[11px] font-mono px-2 py-0.5 rounded-full bg-lime/15 text-lime border border-lime/30">
                    {optimizedOutputs.length} نود فعال
                  </span>
                )}
              </div>

              {optimizedOutputs.length > 0 && (
                <div className="flex items-center gap-1.5">
                  <button
                    onClick={downloadJsonConfig}
                    className="px-3 py-1.5 bg-purple-500/20 text-purple-300 border border-purple-500/30 hover:bg-purple-500/30 font-bold text-xs rounded-xl flex items-center gap-1 cursor-pointer"
                    title="دانلود فایل JSON برای Sing-Box"
                  >
                    <Download className="w-3.5 h-3.5" />
                    <span>دانلود JSON</span>
                  </button>

                  <button
                    onClick={handleCopyAll}
                    className="px-3 py-1.5 bg-slate-900 hover:bg-slate-800 border border-slate-700 text-lime font-bold text-xs rounded-xl flex items-center gap-1 cursor-pointer"
                  >
                    {copiedId === 'all' ? <Check className="w-3.5 h-3.5" /> : <Copy className="w-3.5 h-3.5" />}
                    <span>{copiedId === 'all' ? 'کپی شد!' : 'کپی همه نودها'}</span>
                  </button>
                </div>
              )}
            </div>

            <div className="space-y-3 max-h-[380px] overflow-y-auto pr-1">
              {optimizedOutputs.length === 0 ? (
                <div className="h-48 flex flex-col items-center justify-center text-slate-500 text-xs gap-2">
                  <Sparkles className="w-8 h-8 text-slate-600" />
                  <span>کانفیگ یا لینک فید خود را وارد کرده و دکمه بهینه‌سازی را بزنید...</span>
                </div>
              ) : (
                optimizedOutputs.map((outUri, idx) => (
                  <div
                    key={idx}
                    className="p-3.5 bg-slate-950 rounded-2xl border border-slate-800 hover:border-slate-700 transition-all space-y-2"
                  >
                    <div className="flex items-center justify-between text-xs">
                      <span className="font-mono font-bold text-cyan truncate max-w-[260px]">
                        {decodeURIComponent(outUri.split('#')[1] || `Node ${idx + 1}`)}
                      </span>
                      <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-lime/10 text-lime border border-lime/20">
                        Fragment Ready ⚡
                      </span>
                    </div>

                    <div className="bg-slate-900/90 p-2.5 rounded-xl font-mono text-[10px] text-slate-300 break-all max-h-16 overflow-y-auto" dir="ltr">
                      {outUri}
                    </div>

                    <div className="flex items-center gap-2 pt-1">
                      <button
                        onClick={() => handleCopy(outUri, `out-${idx}`)}
                        className="flex-1 py-1.5 bg-lime text-black font-black text-xs rounded-xl hover:shadow-[0_0_12px_rgba(0,255,136,0.3)] transition-all cursor-pointer flex items-center justify-center gap-1"
                      >
                        {copiedId === `out-${idx}` ? <Check className="w-3 h-3" /> : <Copy className="w-3 h-3" />}
                        <span>{copiedId === `out-${idx}` ? t.copied : t.copy}</span>
                      </button>
                      <button
                        onClick={() => onOpenQr('کانفیگ بهینه‌شده', outUri)}
                        className="p-1.5 bg-slate-900 hover:bg-slate-800 text-cyan border border-cyan/30 rounded-xl cursor-pointer"
                        title="QR Code"
                      >
                        <QrCode className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>

          {/* Simple Direct Chained Jumps */}
          {optimizedOutputs.length > 0 && (
            <div className="grid grid-cols-3 gap-2 pt-2 border-t border-slate-800/80 text-[11px] font-bold">
              <button
                onClick={() => onNavigateTab('converter')}
                className="p-2.5 bg-slate-900 hover:bg-slate-800 text-purple-300 border border-purple-500/30 rounded-xl flex items-center justify-center gap-1 cursor-pointer"
              >
                <span>🔄 مبدل Sing-Box</span>
              </button>
              <button
                onClick={() => onNavigateTab('gaming_live_ping')}
                className="p-2.5 bg-slate-900 hover:bg-slate-800 text-cyan border border-cyan/30 rounded-xl flex items-center justify-center gap-1 cursor-pointer"
              >
                <span>🎮 پینگ زنده نودها</span>
              </button>
              <button
                onClick={() => onNavigateTab('sub_link_gen')}
                className="p-2.5 bg-slate-900 hover:bg-slate-800 text-lime border border-lime/30 rounded-xl flex items-center justify-center gap-1 cursor-pointer"
              >
                <span>🔗 ساخت لینک ساب</span>
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
