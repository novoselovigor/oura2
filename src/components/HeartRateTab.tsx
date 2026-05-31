import { Heart, Activity, Calendar, ArrowUpRight, ArrowDownRight } from "lucide-react";
import { OuraHeartRate } from "../types";

interface HeartRateTabProps {
  heartRate: OuraHeartRate[];
}

export default function HeartRateTab({ heartRate }: HeartRateTabProps) {
  if (heartRate.length === 0) {
    return (
      <div id="hr-no-data" className="bg-[#1C1C1E] border border-gray-800 rounded-3xl p-8 text-center text-gray-400">
        <Heart className="w-12 h-12 mx-auto text-[#D4AF37] opacity-60 mb-3 animate-pulse" />
        <p className="font-medium text-white text-base">No Heart Rate Readings Found</p>
        <p className="text-xs text-gray-500 mt-1 max-w-md mx-auto">
          No raw heart rate measurements are logged in this Oura account within the recent 24-hour sync window.
        </p>
      </div>
    );
  }

  // Sort chronologically
  const sortedHR = [...heartRate].sort(
    (a, b) => new Date(a.timestamp).getTime() - new Date(b.timestamp).getTime()
  );

  // Math metrics
  const bpms = sortedHR.map((h) => h.bpm);
  const avgHR = Math.round(bpms.reduce((sum, b) => sum + b, 0) / bpms.length);
  const minHR = Math.min(...bpms);
  const maxHR = Math.max(...bpms);

  // Let's create path data for our custom responsive SVG graph!
  // Padding inside the SVG
  const paddingX = 40;
  const paddingY = 25;
  const chartHeight = 180;
  const chartWidth = 600;

  // Build coordinate points
  const points = sortedHR.map((hr, idx) => {
    const x = paddingX + (idx / (sortedHR.length - 1)) * (chartWidth - paddingX * 2);
    // Inverse Y because SVG coordinates draw down
    const range = maxHR - minHR || 1;
    const y = chartHeight - paddingY - ((hr.bpm - minHR) / range) * (chartHeight - paddingY * 2);
    return { x, y, bpm: hr.bpm, time: hr.timestamp };
  });

  // SVG Line path DSL
  let dLine = "";
  let dArea = "";
  if (points.length > 0) {
    dLine = `M ${points[0].x} ${points[0].y} ` + points.slice(1).map((p) => `L ${p.x} ${p.y}`).join(" ");
    dArea = `${dLine} L ${points[points.length - 1].x} ${chartHeight - paddingY} L ${points[0].x} ${chartHeight - paddingY} Z`;
  }

  return (
    <div id="heart-rate-tab-root" className="space-y-6">
      {/* Metrics Banner */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {/* Average HR */}
        <div className="bg-[#1C1C1E] border border-gray-800 rounded-3xl p-5 flex items-center justify-between shadow-lg">
          <div className="space-y-1">
            <p className="text-gray-500 text-xs uppercase font-semibold tracking-wider flex items-center gap-1.5">
              <Heart className="w-4 h-4 text-[#D4AF37] fill-[#D4AF37]/10 animate-pulse" />
              Average Resting
            </p>
            <p className="text-3xl font-bold text-gray-200 font-mono">{avgHR} <span className="text-xs text-gray-500 font-sans font-normal">BPM</span></p>
          </div>
          <div className="p-3 bg-[#D4AF37]/10 border border-[#D4AF37]/20 rounded-xl text-[#D4AF37] text-sm font-semibold font-mono">
            Ø BPM
          </div>
        </div>

        {/* Min HR */}
        <div className="bg-[#1C1C1E] border border-gray-800 rounded-3xl p-5 flex items-center justify-between shadow-lg">
          <div className="space-y-1">
            <p className="text-gray-500 text-xs uppercase font-semibold tracking-wider flex items-center gap-1.5">
              <ArrowDownRight className="w-4 h-4 text-[#9D8AF4]" />
              Minimum HR
            </p>
            <p className="text-3xl font-bold text-gray-200 font-mono">{minHR} <span className="text-xs text-gray-500 font-sans font-normal">BPM</span></p>
          </div>
          <div className="p-3 bg-[#9D8AF4]/10 border border-[#9D8AF4]/20 rounded-xl text-[#9D8AF4] text-sm font-semibold font-mono">
            Min
          </div>
        </div>

        {/* Max HR */}
        <div className="bg-[#1C1C1E] border border-gray-800 rounded-3xl p-5 flex items-center justify-between shadow-lg">
          <div className="space-y-1">
            <p className="text-gray-500 text-xs uppercase font-semibold tracking-wider flex items-center gap-1.5">
              <ArrowUpRight className="w-4 h-4 text-rose-400" />
              Maximum HR
            </p>
            <p className="text-3xl font-bold text-gray-200 font-mono">{maxHR} <span className="text-xs text-gray-500 font-sans font-normal">BPM</span></p>
          </div>
          <div className="p-3 bg-rose-500/10 border border-rose-500/20 rounded-xl text-rose-400 text-sm font-semibold font-mono">
            Max
          </div>
        </div>
      </div>
      {/* SVG Timeline Chart card */}
      <div className="bg-[#1C1C1E] border border-gray-800 rounded-3xl p-6 shadow-xl space-y-4">
        <div className="flex justify-between items-center border-b border-gray-800 pb-3">
          <h4 className="text-sm font-semibold text-white flex items-center gap-2">
            <Activity className="w-4 h-4 text-[#D4AF37]" />
            Heart Rate Timeline (24-Hour Logs)
          </h4>
          <span className="text-[10px] text-gray-400 bg-[#0B0B0C] px-2.5 py-1 rounded-lg border border-gray-800 font-mono">
            {sortedHR.length} points logged
          </span>
        </div>

        {/* Scaled Responsive Chart Frame */}
        <div className="w-full overflow-hidden bg-[#0B0B0C] rounded-2xl border border-gray-800/60 p-4">
          {points.length > 1 ? (
            <svg
              className="w-full h-auto"
              viewBox={`0 0 ${chartWidth} ${chartHeight}`}
              preserveAspectRatio="xMidYMid meet"
             id="hr-timeline-svg"
            >
              {/* Grid Lines */}
              <line x1={paddingX} y1={paddingY} x2={chartWidth - paddingX} y2={paddingY} stroke="#2C2C2E" strokeDasharray="3,3" />
              <line x1={paddingX} y1={chartHeight / 2} x2={chartWidth - paddingX} y2={chartHeight / 2} stroke="#2C2C2E" strokeDasharray="3,3" />
              <line x1={paddingX} y1={chartHeight - paddingY} x2={chartWidth - paddingX} y2={chartHeight - paddingY} stroke="#2C2C2E" strokeDasharray="3,3" />

              {/* Y Axis Guides */}
              <text x={paddingX - 10} y={paddingY + 4} textAnchor="end" className="fill-gray-500 text-[10px] font-mono">{maxHR}</text>
              <text x={paddingX - 10} y={chartHeight / 2 + 4} textAnchor="end" className="fill-gray-500 text-[10px] font-mono">{Math.round((maxHR + minHR) / 2)}</text>
              <text x={paddingX - 10} y={chartHeight - paddingY + 4} textAnchor="end" className="fill-gray-500 text-[10px] font-mono">{minHR}</text>

              {/* Area fill */}
              <path d={dArea} className="fill-[#D4AF37]/5" />

              {/* Line path */}
              <path d={dLine} fill="none" className="stroke-[#D4AF37]" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />

              {/* Interactive Dots */}
              {points.map((p, i) => {
                // Show a selected few or hover spots
                const showDot = points.length < 20 || i === 0 || i === points.length - 1 || i % Math.ceil(points.length / 8) === 0;
                if (!showDot) return null;
                return (
                  <g key={`${p.time}-${i}`} className="group">
                    <circle cx={p.x} cy={p.y} r="4" className="fill-[#D4AF37] stroke-[#0B0B0C] group-hover:r-6 transition-all animate-pulse" strokeWidth="1.5" />
                    <text
                      x={p.x}
                      y={p.y - 8}
                      textAnchor="middle"
                      className="fill-gray-350 text-[9px] font-mono opacity-0 group-hover:opacity-100 transition-opacity bg-[#0B0B0C]"
                    >
                      {p.bpm}
                    </text>
                  </g>
                );
              })}

              {/* X Axis Time Labels */}
              {points.length > 0 && (
                <>
                  <text x={paddingX} y={chartHeight - 6} textAnchor="start" className="fill-gray-500 text-[9px] font-mono">
                    {new Date(points[0].time).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}
                  </text>
                  <text x={chartWidth / 2} y={chartHeight - 6} textAnchor="middle" className="fill-gray-500 text-[9px] font-mono">
                    {new Date(points[Math.floor(points.length / 2)].time).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}
                  </text>
                  <text x={chartWidth - paddingX} y={chartHeight - 6} textAnchor="end" className="fill-gray-500 text-[9px] font-mono">
                    {new Date(points[points.length - 1].time).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}
                  </text>
                </>
              )}
            </svg>
          ) : (
            <p className="text-center text-xs text-gray-500 py-10 font-mono">Not enough points to plot a curve.</p>
          )}
        </div>
      </div>

      {/* Raw records logs table */}
      <div className="bg-[#1C1C1E] border border-gray-800 rounded-3xl p-5 shadow-xl">
        <h4 className="text-sm font-semibold text-gray-300 pb-3 border-b border-gray-800 mb-4 flex items-center gap-2">
          <Calendar className="w-4 h-4 text-[#D4AF37]" />
          Individual HR Records Ledger
        </h4>

        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse text-xs bg-transparent">
            <thead>
              <tr className="border-b border-gray-800 text-gray-500">
                <th className="py-2.5 font-medium uppercase tracking-wider">Timestamp</th>
                <th className="py-2.5 font-medium uppercase tracking-wider text-center">BPM Score</th>
                <th className="py-2.5 font-medium uppercase tracking-wider text-right">Source Sensor</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-800/40 text-gray-300">
              {[...sortedHR].reverse().map((hr, index) => (
                <tr key={`${hr.timestamp}-${index}`} className="hover:bg-[#2C2C2E]/20">
                  <td className="py-2.5 font-mono">
                    {new Date(hr.timestamp).toLocaleString("en-US", {
                      month: "short",
                      day: "numeric",
                      hour: "2-digit",
                      minute: "2-digit",
                      second: "2-digit",
                    })}
                  </td>
                  <td className="py-2.5 text-center">
                    <span className="font-bold text-[#D4AF37] bg-[#D4AF37]/10 px-2.5 py-0.5 rounded border border-[#D4AF37]/20 font-mono">
                      {hr.bpm} bpm
                    </span>
                  </td>
                  <td className="py-2.5 text-right font-mono text-gray-500 capitalize">
                    {hr.source}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
