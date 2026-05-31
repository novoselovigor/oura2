import { Trophy, Flame, Clock, Navigation, Calendar } from "lucide-react";
import { OuraWorkout } from "../types";

interface WorkoutsTabProps {
  workouts: OuraWorkout[];
}

export default function WorkoutsTab({ workouts }: WorkoutsTabProps) {
  if (workouts.length === 0) {
    return (
      <div id="workouts-no-data" className="bg-[#1C1C1E] border border-gray-800 rounded-3xl p-8 text-center text-gray-400">
        <Trophy className="w-12 h-12 mx-auto text-[#D4AF37] opacity-60 mb-3 animate-pulse" />
        <p className="font-medium text-white text-base">No Workouts Recorded</p>
        <p className="text-xs text-gray-500 mt-1 max-w-md mx-auto">
          No workouts or active training sessions are logged in this Oura account within the chosen date filters.
        </p>
      </div>
    );
  }

  // Helper inside Workout intensity
  const getIntensityBadge = (lvl: string) => {
    switch (lvl?.toLowerCase()) {
      case "high":
      case "hard":
        return "bg-rose-500/10 text-rose-450 border border-rose-500/20";
      case "medium":
      case "moderate":
        return "bg-[#9D8AF4]/10 text-[#9D8AF4] border border-[#9D8AF4]/20";
      case "low":
      case "easy":
      default:
        return "bg-[#D4AF37]/10 text-[#D4AF37] border border-[#D4AF37]/20";
    }
  };

  const formatSecsToDuration = (secs: number) => {
    const mins = Math.floor(secs / 60);
    const rs = secs % 60;
    if (mins >= 60) {
      const hrs = Math.floor(mins / 60);
      const rm = mins % 60;
      return `${hrs}h ${rm}m`;
    }
    return `${mins}m ${rs}s`;
  };

  return (
    <div id="workouts-tab-root" className="space-y-6">
      <div className="flex justify-between items-center bg-[#1C1C1E] border border-gray-800 p-5 rounded-3xl shadow-lg">
        <div>
          <h3 className="text-base font-semibold text-white flex items-center gap-2">
            <Trophy className="text-[#D4AF37] w-5 h-5 animate-pulse" />
            Active Workouts & Sessions
          </h3>
          <p className="text-xs text-gray-400 mt-1">
            Registered ring workout data and imported multi-device workouts.
          </p>
        </div>
        <div className="text-right">
          <p className="text-xs text-gray-500">Total Workouts</p>
          <p className="text-2xl font-black text-[#D4AF37] font-mono">{workouts.length}</p>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {workouts.map((workout) => (
          <div
            key={workout.id}
            id={`workout-card-${workout.id}`}
            className="bg-[#1C1C1E] border border-gray-800 p-5 rounded-3xl shadow-md hover:border-gray-700 transition-all flex flex-col justify-between gap-4"
          >
            {/* Header portion */}
            <div className="flex items-start justify-between gap-4">
              <div>
                <span className="text-[10px] text-gray-500 font-mono font-bold uppercase tracking-wider">{workout.source}</span>
                <h4 className="text-lg font-bold text-white tracking-tight capitalize mt-0.5">{workout.activity}</h4>
                <div className="flex items-center gap-1.5 text-gray-400 text-xs mt-1">
                  <Calendar className="w-3.5 h-3.5 text-[#D4AF37]" />
                  <span>
                    {new Date(workout.day).toLocaleDateString("en-US", {
                      weekday: "short",
                      month: "short",
                      day: "numeric",
                    })}
                  </span>
                </div>
              </div>
              <span className={`text-[10px] px-2.5 py-1 rounded font-bold uppercase tracking-wider ${getIntensityBadge(workout.intensity)}`}>
                {workout.intensity}
              </span>
            </div>

            {/* Inner Grid stats */}
            <div className="grid grid-cols-3 gap-2 py-3 border-y border-gray-800/60 text-xs">
              {/* Calories */}
              <div className="space-y-1">
                <p className="text-gray-500 text-[10px] uppercase font-semibold tracking-wider flex items-center gap-1">
                  <Flame className="w-3 h-3 text-rose-500" />
                  Active Burn
                </p>
                <p className="font-bold text-gray-200 font-mono">{workout.calories} kcal</p>
              </div>

              {/* Duration */}
              <div className="space-y-1">
                <p className="text-gray-500 text-[10px] uppercase font-semibold tracking-wider flex items-center gap-1">
                  <Clock className="w-3 h-3 text-[#D4AF37]" />
                  Duration
                </p>
                <p className="font-bold text-gray-200 font-mono">{formatSecsToDuration(workout.duration)}</p>
              </div>

              {/* Distance */}
              <div className="space-y-1">
                <p className="text-gray-500 text-[10px] uppercase font-semibold tracking-wider flex items-center gap-1">
                  <Navigation className="w-3 h-3 text-[#9D8AF4]" />
                  Distance
                </p>
                <p className="font-bold text-gray-200 font-mono">
                  {workout.distance !== undefined ? `${(workout.distance / 1000).toFixed(2)} km` : "—"}
                </p>
              </div>
            </div>

            {/* Timings footer */}
            <div className="flex justify-between items-center text-[10px] text-gray-500 font-mono pt-1">
              <span>Start: {new Date(workout.start_datetime).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}</span>
              <span>End: {new Date(workout.end_datetime).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}</span>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
