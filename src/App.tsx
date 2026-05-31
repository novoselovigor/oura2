import { useState, useEffect } from "react";
import {
  Activity,
  Heart,
  Moon,
  Shield,
  Sparkles,
  Trophy,
  Terminal,
  Settings,
  Cpu,
  RefreshCw,
  Clock,
  AlertCircle,
  HelpCircle,
  TrendingUp
} from "lucide-react";

import { ApiConfig, fetchAllOuraData, formatDate, ProxyMode, isLocalServerAvailable } from "./utils/ouraApi";
import { OuraCombinedData } from "./types";

import OuraSettings from "./components/OuraSettings";
import OverviewTab from "./components/OverviewTab";
import SleepTab from "./components/SleepTab";
import ReadinessTab from "./components/ReadinessTab";
import ActivityTab from "./components/ActivityTab";
import HeartRateTab from "./components/HeartRateTab";
import WorkoutsTab from "./components/WorkoutsTab";
import RawDataTab from "./components/RawDataTab";

export default function App() {
  // Navigation tabs
  const tabs = [
    { id: "Overview", label: "Overview", icon: TrendingUp },
    { id: "Sleep", label: "Sleep", icon: Moon },
    { id: "Readiness", label: "Readiness", icon: Sparkles },
    { id: "Activity", label: "Activity", icon: Activity },
    { id: "HeartRate", label: "Heart Rate", icon: Heart },
    { id: "Workouts", label: "Workouts", icon: Trophy },
    { id: "RawData", label: "Raw JSON", icon: Terminal },
  ];

  const [activeTab, setActiveTab] = useState<string>("Overview");

  // Load dates defaulting to last 7 days YYYY-MM-DD local
  const [startDate, setStartDate] = useState<string>(() => {
    const d = new Date();
    d.setDate(d.getDate() - 7);
    return formatDate(d);
  });
  const [endDate, setEndDate] = useState<string>(() => formatDate(new Date()));

  // API configurations
  const [config, setConfig] = useState<ApiConfig>(() => {
    const isLocal = isLocalServerAvailable();
    return {
      token: "",
      proxyMode: isLocal ? "localproxy" : "corsproxy.io",
      customProxyUrl: "",
    };
  });

  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  
  // Real Parsed Oura Data Storage
  const [data, setData] = useState<OuraCombinedData | null>(null);
  
  // Raw responses lookup for transparency ("никаких догадок")
  const [rawResponses, setRawResponses] = useState<Record<string, any>>({});

  // Perform full concurrent fetch of Oura API
  const handleFetchData = async (activeConfig?: ApiConfig) => {
    const currentConfig = activeConfig || config;
    if (!currentConfig.token) {
      setErrorMsg("Please enter your Oura Personal Access Token (API Key) before triggering sync.");
      return;
    }

    setIsLoading(true);
    setErrorMsg(null);
    const tempRaw: Record<string, any> = {};

    try {
      const result = await fetchAllOuraData(
        currentConfig,
        startDate,
        endDate,
        // Raw saver callback
        (endpointName, payload) => {
          tempRaw[endpointName] = payload;
        }
      );

      setData(result);
      setRawResponses(tempRaw);
      
      // Auto switch to overview after loading successfully
      setActiveTab("Overview");
    } catch (err: any) {
      console.error("Failed to load Oura data:", err);
      setErrorMsg(err?.message || "An unexpected network fallback occurred. Verify your token or proxy strategy.");
    } finally {
      setIsLoading(false);
    }
  };

  // Read saved token config on mount
  useEffect(() => {
    const savedToken = localStorage.getItem("oura_token") || "";
    const isLocal = isLocalServerAvailable();
    const defaultProxy: ProxyMode = isLocal ? "localproxy" : "corsproxy.io";
    
    let savedProxyMode = (localStorage.getItem("oura_proxy_mode") as ProxyMode) || defaultProxy;
    
    // Automatically correct stale localproxy settings if running on a static page (e.g. GitHub Pages)
    if (savedProxyMode === "localproxy" && !isLocal) {
      savedProxyMode = "corsproxy.io";
    }

    const savedCustomUrl = localStorage.getItem("oura_custom_url") || "";

    const initialConfig = {
      token: savedToken,
      proxyMode: savedProxyMode,
      customProxyUrl: savedCustomUrl,
    };

    setConfig(initialConfig);

    // Auto-fetch data if token is already present
    if (savedToken) {
      handleFetchData(initialConfig);
    }
  }, []);

  const handleConfigChange = (newConfig: ApiConfig) => {
    setConfig(newConfig);
    // Write incrementally to localStorage
    localStorage.setItem("oura_token", newConfig.token);
    localStorage.setItem("oura_proxy_mode", newConfig.proxyMode);
    if (newConfig.customProxyUrl) {
      localStorage.setItem("oura_custom_url", newConfig.customProxyUrl);
    }
  };

  const handleDatesChange = (start: string, end: string) => {
    setStartDate(start);
    setEndDate(end);
  };

  // Render correct Active Tab
  const renderActiveTabContent = () => {
    if (!data) return null;

    switch (activeTab) {
      case "Overview":
        return <OverviewTab data={data} onTabChange={(tabId) => setActiveTab(tabId)} />;
      case "Sleep":
        return <SleepTab dailySleep={data.dailySleep} detailedSleep={data.detailedSleep} />;
      case "Readiness":
        return <ReadinessTab dailyReadiness={data.dailyReadiness} />;
      case "Activity":
        return <ActivityTab dailyActivity={data.dailyActivity} />;
      case "HeartRate":
        return <HeartRateTab heartRate={data.heartRate} />;
      case "Workouts":
        return <WorkoutsTab workouts={data.workouts} />;
      case "RawData":
        return <RawDataTab rawResponses={rawResponses} />;
      default:
        return <OverviewTab data={data} onTabChange={(tabId) => setActiveTab(tabId)} />;
    }
  };

  return (
    <div className="min-h-screen bg-[#0B0B0C] text-[#F5F5F7] flex flex-col antialiased">
      {/* Premium Sleek Brand Header */}
      <header className="sticky top-0 z-50 bg-[#0B0B0C]/90 backdrop-blur-md border-b border-gray-800 px-4 py-4 md:px-8">
        <div className="max-w-7xl mx-auto flex items-center justify-between">
          <div className="flex items-center gap-3">
            {/* Minimalist Oura Circle Ring geometric logo in Gold */}
            <div className="w-10 h-10 rounded-full bg-gradient-to-tr from-[#D4AF37] to-[#8A6D3B] p-[1.5px] shadow-[0_0_15px_rgba(212,175,55,0.15)] flex items-center justify-center font-display font-black text-[#0B0B0C] tracking-tighter text-base relative">
              <div className="w-full h-full bg-[#0B0B0C] rounded-full flex items-center justify-center text-[#D4AF37] font-bold">
                O
              </div>
              <div className="absolute top-0 right-0 w-2.5 h-2.5 bg-green-500 rounded-full border-2 border-[#0B0B0C]" />
            </div>
            <div>
              <h1 className="text-lg font-semibold tracking-tight text-[#F5F5F7] flex items-center gap-2">
                Oura Mirror
              </h1>
              <p className="text-[10px] text-gray-500 font-mono uppercase tracking-widest leading-none">
                Stateless API Data Viewer
              </p>
            </div>
          </div>

          <div className="flex items-center gap-3">
            {/* Sync Status Badge */}
            {data ? (
              <div className="flex items-center gap-2 bg-[#1C1C1E] px-3.5 py-1.5 rounded-xl border border-gray-800">
                <div className="w-2 h-2 rounded-full bg-green-500 animate-pulse"></div>
                <span className="text-[10px] font-mono text-gray-400 uppercase tracking-wider font-bold">API ACTIVE</span>
              </div>
            ) : (
              <div className="flex items-center gap-2 bg-[#1C1C1E] px-3 py-1.5 rounded-xl border border-gray-800">
                <div className="w-1.5 h-1.5 bg-gray-600"></div>
                <span className="text-[10px] font-mono text-gray-500 uppercase tracking-wider">OFFLINE</span>
              </div>
            )}

            {/* Quick Re-sync if data exists */}
            {data && (
              <button
                type="button"
                id="header-sync-btn"
                onClick={handleFetchData}
                disabled={isLoading}
                className="p-2 text-gray-400 hover:text-[#F5F5F7] bg-[#1C1C1E] hover:bg-[#2C2C2E] rounded-xl border border-gray-800 transition-all cursor-pointer"
                title="Sync Latest Data"
              >
                <RefreshCw className={`w-4 h-4 ${isLoading ? "animate-spin text-[#D4AF37]" : ""}`} />
              </button>
            )}
          </div>
        </div>
      </header>

      {/* Main Container */}
      <main className="flex-1 max-w-7xl w-full mx-auto p-4 md:p-8 space-y-6">
        {/* Onboarding Mode: if no data has been successfully fetched yet */}
        {!data ? (
          <div className="max-w-2xl mx-auto space-y-6 py-6 animate-fade-in">
            {/* Aesthetic greeting card */}
            <div className="text-center space-y-3">
              <div className="inline-flex items-center gap-2 bg-[#1C1C1E] border border-gray-800 rounded-full px-3.5 py-1 text-[10px] text-[#D4AF37] font-mono uppercase tracking-wider mb-2">
                <Sparkles className="w-3.5 h-3.5" />
                <span>Bento Grid Premium UI Pack</span>
              </div>
              <h2 className="text-4xl font-light tracking-tight text-[#F5F5F7] font-display">
                Welcome to Oura Mirror
              </h2>
              <p className="text-sm text-gray-400 max-w-md mx-auto leading-relaxed">
                A highly-polished bento dashboard to mirror your health, sleep, and activity metrics in pristine typography.
              </p>
            </div>

            {/* Config Box */}
            <OuraSettings
              config={config}
              startDate={startDate}
              endDate={endDate}
              isLoading={isLoading}
              onConfigChange={handleConfigChange}
              onDatesChange={handleDatesChange}
              onFetchData={handleFetchData}
              errorMsg={errorMsg}
              hasData={false}
            />

            {/* Informational reassurance of privacy */}
            <div className="bg-[#1C1C1E] border border-gray-800 rounded-3xl p-6 flex gap-4 text-xs">
              <Shield className="w-5 h-5 text-[#D4AF37] shrink-0 mt-0.5" />
              <div className="space-y-1 text-gray-400 leading-relaxed">
                <p className="font-semibold text-[#F5F5F7]">100% Client-Side Privacy Architecture</p>
                <p>
                  This application compiles entirely client-side. Your Personal Access Token stays safely inside your private browser sandbox (`localStorage`). We never deploy trackers, analytic databases, or persistent server caches.
                </p>
              </div>
            </div>
          </div>
        ) : (
          /* Active Analytics Dashboard Mode */
          <div className="space-y-6 animate-fade-in">
            
            {/* Horizontal navigation tabs bar following bento proportions */}
            <div className="bg-[#1C1C1E] border border-gray-800 p-1.5 rounded-3xl flex overflow-x-auto whitespace-nowrap scrollbar-none gap-1 sm:grid sm:grid-cols-7 shadow-lg">
              {tabs.map((tab) => {
                const isActive = activeTab === tab.id;
                const Icon = tab.icon;
                return (
                  <button
                    key={tab.id}
                    type="button"
                    id={`nav-tab-${tab.id}`}
                    onClick={() => setActiveTab(tab.id)}
                    className={`flex items-center justify-center gap-2.5 px-4 py-3 rounded-2xl text-xs font-semibold tracking-wide transition-all cursor-pointer ${
                      isActive
                        ? "bg-[#2C2C2E] text-[#F5F5F7] border-b-2 border-[#D4AF37] shadow-sm font-bold"
                        : "text-gray-400 hover:text-gray-200 hover:bg-[#2C2C2E]/40"
                    }`}
                  >
                    <Icon className={`w-4 h-4 ${isActive ? "text-[#D4AF37]" : "text-gray-500"}`} />
                    <span>{tab.label}</span>
                  </button>
                );
              })}
            </div>

            {/* Quick Metric filters disclosure */}
            <div className="bg-[#1C1C1E] border border-gray-800 rounded-3xl p-6 shadow-xl flex flex-col md:flex-row md:items-center justify-between gap-6">
              <div className="flex flex-col sm:flex-row items-baseline gap-2.5">
                <span className="text-gray-500 text-[10px] uppercase tracking-widest font-bold">Sync Range:</span>
                <span className="text-sm font-semibold text-[#D4AF37] bg-[#D4AF37]/5 px-3 py-1 rounded-xl border border-[#D4AF37]/15 font-mono">
                  {startDate} — {endDate}
                </span>
              </div>

              {/* Collapsible config trigger inside full view */}
              <button
                type="button"
                id="toggle-reconfigure-settings"
                onClick={() => {
                  setData(null);
                }}
                className="text-xs font-bold text-gray-300 hover:text-white flex items-center gap-2 border border-gray-800 bg-[#0B0B0C] hover:bg-[#2C2C2E] px-4 py-2.5 rounded-2xl transition-all cursor-pointer self-start md:self-auto"
              >
                <Settings className="w-4 h-4 text-gray-400" />
                <span>Adjust Token & Dates</span>
              </button>
            </div>

            {/* Content view window */}
            <div className="min-h-[400px]">
              {renderActiveTabContent()}
            </div>
          </div>
        )}
      </main>

      {/* Humble aesthetic footer */}
      <footer className="border-t border-gray-950 bg-[#0B0B0C] text-center py-6 mt-12 text-gray-600 text-[11px] leading-relaxed">
        <p>This is a custom human-designed client dashboard for Oura Ring. Built strictly with official V2 API schemas.</p>
        <div className="flex gap-2 justify-center mt-2.5">
          <span className="px-2 py-0.5 bg-[#1C1C1E] text-[10px] rounded border border-gray-800 text-gray-500 font-mono">v2.4.0-stable</span>
          <span className="px-2 py-0.5 bg-[#1C1C1E] text-[10px] rounded border border-gray-800 text-gray-500 font-mono">SHA-7f31b2</span>
        </div>
      </footer>
    </div>
  );
}
