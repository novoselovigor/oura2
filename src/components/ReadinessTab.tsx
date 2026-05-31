import { useState } from "react";
import { Sparkles, Heart, Thermometer, Activity, ChevronRight } from "lucide-react";
import { OuraDailyReadiness } from "../types";

interface ReadinessTabProps {
  dailyReadiness: OuraDailyReadiness[];
}

export default function ReadinessTab({ dailyReadiness }: ReadinessTabProps) {
  const [selectedDay, setSelectedDay] = useState<string | null>(
    dailyReadiness.length > 0 ? dailyReadiness[dailyReadiness.length - 1].day : null
  );

  if (dailyReadiness.length === 0) {
    return (
      <div id="readiness-no-data" className="bg-[#1C1C1E] border border-gray-800 rounded-3xl p-8 text-center text-gray-400">
        <Sparkles className="w-12 h-12 mx-auto text-[#D4AF37] opacity-60 mb-3 animate-pulse" />
        <p className="font-medium text-white text-base">No Recorded Readiness Data Found</p>
        <p className="text-xs text-gray-500 mt-1 max-w-md mx-auto">
          Oura Ring readiness details are not available for the selected dates in this account.
        </p>
      </div>
    );
  }

  const activeDay = selectedDay || dailyReadiness[dailyReadiness.length - 1].day;
  const activeData = dailyReadiness.find((r) => r.day === activeDay);

  const getScoreColor = (score: number) => {
    if (score >= 85) return { bg: "bg-[#D4AF37]/10", border: "border-[#D4AF37]/30", text: "text-[#D4AF37]" };
    if (score >= 70) return { bg: "bg-[#9D8AF4]/10", border: "border-[#9D8AF4]/30", text: "text-[#9D8AF4]" };
    if (score >= 60) return { bg: "bg-amber-500/10", border: "border-amber-500/30", text: "text-amber-400" };
    return { bg: "bg-rose-500/10", border: "border-rose-500/30", text: "text-rose-400" };
  };

  const getContributorRating = (val?: number) => {
    if (!val) return { text: "No Data", color: "text-gray-500" };
    if (val >= 85) return { text: "Optimal", color: "text-[#D4AF37]" };
    if (val >= 70) return { text: "Good", color: "text-[#9D8AF4]" };
    if (val >= 55) return { text: "Fair", color: "text-amber-400" };
    return { text: "Pay Attention", color: "text-rose-400" };
  };

  return (
    <div id="readiness-tab-root" className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
      {/* Date List Container */}
      <div className="lg:col-span-4 bg-[#1C1C1E] border border-gray-800 rounded-3xl p-4 shadow-xl">
        <h3 className="text-sm font-semibold text-gray-300 px-2 pb-3 mb-2 border-b border-gray-800 flex items-center gap-2">
          <Sparkles className="w-4 h-4 text-[#D4AF37]" />
          Readiness History
        </h3>
        <div className="space-y-1 max-h-[480px] overflow-y-auto pr-1">
          {dailyReadiness.map((dayData) => {
            const isSelected = dayData.day === activeDay;
            const style = getScoreColor(dayData.score);
            return (
              <button
                key={dayData.id}
                type="button"
                id={`readiness-day-row-${dayData.day}`}
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

      {/* Main Focus Panel */}
      <div className="lg:col-span-8 space-y-6">
        {activeData && (
          <div className="bg-[#1C1C1E] border border-gray-800 rounded-3xl p-6 shadow-xl">
            {/* Header score block */}
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-gray-800 pb-5 mb-5">
              <div className="flex items-center gap-4">
                <div className={`w-16 h-16 rounded-2xl flex items-center justify-center border font-bold text-2xl ${getScoreColor(activeData.score).bg} ${getScoreColor(activeData.score).border} ${getScoreColor(activeData.score).text}`}>
                  {activeData.score}
                </div>
                <div>
                  <h4 className="text-lg font-semibold text-[#F5F5F7]">Body Readiness Score</h4>
                  <p className="text-xs text-gray-400 font-mono mt-0.5">
                    {new Date(activeData.day).toLocaleDateString("en-US", {
                      weekday: "long",
                      year: "numeric",
                      month: "long",
                      day: "numeric",
                    })}
                  </p>
                </div>
              </div>
              <div className="text-right">
                <span className={`text-xs px-3 py-1 rounded-lg border font-semibold tracking-wider uppercase ${getScoreColor(activeData.score).bg} ${getScoreColor(activeData.score).border} ${getScoreColor(activeData.score).text}`}>
                  {getContributorRating(activeData.score).text}
                </span>
                <p className="text-[10px] text-gray-500 mt-1.5 font-mono">ID: {activeData.id.substring(0, 8)}...</p>
              </div>
            </div>

            {/* Quick stats section (Physiological Indicators) */}
            <h5 className="text-xs font-semibold text-gray-450 uppercase tracking-wider mb-3">
              Physiological Indicators
            </h5>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
              {/* Temperature Deviation */}
              <div className="bg-[#0B0B0C] p-4 rounded-2xl border border-gray-800 flex items-center gap-4">
                <div className="p-3 bg-[#9D8AF4]/10 border border-[#9D8AF4]/20 rounded-xl text-[#9D8AF4]">
                  <Thermometer className="w-5 h-5" />
                </div>
                <div>
                  <p className="text-gray-500 text-[10px] uppercase font-semibold tracking-wider font-sans">
                    Body Temp Deviation
                  </p>
                  <p className="text-lg font-bold text-gray-200 font-mono mt-0.5">
                    {activeData.temperature_deviation !== undefined ? (
                      activeData.temperature_deviation > 0 ? (
                        <span className="text-red-400">+{activeData.temperature_deviation.toFixed(2)} °C</span>
                      ) : activeData.temperature_deviation < 0 ? (
                        <span className="text-blue-400">{activeData.temperature_deviation.toFixed(2)} °C</span>
                      ) : (
                        <span className="text-gray-400">0.00 °C</span>
                      )
                    ) : (
                      <span className="text-gray-500">No deviation logged</span>
                    )}
                  </p>
                </div>
              </div>

              {/* Temperature Trend Deviation */}
              <div className="bg-[#0B0B0C] p-4 rounded-2xl border border-gray-800 flex items-center gap-4">
                <div className="p-3 bg-[#9D8AF4]/10 border border-[#9D8AF4]/20 rounded-xl text-[#9D8AF4]">
                  <Activity className="w-5 h-5" />
                </div>
                <div>
                  <p className="text-gray-500 text-[10px] uppercase font-semibold tracking-wider font-sans">
                    Temp Trend Deviation
                  </p>
                  <p className="text-lg font-bold text-gray-200 font-mono mt-0.5">
                    {activeData.temperature_trend_deviation !== undefined ? (
                      `${activeData.temperature_trend_deviation > 0 ? "+" : ""}${activeData.temperature_trend_deviation.toFixed(2)} °C`
                    ) : (
                      <span className="text-gray-500">—</span>
                    )}
                  </p>
                </div>
              </div>
            </div>

            {/* Readiness Contributors (Official Oura Metrics) */}
            <div className="space-y-3">
              <h5 className="text-xs font-semibold text-gray-300 uppercase tracking-wider">
                Readiness Contributors
              </h5>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {Object.entries(activeData.contributors).map(([key, value]) => {
                  if (value === undefined) return null;
                  const label = key
                    .split("_")
                    .map((w) => w.charAt(0).toUpperCase() + w.slice(1))
                    .join(" ");

                  return (
                    <div key={key} className="bg-[#0B0B0C] p-3.5 rounded-2xl border border-gray-800 flex justify-between items-center">
                      <div>
                        <p className="text-xs font-medium text-gray-300">{label}</p>
                        <p className={`text-[10px] mt-0.5 font-semibold ${getContributorRating(value).color}`}>
                          {getContributorRating(value).text}
                        </p>
                      </div>
                      <div className="flex items-center gap-2.5">
                        <span className="text-xs font-bold text-white font-mono">{value}</span>
                        <div className="w-16 bg-[#2C2C2E] h-1.5 rounded-full overflow-hidden font-mono">
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
