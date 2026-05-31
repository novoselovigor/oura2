import { useState } from "react";
import { Moon, Clock, Sparkles, ChevronRight, AlertCircle } from "lucide-react";
import { OuraDailySleep, OuraDetailedSleep } from "../types";

interface SleepTabProps {
  dailySleep: OuraDailySleep[];
  detailedSleep: OuraDetailedSleep[];
}

export default function SleepTab({ dailySleep, detailedSleep }: SleepTabProps) {
  const [selectedDay, setSelectedDay] = useState<string | null>(
    dailySleep.length > 0 ? dailySleep[dailySleep.length - 1].day : null
  );

  if (dailySleep.length === 0) {
    return (
      <div id="sleep-no-data" className="bg-[#1C1C1E] border border-gray-800 rounded-3xl p-8 text-center text-gray-400">
        <Moon className="w-12 h-12 mx-auto text-[#9D8AF4] opacity-60 mb-3 animate-pulse" />
        <p className="font-medium text-white text-base">No Recorded Sleep Data Found</p>
        <p className="text-xs text-gray-500 mt-1 max-w-md mx-auto">
          Oura Ring sleep records do not exist for the selected dates in this account.
        </p>
      </div>
    );
  }

  // Find active data based on selection or fallback
  const activeDay = selectedDay || dailySleep[dailySleep.length - 1].day;
  const activeDaily = dailySleep.find((s) => s.day === activeDay);
  const activeDetailed = detailedSleep.find((s) => s.day === activeDay);

  // Score styling helper mapped to Gold and Lavender
  const getScoreColor = (score: number) => {
    if (score >= 85) return { bg: "bg-[#D4AF37]/10", border: "border-[#D4AF37]/30", text: "text-[#D4AF37]", hex: "#D4AF37" };
    if (score >= 70) return { bg: "bg-[#9D8AF4]/10", border: "border-[#9D8AF4]/30", text: "text-[#9D8AF4]", hex: "#9D8AF4" };
    if (score >= 60) return { bg: "bg-amber-500/10", border: "border-amber-500/30", text: "text-amber-400", hex: "#f59e0b" };
    return { bg: "bg-rose-500/10", border: "border-rose-500/30", text: "text-rose-400", hex: "#f43f5e" };
  };

  const getContributorRating = (val?: number) => {
    if (!val) return { text: "No Data", color: "text-gray-500" };
    if (val >= 85) return { text: "Optimal", color: "text-[#D4AF37]" };
    if (val >= 70) return { text: "Good", color: "text-[#9D8AF4]" };
    if (val >= 55) return { text: "Fair", color: "text-amber-400" };
    return { text: "Pay Attention", color: "text-rose-400" };
  };

  const formatSecondsToHrsMins = (seconds?: number) => {
    if (!seconds) return "0h 0m";
    const h = Math.floor(seconds / 3600);
    const m = Math.floor((seconds % 3600) / 60);
    return `${h}h ${m}m`;
  };

  return (
    <div id="sleep-tab-root" className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
      {/* List panel - Date list with Sleep Scores */}
      <div className="lg:col-span-4 bg-[#1C1C1E] border border-gray-800 rounded-3xl p-4 shadow-xl">
        <h3 className="text-sm font-semibold text-gray-300 px-2 pb-3 mb-2 border-b border-gray-800 flex items-center gap-2">
          <Moon className="w-4 h-4 text-[#9D8AF4]" />
          Sleep Period Logs
        </h3>
        <div className="space-y-1 max-h-[480px] overflow-y-auto pr-1">
          {dailySleep.map((dayData) => {
            const isSelected = dayData.day === activeDay;
            const style = getScoreColor(dayData.score);
            return (
              <button
                key={dayData.id}
                type="button"
                id={`sleep-day-row-${dayData.day}`}
                onClick={() => setSelectedDay(dayData.day)}
                className={`w-full flex items-center justify-between p-3 rounded-2xl border text-left transition-all cursor-pointer ${
                  isSelected
                    ? "bg-[#2C2C2E]/60 border-[#D4AF37]/40 text-white"
                    : "bg-[#0B0B0C]/40 border-gray-800/40 hover:bg-[#2C2C2E]/30 text-gray-300"
                }`}
              >
                <div>
                  <p className="text-xs text-gray-400 font-mono">
                    {new Date(dayData.day).toLocaleDateString("en-US", {
                      weekday: "short",
                      month: "short",
                      day: "numeric",
                    })}
                  </p>
                  <p className="text-[10px] text-gray-500 mt-0.5">{dayData.day}</p>
                </div>
                <div className="flex items-center gap-2">
                  <span className={`text-xs px-2.5 py-1 rounded-full font-bold border ${style.bg} ${style.border} ${style.text}`}>
                    {dayData.score}
                  </span>
                  <ChevronRight className={`w-4 h-4 transition-transform ${isSelected ? "text-[#D4AF37] rotate-90" : "text-gray-650"}`} />
                </div>
              </button>
            );
          })}
        </div>
      </div>

      {/* Main Focus Details Card */}
      <div className="lg:col-span-8 space-y-6">
        {activeDaily && (
          <div className="bg-[#1C1C1E] border border-gray-800 rounded-3xl p-6 shadow-xl">
            {/* Header score rating */}
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-gray-800 pb-5 mb-5">
              <div className="flex items-center gap-4">
                <div className={`w-16 h-16 rounded-2xl flex items-center justify-center border font-bold text-2xl ${getScoreColor(activeDaily.score).bg} ${getScoreColor(activeDaily.score).border} ${getScoreColor(activeDaily.score).text}`}>
                  {activeDaily.score}
                </div>
                <div>
                  <h4 className="text-lg font-semibold text-[#F5F5F7]">Daily Sleep Analysis</h4>
                  <p className="text-xs text-gray-400 font-mono mt-0.5">
                    {new Date(activeDaily.day).toLocaleDateString("en-US", {
                      weekday: "long",
                      year: "numeric",
                      month: "long",
                      day: "numeric",
                    })}
                  </p>
                </div>
              </div>
              <div className="text-right">
                <span className={`text-xs px-3 py-1 rounded-lg border font-semibold tracking-wider uppercase ${getScoreColor(activeDaily.score).bg} ${getScoreColor(activeDaily.score).border} ${getScoreColor(activeDaily.score).text}`}>
                  {getContributorRating(activeDaily.score).text}
                </span>
                <p className="text-[10px] text-gray-500 mt-1.5 font-mono">ID: {activeDaily.id.substring(0, 8)}...</p>
              </div>
            </div>

            {/* Metrics Grid */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
              <div className="bg-[#0B0B0C] p-4 rounded-2xl border border-gray-800">
                <p className="text-gray-500 text-[10px] uppercase font-semibold tracking-wider flex items-center gap-1.5">
                  <Clock className="w-3 h-3 text-[#D4AF37]" />
                  Total Sleep
                </p>
                <p className="text-base font-bold text-gray-200 mt-1 font-mono">
                  {activeDetailed ? formatSecondsToHrsMins(activeDetailed.total_sleep_duration) : "—"}
                </p>
              </div>

              <div className="bg-[#0B0B0C] p-4 rounded-2xl border border-gray-800">
                <p className="text-gray-500 text-[10px] uppercase font-semibold tracking-wider flex items-center gap-1.5">
                  <Sparkles className="w-3 h-3 text-[#9D8AF4]" />
                  Efficiency
                </p>
                <p className="text-base font-bold text-gray-200 mt-1 font-mono">
                  {activeDetailed && activeDetailed.efficiency ? `${activeDetailed.efficiency}%` : "—"}
                </p>
              </div>

              <div className="bg-[#0B0B0C] p-4 rounded-2xl border border-gray-800">
                <p className="text-gray-500 text-[10px] uppercase font-semibold tracking-wider">
                  Latency
                </p>
                <p className="text-base font-bold text-gray-200 mt-1 font-mono">
                  {activeDetailed && activeDetailed.latency ? `${Math.round(activeDetailed.latency / 60)} min` : "0 min"}
                </p>
              </div>

              <div className="bg-[#0B0B0C] p-4 rounded-2xl border border-gray-800">
                <p className="text-gray-500 text-[10px] uppercase font-semibold tracking-wider">
                  Avg HR
                </p>
                <p className="text-base font-bold text-gray-200 mt-1 font-mono">
                  {activeDetailed && activeDetailed.average_heart_rate ? `${Math.round(activeDetailed.average_heart_rate)} bpm` : "—"}
                </p>
              </div>
            </div>

            {/* Sleep Architecture Stacked Bar Chart */}
            {activeDetailed && (
              <div className="bg-[#0B0B0C] p-5 rounded-2xl border border-gray-800 mb-6 space-y-4">
                <h5 className="text-xs font-semibold text-gray-300 uppercase tracking-wider">
                  Sleep Architecture
                </h5>
                
                {/* Visual Stacked Bar representation */}
                <div className="h-6 w-full rounded-lg overflow-hidden flex shadow-inner">
                  {activeDetailed.deep_sleep_duration && activeDetailed.deep_sleep_duration > 0 && (
                    <div
                      style={{ flex: activeDetailed.deep_sleep_duration }}
                      className="bg-[#D4AF37] h-full group relative transition-all"
                      title={`Deep Sleep: ${formatSecondsToHrsMins(activeDetailed.deep_sleep_duration)}`}
                    />
                  )}
                  {activeDetailed.rem_sleep_duration && activeDetailed.rem_sleep_duration > 0 && (
                    <div
                      style={{ flex: activeDetailed.rem_sleep_duration }}
                      className="bg-[#9D8AF4] h-full group relative transition-all"
                      title={`REM Sleep: ${formatSecondsToHrsMins(activeDetailed.rem_sleep_duration)}`}
                    />
                  )}
                  {activeDetailed.light_sleep_duration && activeDetailed.light_sleep_duration > 0 && (
                    <div
                      style={{ flex: activeDetailed.light_sleep_duration }}
                      className="bg-blue-500/70 h-full group relative transition-all"
                      title={`Light Sleep: ${formatSecondsToHrsMins(activeDetailed.light_sleep_duration)}`}
                    />
                  )}
                  {activeDetailed.awake_time && activeDetailed.awake_time > 0 && (
                    <div
                      style={{ flex: activeDetailed.awake_time }}
                      className="bg-gray-700 h-full group relative transition-all"
                      title={`Awake Time: ${formatSecondsToHrsMins(activeDetailed.awake_time)}`}
                    />
                  )}
                </div>

                {/* Color Legend & Detailed Counts */}
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-xs pt-1">
                  <div className="flex items-center gap-2">
                    <div className="w-3 h-3 bg-[#D4AF37] rounded" />
                    <div>
                      <p className="text-gray-400 text-[10px]">Deep Sleep</p>
                      <p className="font-semibold text-white font-mono">{formatSecondsToHrsMins(activeDetailed.deep_sleep_duration)}</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <div className="w-3 h-3 bg-[#9D8AF4] rounded" />
                    <div>
                      <p className="text-gray-400 text-[10px]">REM Sleep</p>
                      <p className="font-semibold text-white font-mono">{formatSecondsToHrsMins(activeDetailed.rem_sleep_duration)}</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <div className="w-3 h-3 bg-blue-500/70 rounded" />
                    <div>
                      <p className="text-gray-400 text-[10px]">Light Sleep</p>
                      <p className="font-semibold text-white font-mono">{formatSecondsToHrsMins(activeDetailed.light_sleep_duration)}</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <div className="w-3 h-3 bg-gray-700 rounded" />
                    <div>
                      <p className="text-gray-400 text-[10px]">Awake Time</p>
                      <p className="font-semibold text-white font-mono">{formatSecondsToHrsMins(activeDetailed.awake_time)}</p>
                    </div>
                  </div>
                </div>

                <div className="text-[11px] text-gray-550 border-t border-gray-900 pt-3 flex flex-wrap justify-between gap-2">
                  <span>Bedtime Start: {new Date(activeDetailed.bedtime_start).toLocaleTimeString()}</span>
                  <span>Bedtime End: {new Date(activeDetailed.bedtime_end).toLocaleTimeString()}</span>
                </div>
              </div>
            )}

            {/* Official Contributors Panel */}
            <div className="space-y-3">
              <h5 className="text-xs font-semibold text-gray-300 uppercase tracking-wider">
                Sleep Contributors
              </h5>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {Object.entries(activeDaily.contributors).map(([key, value]) => {
                  if (value === undefined) return null;
                  const label = key
                    .split("_")
                    .map((w) => w.charAt(0).toUpperCase() + w.slice(1))
                    .join(" ");

                  return (
                    <div key={key} className="bg-[#0B0B0C] p-3 rounded-2xl border border-gray-800 flex justify-between items-center">
                      <div>
                        <p className="text-xs font-medium text-gray-300">{label}</p>
                        <p className={`text-[10px] mt-0.5 font-semibold ${getContributorRating(value).color}`}>
                          {getContributorRating(value).text}
                        </p>
                      </div>
                      <div className="flex items-center gap-2.5">
                        <span className="text-xs font-bold text-white font-mono">{value}</span>
                        <div className="w-16 bg-[#2C2C2E] h-1.5 rounded-full overflow-hidden">
                          <div
                            className={`h-full ${
                              value >= 85
                                ? "bg-[#D4AF37]"
                                : value >= 70
                                ? "bg-[#9D8AF4]"
                                : value >= 55
                                ? "bg-amber-400"
                                : "bg-rose-500"
                            }`}
                            style={{ width: `${value}%` }}
                          />
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
