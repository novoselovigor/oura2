import { useState } from "react";
import { Zap, Footprints, Flame, Timer, ChevronRight } from "lucide-react";
import { OuraDailyActivity } from "../types";

interface ActivityTabProps {
  dailyActivity: OuraDailyActivity[];
}

export default function ActivityTab({ dailyActivity }: ActivityTabProps) {
  const [selectedDay, setSelectedDay] = useState<string | null>(
    dailyActivity.length > 0 ? dailyActivity[dailyActivity.length - 1].day : null
  );

  if (dailyActivity.length === 0) {
    return (
      <div id="activity-no-data" className="bg-[#1C1C1E] border border-gray-800 rounded-3xl p-8 text-center text-gray-400">
        <Zap className="w-12 h-12 mx-auto text-[#D4AF37] opacity-60 mb-3 animate-pulse" />
        <p className="font-medium text-white text-base">No Recorded Activity Data Found</p>
        <p className="text-xs text-gray-500 mt-1 max-w-md mx-auto">
          Oura Ring physical activity details are not written for the selected dates in this account.
        </p>
      </div>
    );
  }

  const activeDay = selectedDay || dailyActivity[dailyActivity.length - 1].day;
  const activeData = dailyActivity.find((a) => a.day === activeDay);

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

  const formatSecondsToHoursAndMins = (seconds?: number) => {
    if (!seconds) return "0m";
    const h = Math.floor(seconds / 3600);
    const m = Math.floor((seconds % 3600) / 60);
    if (h === 0) return `${m}m`;
    return `${h}h ${m}m`;
  };

  return (
    <div id="activity-tab-root" className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
      {/* Date List Container */}
      <div className="lg:col-span-4 bg-[#1C1C1E] border border-gray-800 rounded-3xl p-4 shadow-xl">
        <h3 className="text-sm font-semibold text-gray-300 px-2 pb-3 mb-2 border-b border-gray-800 flex items-center gap-2">
          <Zap className="w-4 h-4 text-[#D4AF37]" />
          Activity Log
        </h3>
        <div className="space-y-1 max-h-[480px] overflow-y-auto pr-1">
          {dailyActivity.map((dayData) => {
            const isSelected = dayData.day === activeDay;
            const style = getScoreColor(dayData.score);
            return (
              <button
                key={dayData.id}
                type="button"
                id={`activity-day-row-${dayData.day}`}
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

      {/* Details Container */}
      <div className="lg:col-span-8 space-y-6">
        {activeData && (
          <div className="bg-[#1C1C1E] border border-gray-800 rounded-3xl p-6 shadow-xl">
            {/* Header score card */}
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-gray-800 pb-5 mb-5">
              <div className="flex items-center gap-4">
                <div className={`w-16 h-16 rounded-2xl flex items-center justify-center border font-bold text-2xl ${getScoreColor(activeData.score).bg} ${getScoreColor(activeData.score).border} ${getScoreColor(activeData.score).text}`}>
                  {activeData.score}
                </div>
                <div>
                  <h4 className="text-lg font-semibold text-[#F5F5F7]">Daily Performance Activity</h4>
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

            {/* General Metrics Grid */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
              {/* Steps */}
              <div className="bg-[#0B0B0C] p-4 rounded-2xl border border-gray-800">
                <p className="text-gray-500 text-[10px] uppercase font-semibold tracking-wider flex items-center gap-1.5">
                  <Footprints className="w-3.5 h-3.5 text-[#D4AF37]" />
                  Steps Count
                </p>
                <p className="text-lg font-bold text-gray-200 mt-1 font-mono">
                  {activeData.steps.toLocaleString()}
                </p>
              </div>

              {/* Active Calories */}
              <div className="bg-[#0B0B0C] p-4 rounded-2xl border border-gray-800">
                <p className="text-gray-500 text-[10px] uppercase font-semibold tracking-wider flex items-center gap-1.5">
                  <Flame className="w-3.5 h-3.5 text-rose-400" />
                  Active Burn
                </p>
                <p className="text-lg font-bold text-gray-200 mt-1 font-mono">
                  {activeData.active_calories} kcal
                </p>
              </div>

              {/* Total Calories */}
              <div className="bg-[#0B0B0C] p-4 rounded-2xl border border-gray-800">
                <p className="text-gray-500 text-[10px] uppercase font-semibold tracking-wider">
                  Total Burned
                </p>
                <p className="text-lg font-bold text-gray-200 mt-1 font-mono">
                  {activeData.total_calories} kcal
                </p>
              </div>

              {/* Walking equivalent */}
              <div className="bg-[#0B0B0C] p-4 rounded-2xl border border-gray-800">
                <p className="text-gray-500 text-[10px] uppercase font-semibold tracking-wider">
                  Equivalent Walk
                </p>
                <p className="text-lg font-bold text-gray-200 mt-1 font-mono">
                  {activeData.equivalent_walking_distance
                    ? `${(activeData.equivalent_walking_distance / 1000).toFixed(2)} km`
                    : "—"}
                </p>
              </div>
            </div>

            {/* Time Slices & Intensity Breakdown */}
            <div className="bg-[#0B0B0C] p-5 rounded-2xl border border-gray-800 mb-6 space-y-4">
              <h5 className="text-xs font-semibold text-gray-300 uppercase tracking-wider flex items-center gap-1.5">
                <Timer className="w-4 h-4 text-[#D4AF37]" />
                Active Intervals & Intensity Slices
              </h5>

              {/* Unified block bar chart representation of the day's movement structure */}
              <div className="h-6 w-full bg-[#1C1C1E] rounded-lg overflow-hidden flex shadow-inner">
                {activeData.high_activity_time && activeData.high_activity_time > 0 && (
                  <div
                    style={{ flex: activeData.high_activity_time }}
                    className="bg-[#D4AF37] h-full group relative transition-all"
                    title={`High Intensity: ${formatSecondsToHoursAndMins(activeData.high_activity_time)}`}
                  />
                )}
                {activeData.medium_activity_time && activeData.medium_activity_time > 0 && (
                  <div
                    style={{ flex: activeData.medium_activity_time }}
                    className="bg-[#9D8AF4] h-full group relative transition-all"
                    title={`Medium Intensity: ${formatSecondsToHoursAndMins(activeData.medium_activity_time)}`}
                  />
                )}
                {activeData.low_activity_time && activeData.low_activity_time > 0 && (
                  <div
                    style={{ flex: activeData.low_activity_time }}
                    className="bg-blue-500/60 h-full group relative transition-all"
                    title={`Low Intensity: ${formatSecondsToHoursAndMins(activeData.low_activity_time)}`}
                  />
                )}
                {activeData.sedentary_time && activeData.sedentary_time > 0 && (
                  <div
                    style={{ flex: activeData.sedentary_time }}
                    className="bg-gray-700 h-full group relative transition-all"
                    title={`Sedentary Time: ${formatSecondsToHoursAndMins(activeData.sedentary_time)}`}
                  />
                )}
              </div>

              {/* Color guide */}
              <div className="grid grid-cols-2 md:grid-cols-4 gap-3 text-xs pt-1">
                <div className="flex items-center gap-2">
                  <div className="w-3 h-3 bg-[#D4AF37] rounded" />
                  <div>
                    <p className="text-gray-400 text-[10px]">High Intensity</p>
                    <p className="font-semibold text-white font-mono">{formatSecondsToHoursAndMins(activeData.high_activity_time)}</p>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <div className="w-3 h-3 bg-[#9D8AF4] rounded" />
                  <div>
                    <p className="text-gray-400 text-[10px]">Medium Intensity</p>
                    <p className="font-semibold text-white font-mono">{formatSecondsToHoursAndMins(activeData.medium_activity_time)}</p>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <div className="w-3 h-3 bg-blue-500/60 rounded" />
                  <div>
                    <p className="text-gray-400 text-[10px]">Low Intensity</p>
                    <p className="font-semibold text-white font-mono">{formatSecondsToHoursAndMins(activeData.low_activity_time)}</p>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <div className="w-3 h-3 bg-gray-700 rounded" />
                  <div>
                    <p className="text-gray-400 text-[10px]">Sedentary Time</p>
                    <p className="font-semibold text-white font-mono">{formatSecondsToHoursAndMins(activeData.sedentary_time)}</p>
                  </div>
                </div>
              </div>
            </div>

            {/* Official Contributors Panel */}
            <div className="space-y-3">
              <h5 className="text-xs font-semibold text-gray-300 uppercase tracking-wider">
                Activity Contributors
              </h5>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {Object.entries(activeData.contributors).map(([key, value]) => {
                  if (value === undefined) return null;
                  const label = key
                    .split("_")
                    .map((w) => w.charAt(0).toUpperCase() + w.slice(1))
                    .join(" ");

                  return (
                    <div key={key} className="bg-[#0B0B0C] p-3 rounded-2xl border border-gray-800 flex justify-between items-center font-mono">
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
