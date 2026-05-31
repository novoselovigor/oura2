import { useState } from "react";
import { Cpu, Copy, Check, Terminal, FileText, CornerDownRight } from "lucide-react";

interface RawDataTabProps {
  rawResponses: Record<string, any>;
}

export default function RawDataTab({ rawResponses }: RawDataTabProps) {
  const endpoints = Object.keys(rawResponses);
  const [activeEndpoint, setActiveEndpoint] = useState<string>(
    endpoints.length > 0 ? endpoints[0] : ""
  );
  const [copied, setCopied] = useState(false);

  // Auto-select a fallback if the active endpoint is empty but there's loaded responses
  const selectedEndpoint = activeEndpoint || (endpoints.length > 0 ? endpoints[0] : "");

  if (endpoints.length === 0) {
    return (
      <div id="raw-no-data" className="bg-[#1C1C1E] border border-gray-800 rounded-3xl p-8 text-center text-gray-400">
        <Terminal className="w-12 h-12 mx-auto text-[#D4AF37] opacity-60 mb-3 animate-pulse" />
        <p className="font-medium text-white text-base">No Server Payloads Loaded</p>
        <p className="text-xs text-gray-500 mt-1 max-w-md mx-auto">
          Raw JSON data is displayed after you enter a valid token and click load data.
        </p>
      </div>
    );
  }

  const payload = rawResponses[selectedEndpoint];
  const jsonString = JSON.stringify(payload, null, 2);

  const handleCopy = () => {
    navigator.clipboard.writeText(jsonString).then(() => {
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    });
  };

  return (
    <div id="raw-data-tab-root" className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
      {/* Selector side rail */}
      <div className="lg:col-span-4 bg-[#1C1C1E] border border-gray-800 rounded-3xl p-4 shadow-xl">
        <h3 className="text-sm font-semibold text-gray-300 px-2 pb-3 mb-2 border-b border-gray-800 flex items-center gap-2">
          <FileText className="w-4 h-4 text-[#D4AF37]" />
          Oura API V2 Payloads
        </h3>
        <p className="text-[11px] text-gray-500 px-2 mb-4">
          Select an endpoint below to inspect the exact JSON dictionary received from your Oura Ring:
        </p>
        
        <div className="space-y-1">
          {endpoints.map((ep) => {
            const isSelected = ep === selectedEndpoint;
            const sizeBytes = new Blob([JSON.stringify(rawResponses[ep])]).size;
            return (
              <button
                key={ep}
                type="button"
                id={`raw-endpoint-row-${ep}`}
                onClick={() => setActiveEndpoint(ep)}
                className={`w-full flex items-center justify-between p-3 rounded-2xl border text-left transition-all cursor-pointer ${
                  isSelected
                    ? "bg-[#2C2C2E]/60 border-[#D4AF37]/40 text-[#D4AF37] font-semibold text-white"
                    : "bg-[#0B0B0C]/40 border-gray-800/40 hover:bg-[#2C2C2E]/30 text-gray-400 hover:text-gray-200"
                }`}
              >
                <div className="flex items-center gap-2">
                  <CornerDownRight className="w-3.5 h-3.5 opacity-55" />
                  <span className="text-xs font-mono">{ep}</span>
                </div>
                <span className="text-[10px] bg-[#0B0B0C] px-1.5 py-0.5 rounded border border-gray-850 text-gray-550 font-mono">
                  {(sizeBytes / 1024).toFixed(1)} KB
                </span>
              </button>
            );
          })}
        </div>
      </div>

      {/* Code viewer card */}
      <div className="lg:col-span-8 bg-[#1C1C1E] border border-gray-800 rounded-3xl p-6 shadow-xl flex flex-col gap-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-gray-800 pb-3">
          <div>
            <h4 className="text-sm font-bold text-white font-mono flex items-center gap-2">
              <Cpu className="w-4 h-4 text-[#D4AF37]" />
              GET /v2/usercollection/{selectedEndpoint}
            </h4>
            <p className="text-[11px] text-gray-450 mt-1">
              Exact server-emitted schema. Notice: no mock data or guesswork is introduced.
            </p>
          </div>

          <button
            type="button"
            id="copy-raw-json-btn"
            onClick={handleCopy}
            className="flex items-center justify-center gap-2 px-3 py-1.5 text-xs rounded-xl border border-gray-800 bg-[#0B0B0C] hover:bg-[#2C2C2E]/50 text-gray-300 hover:text-white transition-colors cursor-pointer self-start"
          >
            {copied ? (
              <>
                <Check className="w-3.5 h-3.5 text-[#D4AF37]" />
                <span className="text-[#D4AF37] font-medium">Copied!</span>
              </>
            ) : (
              <>
                <Copy className="w-3.5 h-3.5" />
                <span>Copy JSON</span>
              </>
            )}
          </button>
        </div>

        {/* Console Frame */}
        <div className="bg-[#0B0B0C] rounded-2xl border border-gray-800/70 p-4 max-h-[500px] overflow-auto">
          <pre className="text-xs font-mono text-[#D4AF37]/90 leading-relaxed selection:bg-[#2C2C2E]">
            {jsonString}
          </pre>
        </div>

        <div className="text-[10px] text-gray-500 leading-relaxed font-sans mt-1">
          <strong>Transparency Note:</strong> All visual statistics tabs (Sleep, Readiness, Activity, Heart Rate, and Workouts) parse coordinates and lists directly from these exact fields.
        </div>
      </div>
    </div>
  );
}
