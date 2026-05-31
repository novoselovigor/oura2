import React, { useState } from "react";
import { Key, Calendar, Shield, Cpu, RefreshCw, AlertCircle, HelpCircle } from "lucide-react";
import { ApiConfig, ProxyMode, formatDate, isLocalServerAvailable } from "../utils/ouraApi";

interface OuraSettingsProps {
  config: ApiConfig;
  startDate: string;
  endDate: string;
  isLoading: boolean;
  onConfigChange: (config: ApiConfig) => void;
  onDatesChange: (start: string, end: string) => void;
  onFetchData: () => void;
  errorMsg: string | null;
  hasData: boolean;
}

export default function OuraSettings({
  config,
  startDate,
  endDate,
  isLoading,
  onConfigChange,
  onDatesChange,
  onFetchData,
  errorMsg,
  hasData,
}: OuraSettingsProps) {
  const [showTokenHelp, setShowTokenHelp] = useState(false);
  const [showProxyHelp, setShowProxyHelp] = useState(false);

  const handleTokenChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    onConfigChange({ ...config, token: e.target.value });
  };

  const handleProxyModeChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    onConfigChange({ ...config, proxyMode: e.target.value as ProxyMode });
  };

  const handleCustomProxyUrlChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    onConfigChange({ ...config, customProxyUrl: e.target.value });
  };

  const setRangeDays = (days: number) => {
    const end = new Date();
    const start = new Date();
    start.setDate(end.getDate() - days);
    onDatesChange(formatDate(start), formatDate(end));
  };

  return (
    <div id="oura-settings-panel" className="bg-[#1C1C1E] border border-gray-800 rounded-3xl p-6 shadow-xl text-[#F5F5F7] transition-all">
      <div className="flex flex-col md:flex-row md:items-center md:justify-between border-b border-gray-800 pb-4 mb-6 gap-4">
        <div>
          <h2 className="text-xl font-semibold tracking-tight text-[#F5F5F7] flex items-center gap-2">
            <Cpu className="text-[#D4AF37] w-5 h-5" />
            Oura Connection Settings
          </h2>
          <p className="text-xs text-gray-400 mt-1">
            Configure your Oura Ring Personal Access Token & search guidelines.
          </p>
        </div>
        <div className="flex flex-wrap gap-2">
          <button
            type="button"
            id="set-7days-btn"
            onClick={() => setRangeDays(7)}
            className="px-3.5 py-1.5 text-xs font-semibold rounded-xl bg-[#2C2C2E] hover:bg-[#3A3A3C] text-gray-300 border border-gray-800 transition-colors cursor-pointer"
          >
            Last 7 Days
          </button>
          <button
            type="button"
            id="set-30days-btn"
            onClick={() => setRangeDays(30)}
            className="px-3.5 py-1.5 text-xs font-semibold rounded-xl bg-[#2C2C2E] hover:bg-[#3A3A3C] text-gray-300 border border-gray-800 transition-colors cursor-pointer"
          >
            Last 30 Days
          </button>
        </div>
      </div>

      <form
        onSubmit={(e) => {
          e.preventDefault();
          onFetchData();
        }}
        className="space-y-6"
      >
        {/* API Token Input */}
        <div className="space-y-2">
          <div className="flex justify-between items-center">
            <label htmlFor="token-input" className="text-sm font-medium text-gray-300 flex items-center gap-2">
              <Key className="w-4 h-4 text-[#D4AF37]" />
              Oura Personal Access Token
            </label>
            <button
              type="button"
              id="token-help-toggle"
              onClick={() => setShowTokenHelp(!showTokenHelp)}
              className="text-gray-450 hover:text-white flex items-center gap-1.5 text-xs transition-colors cursor-pointer"
            >
              <HelpCircle className="w-3.5 h-3.5 text-[#D4AF37]" />
              <span>How to get?</span>
            </button>
          </div>

          {showTokenHelp && (
            <div className="bg-[#0B0B0C] p-4 rounded-2xl border border-gray-800 text-xs text-gray-300 leading-relaxed mb-1 space-y-2">
              <p className="font-semibold text-[#D4AF37]">Step-by-step instructions:</p>
              <ol className="list-decimal list-inside space-y-1.5 text-gray-300">
                <li>
                  Sign in to the official Oura Cloud Console at{" "}
                  <a
                    href="https://cloud.ouraring.com/personal-access-tokens"
                    target="_blank"
                    referrerPolicy="no-referrer"
                    rel="noreferrer"
                    className="text-[#D4AF37] hover:underline inline-flex items-center gap-0.5"
                  >
                    cloud.ouraring.com API keys
                  </a>
                </li>
                <li>Click <strong>&quot;Create Personal Access Token&quot;</strong>.</li>
                <li>Provide a label, click generate, and copy the produced string (PAT).</li>
                <li>Paste the string below. This token remains stored privately in your browser&apos;s localStorage.</li>
              </ol>
            </div>
          )}

          <input
            type="password"
            id="token-input"
            value={config.token}
            onChange={handleTokenChange}
            placeholder="eyJhbGciOiJSUzI1NiIsInR5cCI6IkpXVCIs..."
            className="w-full bg-[#0B0B0C] border border-gray-800 rounded-2xl px-4 py-3 text-sm text-[#F5F5F7] placeholder-gray-600 focus:outline-none focus:ring-2 focus:ring-[#D4AF37]/40 focus:border-[#D4AF37] transition-all font-mono"
            required
          />
        </div>

        {/* Date Filter & Proxy Setup Row */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {/* Start Date */}
          <div className="space-y-2">
            <label htmlFor="start-date-input" className="text-sm font-medium text-gray-300 flex items-center gap-2">
              <Calendar className="w-4 h-4 text-[#D4AF37]" />
              Start Date (Local Time)
            </label>
            <input
              type="date"
              id="start-date-input"
              value={startDate}
              onChange={(e) => onDatesChange(e.target.value, endDate)}
              max={formatDate(new Date())}
              className="w-full bg-[#0B0B0C] border border-gray-800 rounded-2xl px-4 py-3 text-sm text-[#F5F5F7] focus:outline-none focus:ring-2 focus:ring-[#D4AF37]/40 focus:border-[#D4AF37] transition-all"
              required
            />
          </div>

          {/* End Date */}
          <div className="space-y-2">
            <label htmlFor="end-date-input" className="text-sm font-medium text-gray-300 flex items-center gap-2">
              <Calendar className="w-4 h-4 text-[#D4AF37]" />
              End Date (Local Time)
            </label>
            <input
              type="date"
              id="end-date-input"
              value={endDate}
              onChange={(e) => onDatesChange(startDate, e.target.value)}
              max={formatDate(new Date())}
              className="w-full bg-[#0B0B0C] border border-gray-800 rounded-2xl px-4 py-3 text-sm text-[#F5F5F7] focus:outline-none focus:ring-2 focus:ring-[#D4AF37]/40 focus:border-[#D4AF37] transition-all"
              required
            />
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-2">
          {/* Proxy Mode Choice */}
          <div className="space-y-2">
            <div className="flex justify-between items-center">
              <label htmlFor="proxy-mode-select" className="text-sm font-medium text-gray-300 flex items-center gap-2">
                <Shield className="w-4 h-4 text-[#D4AF37]" />
                CORS Bypass Proxy
              </label>
              <button
                type="button"
                id="proxy-help-toggle"
                onClick={() => setShowProxyHelp(!showProxyHelp)}
                className="text-gray-400 hover:text-white cursor-pointer"
              >
                <HelpCircle className="w-3.5 h-3.5 text-[#D4AF37]" />
              </button>
            </div>

            {showProxyHelp && (
              <div className="bg-[#0B0B0C] p-4 rounded-2xl border border-gray-800 text-xs text-gray-300 leading-relaxed mb-1">
                <p className="font-semibold text-[#D4AF37] mb-1">Why bypass CORS with a proxy?</p>
                <p>
                  Oura&apos;s API blocks raw browser-originated client requests due to strict CORS policies. 
                  {isLocalServerAvailable() ? (
                    <span> To solve this, the <strong className="text-white">Local Secure Proxy</strong> routes your token securely through this preview&apos;s Node.js server. This is fast, private, and CORS-free.</span>
                  ) : (
                    <span> Since you are deployed on a static web host (like GitHub), we route requests safely through browser-friendly public CORS gateways like <strong className="text-white">corsproxy.io</strong> or <strong className="text-white">allorigins.win</strong>, or you can provide a custom proxy.</span>
                  )}
                </p>
              </div>
            )}

            <select
              id="proxy-mode-select"
              value={config.proxyMode}
              onChange={handleProxyModeChange}
              className="w-full bg-[#0B0B0C] border border-gray-800 rounded-2xl px-4 py-3 text-sm text-[#F5F5F7] focus:outline-none focus:ring-2 focus:ring-[#D4AF37]/40 focus:border-[#D4AF37] transition-all"
            >
              {isLocalServerAvailable() && (
                <option value="localproxy">Local Secure Proxy (Recommended / CORS-free)</option>
              )}
              <option value="corsproxy.io">{isLocalServerAvailable() ? "corsproxy.io (Public Web Proxy)" : "corsproxy.io (Recommended / CORS-free)"}</option>
              <option value="allorigins">allorigins.win (Alternative Public Proxy)</option>
              <option value="direct">Direct (Direct Client to Oura - fails CORS in pure browser)</option>
              <option value="custom">Custom Proxy URL</option>
            </select>
          </div>

          {/* Custom Proxy URL config (shown only if Custom is selected) */}
          {config.proxyMode === "custom" && (
            <div className="space-y-2">
              <label htmlFor="custom-proxy-input" className="text-sm font-medium text-gray-350">
                Custom Proxy Base URL OR Pattern
              </label>
              <input
                type="url"
                id="custom-proxy-input"
                value={config.customProxyUrl || ""}
                onChange={handleCustomProxyUrlChange}
                placeholder="https://my-proxy.com/?url={url}"
                className="w-full bg-[#0B0B0C] border border-gray-800 rounded-2xl px-4 py-3 text-sm text-[#F5F5F7] focus:outline-none focus:ring-2 focus:ring-[#D4AF37]/40 focus:border-[#D4AF37] transition-all font-mono"
                required
              />
              <span className="text-[10px] text-gray-500">
                {`Include {url} if your proxy expects a query parameter, otherwise the API url will be appended.`}
              </span>
            </div>
          )}
        </div>

        {/* Action Button & Error Messages */}
        <div className="pt-2">
          {errorMsg && (
            <div className="mb-4 bg-red-950/40 border border-red-500/30 rounded-2xl p-4 flex items-start gap-3">
              <AlertCircle className="w-5 h-5 text-red-500 shrink-0 mt-0.5" />
              <div>
                <p className="text-sm font-semibold text-red-400">Request Failed</p>
                <p className="text-xs text-red-300 mt-1 leading-relaxed">{errorMsg}</p>
                <p className="text-[11px] text-gray-500 mt-2">
                  Tip: If you get CORS errors, try using the default <strong>corsproxy.io</strong> setting.
                </p>
              </div>
            </div>
          )}

          <button
            type="submit"
            id="fetch-oura-data-btn"
            disabled={isLoading}
            className="w-full bg-[#D4AF37] hover:bg-[#c29f2f] active:bg-[#aa8b27] disabled:bg-gray-800 disabled:text-gray-500 text-[#0B0B0C] font-bold px-6 py-4 rounded-2xl transition-all shadow-lg shadow-[#D4AF37]/5 flex items-center justify-center gap-2.5 text-sm cursor-pointer"
          >
            {isLoading ? (
              <>
                <RefreshCw className="w-4 h-4 animate-spin" />
                <span>Pulling Oura Sync Servers...</span>
              </>
            ) : (
              <>
                <RefreshCw className="w-4 h-4" />
                <span>{hasData ? "Refresh Oura Data" : "Load Oura Ring Data"}</span>
              </>
            )}
          </button>
        </div>
      </form>
    </div>
  );
}
