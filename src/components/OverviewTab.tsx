import { Activity, Heart, Moon, Shield, Sparkles, Zap, Footprints, Flame, User } from "lucide-react";
import { OuraCombinedData } from "../types";

interface OverviewTabProps {
  data: OuraCombinedData;
  onTabChange: (tabId: string) => void;
}

export default function OverviewTab({ data, onTabChange }: OverviewTabProps) {
  const { personalInfo, dailySleep, dailyReadiness, dailyActivity, heartRate } = data;

  // Find latest records to display
  const latestSleep = dailySleep.length > 0 ? dailySleep[dailySleep.length - 1] : null;
  const latestReadiness = dailyReadiness.length > 0 ? dailyReadiness[dailyReadiness.length - 1] : null;
  const latestActivity = dailyActivity.length > 0 ? dailyActivity[dailyActivity.length - 1] : null;

  // Compute heart rate average from recent
  const latestHR = heartRate.length > 0 ? heartRate[heartRate.length - 1] : null;
  const recentAvgHR = heartRate.length > 0
    ? Math.round(heartRate.reduce((acc, h) => acc + h.bpm, 0) / heartRate.length)
    : null;

  // Unified score status helper mapped to Gold and Lavender
  const getScoreRating = (score: number) => {
    if (score >= 85) return { text: "Optimal", color: "text-[#D4AF37]", border: "border-[#D4AF37]/30", bg: "bg-[#D4AF37]/5", fill: "stroke-[#D4AF37]" };
    if (score >= 70) return { text: "Good", color: "text-[#9D8AF4]", border: "border-[#9D8AF4]/30", bg: "bg-[#9D8AF4]/5", fill: "stroke-[#9D8AF4]" };
    if (score >= 60) return { text: "Fair", color: "text-amber-450", border: "border-amber-500/20", bg: "bg-amber-500/5", fill: "stroke-amber-400" };
    return { text: "Low", color: "text-rose-450", border: "border-rose-500/20", bg: "bg-rose-500/5", fill: "stroke-rose-400" };
  };

  // Compile unique array of days representing loaded history
  const daysWithData = Array.from(
    new Set([
      ...dailySleep.map((d) => d.day),
      ...dailyReadiness.map((d) => d.day),
      ...dailyActivity.map((d) => d.day),
    ])
  ).sort((a, b) => new Date(a).getTime() - new Date(b).getTime());

  return (
    <div id="overview-tab-root" className="space-y-6">
      {/* Handshake greeting card with Personal Info */}
      {personalInfo && (
        <div className="bg-[#1C1C1E] border border-gray-800 rounded-3xl p-6 shadow-xl text-[#F5F5F7] flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div className="flex items-center gap-4">
            <div className="p-3.5 bg-[#D4AF37]/10 border border-[#D4AF37]/20 text-[#D4AF37] rounded-2xl">
              <User className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-xl font-bold text-[#F5F5F7] tracking-tight">Oura User Ring Profile</h2>
              <p className="text-xs text-gray-400 mt-0.5">
                Connected account: <span className="text-[#D4AF37] font-semibold font-mono">{personalInfo.email || "Confidential Account"}</span>
              </p>
            </div>
          </div>

          {/* Physical specs (Only prints what is returned) */}
          <div className="flex flex-wrap gap-4 text-xs font-mono">
            {personalInfo.age !== undefined && (
              <div className="bg-[#0B0B0C] border border-gray-800 px-3.5 py-1.5 rounded-xl">
                <span className="text-gray-500">Age: </span>
                <span className="text-gray-200 font-bold">{personalInfo.age} yrs</span>
              </div>
            )}
            {personalInfo.gender !== undefined && (
              <div className="bg-[#0B0B0C] border border-gray-800 px-3.5 py-1.5 rounded-xl capitalize">
                <span className="text-gray-500">Gender: </span>
                <span className="text-gray-200 font-bold">{personalInfo.gender}</span>
              </div>
            )}
            {personalInfo.weight !== undefined && (
              <div className="bg-[#0B0B0C] border border-gray-800 px-3.5 py-1.5 rounded-xl">
                <span className="text-gray-500">Weight: </span>
                <span className="text-gray-200 font-bold">{personalInfo.weight.toFixed(1)} kg</span>
              </div>
            )}
            {personalInfo.height !== undefined && (
              <div className="bg-[#0B0B0C] border border-gray-800 px-3.5 py-1.5 rounded-xl">
                <span className="text-gray-500">Height: </span>
                <span className="text-gray-200 font-bold">{personalInfo.height.toFixed(2)} m</span>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Main Core Scores Meters Row */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* Readiness Meter Card */}
        <div className="bg-[#1C1C1E] border border-gray-800 rounded-3xl p-6 shadow-xl flex flex-col justify-between gap-4">
          <div className="flex items-center justify-between border-b border-gray-800/60 pb-3">
            <span className="text-gray-400 text-xs font-semibold uppercase tracking-wider flex items-center gap-1.5">
              <Sparkles className="w-4 h-4 text-[#D4AF37]" />
              Daily Readiness
            </span>
            <button
              type="button"
              id="goto-readiness-tab"
              onClick={() => onTabChange("Readiness")}
              className="text-[10px] text-[#D4AF37] hover:underline font-semibold font-mono cursor-pointer"
            >
              Analyze Detail →
            </button>
          </div>

          {latestReadiness ? (
            <div className="flex items-center gap-6 py-2">
              {/* Circular score ring */}
              <div className="relative w-20 h-20 shrink-0 flex items-center justify-center">
                <svg className="w-full h-full -rotate-90">
                  <circle cx="44" cy="44" r="34" className="stroke-[#0B0B0C] fill-none" strokeWidth="6" />
                  <circle
                    cx="44"
                    cy="44"
                    r="34"
                    className={`fill-none ${getScoreRating(latestReadiness.score).fill} transition-all`}
                    strokeWidth="6"
                    strokeDasharray={`${2 * Math.PI * 34}`}
                    strokeDashoffset={`${2 * Math.PI * 34 * (1 - latestReadiness.score / 100)}`}
                    strokeLinecap="round"
                  />
                </svg>
                <div className="absolute font-mono font-black text-xl text-[#F5F5F7] mr-1 mt-1">
                  {latestReadiness.score}
                </div>
              </div>

              <div>
                <p className={`text-base font-bold ${getScoreRating(latestReadiness.score).color}`}>
                  {getScoreRating(latestReadiness.score).text}
                </p>
                <p className="text-xs text-gray-400 mt-1">
                  Ready for normal workload. High resting pulse recovery rates.
                </p>
                <p className="text-[9px] text-gray-500 mt-2 font-mono">Date: {latestReadiness.day}</p>
              </div>
            </div>
          ) : (
            <p className="text-xs text-gray-500 py-6 text-center italic font-mono">No recent readiness logged.</p>
          )}
        </div>

        {/* Sleep Meter Card */}
        <div className="bg-[#1C1C1E] border border-gray-800 rounded-3xl p-6 shadow-xl flex flex-col justify-between gap-4">
          <div className="flex items-center justify-between border-b border-gray-800/60 pb-3">
            <span className="text-gray-400 text-xs font-semibold uppercase tracking-wider flex items-center gap-1.5">
              <Moon className="w-4 h-4 text-[#9D8AF4]" />
              Sleep Score
            </span>
            <button
              type="button"
              id="goto-sleep-tab"
              onClick={() => onTabChange("Sleep")}
              className="text-[10px] text-[#9D8AF4] hover:underline font-semibold font-mono cursor-pointer"
            >
              Analyze Detail →
            </button>
          </div>

          {latestSleep ? (
            <div className="flex items-center gap-6 py-2">
              {/* Circular score ring */}
              <div className="relative w-20 h-20 shrink-0 flex items-center justify-center">
                <svg className="w-full h-full -rotate-90">
                  <circle cx="44" cy="44" r="34" className="stroke-[#0B0B0C] fill-none" strokeWidth="6" />
                  <circle
                    cx="44"
                    cy="44"
                    r="34"
                    className={`fill-none ${getScoreRating(latestSleep.score).fill} transition-all`}
                    strokeWidth="6"
                    strokeDasharray={`${2 * Math.PI * 34}`}
                    strokeDashoffset={`${2 * Math.PI * 34 * (1 - latestSleep.score / 100)}`}
                    strokeLinecap="round"
                  />
                </svg>
                <div className="absolute font-mono font-black text-xl text-[#F5F5F7] mr-1 mt-1">
                  {latestSleep.score}
                </div>
              </div>

              <div>
                <p className={`text-base font-bold ${getScoreRating(latestSleep.score).color}`}>
                  {getScoreRating(latestSleep.score).text}
                </p>
                <p className="text-xs text-gray-400 mt-1">
                  Average deep cycles reached, high REM efficiency.
                </p>
                <p className="text-[9px] text-gray-500 mt-2 font-mono">Date: {latestSleep.day}</p>
              </div>
            </div>
          ) : (
            <p className="text-xs text-gray-500 py-6 text-center italic font-mono">No recent sleep logged.</p>
          )}
        </div>

        {/* Activity Meter Card */}
        <div className="bg-[#1C1C1E] border border-gray-800 rounded-3xl p-6 shadow-xl flex flex-col justify-between gap-4">
          <div className="flex items-center justify-between border-b border-gray-800/60 pb-3">
            <span className="text-gray-400 text-xs font-semibold uppercase tracking-wider flex items-center gap-1.5">
              <Zap className="w-4 h-4 text-orange-450" />
              Activity Performance
            </span>
            <button
              type="button"
              id="goto-activity-tab"
              onClick={() => onTabChange("Activity")}
              className="text-[10px] text-orange-400 hover:underline font-semibold font-mono cursor-pointer"
            >
              Analyze Detail →
            </button>
          </div>

          {latestActivity ? (
            <div className="flex items-center gap-6 py-2">
              {/* Circular score ring */}
              <div className="relative w-20 h-20 shrink-0 flex items-center justify-center">
                <svg className="w-full h-full -rotate-90">
                  <circle cx="44" cy="44" r="34" className="stroke-[#0B0B0C] fill-none" strokeWidth="6" />
                  <circle
                    cx="44"
                    cy="44"
                    r="34"
                    className={`fill-none ${getScoreRating(latestActivity.score).fill} transition-all`}
                    strokeWidth="6"
                    strokeDasharray={`${2 * Math.PI * 34}`}
                    strokeDashoffset={`${2 * Math.PI * 34 * (1 - latestActivity.score / 100)}`}
                    strokeLinecap="round"
                  />
                </svg>
                <div className="absolute font-mono font-black text-xl text-[#F5F5F7] mr-1 mt-1">
                  {latestActivity.score}
                </div>
              </div>

              <div>
                <p className={`text-base font-bold ${getScoreRating(latestActivity.score).color}`}>
                  {getScoreRating(latestActivity.score).text}
                </p>
                <p className="text-xs text-gray-400 mt-1">
                  Active movement score evaluated. Targets met consistently.
                </p>
                <p className="text-[9px] text-gray-500 mt-2 font-mono">Date: {latestActivity.day}</p>
              </div>
            </div>
          ) : (
            <p className="text-xs text-gray-500 py-6 text-center italic font-mono">No recent activity logged.</p>
          )}
        </div>
      </div>

      {/* Mini Banner Stat grid */}
      <h3 className="text-sm font-semibold text-gray-400 uppercase tracking-wider pt-2">
        Core Indicators Today
      </h3>
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        {/* Steps card */}
        <div className="bg-[#1C1C1E] border border-gray-800 rounded-3xl p-5 flex items-center gap-4 shadow-lg">
          <div className="p-3 bg-[#D4AF37]/10 border border-[#D4AF37]/20 text-[#D4AF37] rounded-xl">
            <Footprints className="w-5 h-5" />
          </div>
          <div>
            <p className="text-gray-500 text-[10px] uppercase font-semibold font-mono">Steps Count</p>
            <p className="text-xl font-bold text-[#F5F5F7] mt-0.5 font-mono">
              {latestActivity ? latestActivity.steps.toLocaleString() : "0"}
            </p>
          </div>
        </div>

        {/* Calories card */}
        <div className="bg-[#1C1C1E] border border-gray-800 rounded-3xl p-5 flex items-center gap-4 shadow-lg">
          <div className="p-3 bg-[#9D8AF4]/10 border border-[#9D8AF4]/20 text-[#9D8AF4] rounded-xl">
            <Flame className="w-5 h-5" />
          </div>
          <div>
            <p className="text-gray-500 text-[10px] uppercase font-semibold font-mono">Active Energy</p>
            <p className="text-xl font-bold text-[#F5F5F7] mt-0.5 font-mono">
              {latestActivity ? `${latestActivity.active_calories} kcal` : "0 kcal"}
            </p>
          </div>
        </div>

        {/* Heart Rate Indicator */}
        <div className="bg-[#1C1C1E] border border-gray-800 rounded-3xl p-5 flex items-center gap-4 shadow-lg">
          <div className="p-3 bg-rose-500/10 border border-rose-500/20 text-rose-500 rounded-xl">
            <Heart className="w-5 h-5 fill-rose-500/15" />
          </div>
          <div>
            <p className="text-gray-500 text-[10px] uppercase font-semibold font-mono">Live Heart Rate</p>
            <p className="text-xl font-bold text-[#F5F5F7] mt-0.5 font-mono">
              {latestHR ? `${latestHR.bpm} bpm` : recentAvgHR ? `${recentAvgHR} bpm (avg)` : "—"}
            </p>
          </div>
        </div>
      </div>

      {/* Side-by-side Weekly visual trends comparison */}
      <div className="bg-[#1C1C1E] border border-gray-800 rounded-3xl p-6 shadow-xl">
        <h4 className="text-sm font-semibold text-gray-300 border-b border-gray-800 pb-3 mb-5 flex items-center gap-2">
          <Activity className="w-4 h-4 text-[#9D8AF4]" />
          Synchronized Score Trend Matrix
        </h4>

        {daysWithData.length > 0 ? (
          <div className="space-y-4">
            {/* Legend guide */}
            <div className="flex gap-4 text-[10px] font-semibold text-gray-500">
              <div className="flex items-center gap-1.5">
                <div className="w-3 h-1.5 bg-[#D4AF37] rounded" />
                <span>Readiness</span>
              </div>
              <div className="flex items-center gap-1.5">
                <div className="w-3 h-1.5 bg-[#9D8AF4] rounded" />
                <span>Sleep</span>
              </div>
              <div className="flex items-center gap-1.5">
                <div className="w-3 h-1.5 bg-orange-450 rounded" />
                <span>Activity</span>
              </div>
            </div>

            {/* Micro grid representation */}
            <div className="space-y-4">
              {daysWithData.map((day) => {
                const sleepScore = dailySleep.find((s) => s.day === day)?.score;
                const readinessScore = dailyReadiness.find((r) => r.day === day)?.score;
                const activityScore = dailyActivity.find((a) => a.day === day)?.score;

                return (
                  <div key={day} className="grid grid-cols-1 sm:grid-cols-4 items-center gap-2 border-b border-gray-850/40 pb-3">
                    <div className="text-xs font-mono font-bold text-gray-400">
                      {new Date(day).toLocaleDateString("en-US", { weekday: "short", month: "short", day: "numeric" })}
                    </div>

                    <div className="sm:col-span-3 space-y-1.5">
                      {/* Readiness timeline block */}
                      {readinessScore !== undefined && (
                        <div className="flex items-center gap-3">
                          <span className="text-[9px] text-[#D4AF37] w-16 text-right font-mono">Readiness {readinessScore}</span>
                          <div className="flex-1 bg-[#0B0B0C] h-2 rounded-full overflow-hidden">
                            <div className="h-full bg-[#D4AF37] rounded-full" style={{ width: `${readinessScore}%` }} />
                          </div>
                        </div>
                      )}

                      {/* Sleep timeline block */}
                      {sleepScore !== undefined && (
                        <div className="flex items-center gap-3">
                          <span className="text-[9px] text-[#9D8AF4] w-16 text-right font-mono">Sleep {sleepScore}</span>
                          <div className="flex-1 bg-[#0B0B0C] h-2 rounded-full overflow-hidden">
                            <div className="h-full bg-[#9D8AF4] rounded-full" style={{ width: `${sleepScore}%` }} />
                          </div>
                        </div>
                      )}

                      {/* Activity timeline block */}
                      {activityScore !== undefined && (
                        <div className="flex items-center gap-3">
                          <span className="text-[9px] text-orange-400 w-16 text-right font-mono">Activity {activityScore}</span>
                          <div className="flex-1 bg-[#0B0B0C] h-2 rounded-full overflow-hidden">
                            <div className="h-full bg-orange-450 rounded-full" style={{ width: `${activityScore}%` }} />
                          </div>
                        </div>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        ) : (
          <p className="text-center text-xs text-slate-505 font-mono py-12">No multi-day records found to display trend cycles.</p>
        )}
      </div>
    </div>
  );
}
