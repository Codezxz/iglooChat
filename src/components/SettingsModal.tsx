import React, { useState } from 'react';
import { 
  X, 
  Key, 
  Eye, 
  EyeOff, 
  Sliders, 
  Globe, 
  BookOpen, 
  Cpu, 
  FileText, 
  Sparkles,
  Info
} from 'lucide-react';

interface Preset {
  id: string;
  name: string;
  desc: string;
  systemInstruction: string;
  prompt: string;
  icon: any;
}

interface SettingsModalProps {
  isOpen: boolean;
  onClose: () => void;
  userApiKey: string;
  setUserApiKey: (val: string) => void;
  keyInput: string;
  setKeyInput: (val: string) => void;
  showKey: boolean;
  setShowKey: (val: boolean) => void;
  selectedModel: string;
  setSelectedModel: (val: string) => void;
  systemInstruction: string;
  setSystemInstruction: (val: string) => void;
  temperature: number;
  setTemperature: (val: number) => void;
  useSearchGrounding: boolean;
  setUseSearchGrounding: (val: boolean) => void;
  presets: Preset[];
  onApplyPreset: (preset: Preset) => void;
  hasKey: boolean | null;
}

export default function SettingsModal({
  isOpen,
  onClose,
  userApiKey,
  setUserApiKey,
  keyInput,
  setKeyInput,
  showKey,
  setShowKey,
  selectedModel,
  setSelectedModel,
  systemInstruction,
  setSystemInstruction,
  temperature,
  setTemperature,
  useSearchGrounding,
  setUseSearchGrounding,
  presets,
  onApplyPreset,
  hasKey
}: SettingsModalProps) {
  const [activeTab, setActiveTab] = useState<'api' | 'params' | 'presets'>('api');

  if (!isOpen) return null;

  return (
    <div id="settings-modal-backdrop" className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-slate-950/60 backdrop-blur-md animate-fade-in select-none">
      <div 
        id="settings-modal-card" 
        className="w-full max-w-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl shadow-2xl flex flex-col max-h-[90vh] overflow-hidden"
      >
        {/* Header */}
        <div className="px-6 py-4 border-b border-slate-100 dark:border-slate-800 flex items-center justify-between">
          <div>
            <h3 className="text-base font-extrabold text-slate-900 dark:text-white tracking-tight">Workspace Configuration</h3>
            <p className="text-xs text-slate-500 dark:text-slate-400 font-medium">Fine-tune model intelligence and connection parameters.</p>
          </div>
          <button 
            onClick={onClose}
            className="p-2 rounded-xl text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 hover:bg-slate-50 dark:hover:bg-slate-800 transition-colors cursor-pointer"
          >
            <X size={18} />
          </button>
        </div>

        {/* Settings Navigation Tabs */}
        <div className="flex border-b border-slate-100 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-950/20 px-6 py-2 gap-2">
          {[
            { id: 'api', name: 'API Settings', icon: Key },
            { id: 'params', name: 'Model Parameters', icon: Sliders },
            { id: 'presets', name: 'System Presets', icon: BookOpen },
          ].map((tab) => {
            const Icon = tab.icon;
            const isActive = activeTab === tab.id;
            return (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id as any)}
                className={`flex items-center gap-1.5 px-4 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                  isActive 
                    ? 'bg-indigo-50 dark:bg-indigo-950/40 text-indigo-700 dark:text-indigo-400 shadow-inner' 
                    : 'text-slate-500 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
                }`}
              >
                <Icon size={14} />
                <span>{tab.name}</span>
              </button>
            );
          })}
        </div>

        {/* Content Box */}
        <div className="flex-1 overflow-y-auto no-scrollbar p-6 space-y-6">
          
          {/* TAB 1: API SETTINGS */}
          {activeTab === 'api' && (
            <div className="space-y-5 animate-fade-in">
              {/* API Guard Warning */}
              {hasKey === false && !userApiKey && (
                <div className="bg-amber-50/80 dark:bg-amber-950/20 border border-amber-200 dark:border-amber-900/50 rounded-2xl p-4 flex gap-3">
                  <Info size={18} className="text-amber-500 shrink-0 mt-0.5" />
                  <div className="space-y-1">
                    <h4 className="text-xs font-bold text-amber-950 dark:text-amber-200">Missing Server API Key</h4>
                    <p className="text-[11px] text-amber-800 dark:text-amber-300 leading-relaxed font-semibold">
                      To activate direct workspace requests, you must either specify your custom key below, or provide GEMINI_API_KEY inside the Secrets menu in Google AI Studio.
                    </p>
                  </div>
                </div>
              )}

              <div className="bg-slate-50 dark:bg-slate-950/40 border border-slate-100 dark:border-slate-800 p-5 rounded-2xl space-y-4">
                <div className="flex items-center justify-between pb-3 border-b border-slate-200 dark:border-slate-800">
                  <span className="text-xs font-bold text-slate-800 dark:text-slate-200 uppercase tracking-wider font-mono">Custom API Authentication</span>
                  {userApiKey ? (
                    <span className="text-[10px] font-black bg-green-500/10 text-green-500 border border-green-500/20 px-2 py-0.5 rounded-full">ACTIVE</span>
                  ) : (
                    <span className="text-[10px] font-bold bg-slate-200 dark:bg-slate-800 text-slate-600 dark:text-slate-400 px-2 py-0.5 rounded-full">SANDBOX</span>
                  )}
                </div>

                <p className="text-xs text-slate-500 dark:text-slate-400 font-medium leading-relaxed">
                  Your custom key is saved locally in your browser session. Custom API keys bypass public sandbox rate limits, enabling robust, high-frequency code execution.
                </p>

                <form onSubmit={(e) => {
                  e.preventDefault();
                  setUserApiKey(keyInput.trim());
                }} className="space-y-3 text-left">
                  <div className="space-y-1.5">
                    <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider font-mono">Gemini API Key</label>
                    <div className="relative">
                      <input
                        type={showKey ? "text" : "password"}
                        value={keyInput}
                        onChange={(e) => setKeyInput(e.target.value)}
                        placeholder="AIzaSy..."
                        className="w-full text-xs font-mono bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl pl-4 pr-10 py-3 focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 outline-none transition-all text-slate-800 dark:text-slate-100 select-text"
                      />
                      <button
                        type="button"
                        onClick={() => setShowKey(!showKey)}
                        className="absolute right-3.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 cursor-pointer"
                      >
                        {showKey ? <EyeOff size={14} /> : <Eye size={14} />}
                      </button>
                    </div>
                  </div>

                  <div className="flex gap-2.5">
                    <button
                      type="submit"
                      disabled={!keyInput.trim() || keyInput.trim() === userApiKey}
                      className="flex-1 py-2.5 px-4 rounded-xl bg-indigo-600 hover:bg-indigo-700 disabled:bg-slate-100 dark:disabled:bg-slate-800 disabled:text-slate-400 text-white text-xs font-bold transition-all cursor-pointer"
                    >
                      Save Key
                    </button>
                    {userApiKey && (
                      <button
                        type="button"
                        onClick={() => {
                          setUserApiKey('');
                          setKeyInput('');
                        }}
                        className="py-2.5 px-4 rounded-xl border border-red-200 dark:border-red-900/50 hover:bg-red-50 dark:hover:bg-red-950/20 text-red-600 dark:text-red-400 text-xs font-bold transition-all cursor-pointer"
                      >
                        Clear Custom Key
                      </button>
                    )}
                  </div>
                </form>
              </div>
            </div>
          )}

          {/* TAB 2: MODEL PARAMETERS */}
          {activeTab === 'params' && (
            <div className="space-y-5 animate-fade-in text-left">
              {/* Select Model */}
              <div className="space-y-1.5">
                <label className="text-xs font-extrabold text-slate-700 dark:text-slate-300 flex items-center justify-between">
                  <span>Target LLM Model</span>
                  <span className="text-[10px] text-indigo-600 dark:text-indigo-400 font-extrabold bg-indigo-50 dark:bg-indigo-950/40 px-2 py-0.5 rounded-full">Gemini Pro/Flash</span>
                </label>
                <select
                  value={selectedModel}
                  onChange={(e) => setSelectedModel(e.target.value)}
                  className="w-full text-xs font-semibold bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-800 rounded-xl px-3.5 py-3 focus:bg-white dark:focus:bg-slate-800 focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 outline-none transition-all cursor-pointer text-slate-800 dark:text-slate-100"
                >
                  <option value="gemini-2.5-flash">Gemini 2.5 Flash (Recommended General)</option>
                  <option value="gemini-2.5-pro">Gemini 2.5 Pro (Complex Reasoning & Coding)</option>
                  <option value="gemini-2.0-flash">Gemini 2.0 Flash (Next-Gen Fast)</option>
                  <option value="gemini-2.0-flash-lite">Gemini 2.0 Flash Lite (Ultra-Low Latency)</option>
                  <option value="gemini-1.5-pro">Gemini 1.5 Pro (Deep Context Analytical)</option>
                  <option value="gemini-1.5-flash">Gemini 1.5 Flash (Standard Speed)</option>
                  <option value="gemini-1.5-flash-8b">Gemini 1.5 Flash 8B (Micro-latency Tasks)</option>
                  <option value="gemini-3.5-flash">Gemini 3.5 Flash (Advanced Experimental)</option>
                  <option value="gemini-3.1-flash-lite">Gemini 3.1 Flash Lite (Experimental Fast)</option>
                </select>
              </div>

              {/* System Instructions */}
              <div className="space-y-1.5 flex flex-col">
                <label className="text-xs font-extrabold text-slate-700 dark:text-slate-300 flex items-center justify-between">
                  <span>System Role & Guidelines</span>
                  <span className="text-[10px] text-slate-400 dark:text-slate-500 font-medium">Inject context directly into model consciousness</span>
                </label>
                <textarea
                  value={systemInstruction}
                  onChange={(e) => setSystemInstruction(e.target.value)}
                  placeholder="e.g., You are a TypeScript and React architect. Give clean code snippets..."
                  className="w-full min-h-[140px] text-xs font-medium bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-800 rounded-xl p-3 focus:bg-white dark:focus:bg-slate-800 focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 outline-none transition-all resize-none placeholder:text-slate-400 dark:placeholder:text-slate-600 select-text text-slate-800 dark:text-slate-100"
                />
              </div>

              {/* Temperature Slider */}
              <div className="space-y-2 bg-slate-50 dark:bg-slate-950/40 border border-slate-100 dark:border-slate-800 p-4 rounded-2xl">
                <div className="flex items-center justify-between text-xs">
                  <span className="font-extrabold text-slate-700 dark:text-slate-300">Generation Temperature</span>
                  <span className="font-mono font-bold text-slate-900 dark:text-white bg-slate-200 dark:bg-slate-800 px-2 py-0.5 rounded-lg">
                    {temperature.toFixed(1)}
                  </span>
                </div>
                <input
                  type="range"
                  min="0.0"
                  max="2.0"
                  step="0.1"
                  value={temperature}
                  onChange={(e) => setTemperature(parseFloat(e.target.value))}
                  className="w-full accent-indigo-600 dark:accent-indigo-400 cursor-pointer"
                />
                <div className="flex justify-between text-[10px] text-slate-400 dark:text-slate-500 font-bold">
                  <span>Deterministic (0.0)</span>
                  <span>Balanced (0.7)</span>
                  <span>Creative (2.0)</span>
                </div>
              </div>

              {/* Google Search Grounding */}
              <div className="bg-slate-50 dark:bg-slate-950/40 border border-slate-100 dark:border-slate-800 rounded-2xl p-4 flex items-center justify-between">
                <div className="space-y-0.5">
                  <label className="text-xs font-bold text-slate-800 dark:text-slate-200 flex items-center gap-1.5">
                    <Globe size={14} className="text-indigo-600 dark:text-indigo-400" />
                    <span>Real-time Google Grounding</span>
                  </label>
                  <p className="text-[10px] text-slate-400 dark:text-slate-500 leading-normal font-medium max-w-[340px]">
                    Inject live query-related web articles and citations directly into model synthesis.
                  </p>
                </div>
                <label className="relative inline-flex items-center cursor-pointer">
                  <input
                    type="checkbox"
                    checked={useSearchGrounding}
                    onChange={(e) => setUseSearchGrounding(e.target.checked)}
                    className="sr-only peer"
                  />
                  <div className="w-10 h-5.5 bg-slate-200 dark:bg-slate-800 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[3px] after:left-[2px] after:bg-white after:border-slate-300 after:border after:rounded-full after:h-4.5 after:w-4.5 after:transition-all peer-checked:bg-indigo-600 dark:peer-checked:bg-indigo-500" />
                </label>
              </div>
            </div>
          )}

          {/* TAB 3: SYSTEM PRESETS */}
          {activeTab === 'presets' && (
            <div className="space-y-4 animate-fade-in text-left">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3.5">
                {presets.map((preset) => {
                  const Icon = preset.icon;
                  return (
                    <button
                      key={preset.id}
                      onClick={() => {
                        onApplyPreset(preset);
                        onClose();
                      }}
                      className="flex text-left items-start gap-3.5 p-4 rounded-2xl border border-slate-100 dark:border-slate-800 hover:border-indigo-100 dark:hover:border-indigo-900/45 hover:bg-indigo-50/20 dark:hover:bg-indigo-950/10 transition-all group cursor-pointer"
                    >
                      <div className="w-9 h-9 rounded-xl bg-slate-50 dark:bg-slate-800 group-hover:bg-indigo-50 dark:group-hover:bg-indigo-950/30 flex items-center justify-center text-slate-500 dark:text-slate-400 group-hover:text-indigo-600 dark:group-hover:text-indigo-400 transition-all shrink-0 mt-0.5 shadow-sm">
                        <Icon size={16} />
                      </div>
                      <div className="space-y-0.5">
                        <h4 className="text-xs font-bold text-slate-800 dark:text-slate-200 group-hover:text-indigo-950 dark:group-hover:text-indigo-400 transition-colors">
                          {preset.name}
                        </h4>
                        <p className="text-[10px] text-slate-400 dark:text-slate-500 font-semibold group-hover:text-indigo-900/60 leading-normal line-clamp-2">
                          {preset.desc}
                        </p>
                      </div>
                    </button>
                  );
                })}
              </div>
            </div>
          )}

        </div>

        {/* Footer */}
        <div className="px-6 py-4 bg-slate-50 dark:bg-slate-950/40 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between">
          <span className="text-[10px] font-mono text-slate-400 dark:text-slate-500 font-bold uppercase tracking-wider">
            SANDBOX ENGINE v3.5
          </span>
          <button
            onClick={onClose}
            className="px-4 py-2 bg-indigo-600 hover:bg-indigo-700 active:bg-indigo-800 text-white text-xs font-bold rounded-xl transition-all cursor-pointer shadow-sm"
          >
            Apply & Close
          </button>
        </div>
      </div>
    </div>
  );
}
