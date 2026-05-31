/**
 * Oura API V2 Types
 * Supported endpoints schema mapping
 */

export interface OuraResponse<T> {
  data: T[];
  next_token?: string | null;
}

export interface OuraPersonalInfo {
  id: string;
  age?: number;
  weight?: number; // kg
  height?: number; // m
  gender?: string;
  email?: string;
}

export interface OuraDailySleep {
  id: string;
  day: string;
  score: number;
  timestamp: string;
  contributors: {
    deep_sleep?: number;
    efficiency?: number;
    latency?: number;
    rem_sleep?: number;
    restitution?: number;
    sleep_duration?: number;
    sleep_timeliness?: number;
    total_sleep?: number;
  };
}

export interface OuraDailyReadiness {
  id: string;
  day: string;
  score: number;
  temperature_deviation?: number;
  temperature_trend_deviation?: number;
  timestamp: string;
  contributors: {
    activity_balance?: number;
    body_temperature?: number;
    hrv_balance?: number;
    previous_day_activity?: number;
    previous_night?: number;
    recovery_index?: number;
    resting_heart_rate?: number;
    sleep_balance?: number;
  };
}

export interface OuraDailyActivity {
  id: string;
  day: string;
  score: number;
  active_calories: number;
  total_calories: number;
  steps: number;
  equivalent_walking_distance?: number; // meters
  high_activity_time?: number; // seconds
  medium_activity_time?: number; // seconds
  low_activity_time?: number; // seconds
  sedentary_time?: number; // seconds
  resting_time?: number; // seconds
  timestamp: string;
  contributors: {
    active_time?: number;
    daily_movement?: number;
    meet_daily_targets?: number;
    recovery?: number;
    stay_active?: number;
    training_frequency?: number;
    training_volume?: number;
  };
}

export interface OuraHeartRate {
  bpm: number;
  source: string;
  timestamp: string;
}

export interface OuraWorkout {
  id: string;
  activity: string;
  calories: number;
  day: string;
  distance?: number; // meters
  duration: number; // seconds
  intensity: string; // "easy", "moderate", "hard"
  label?: string;
  source: string; // "manual", "ring", etc.
  start_datetime: string;
  end_datetime: string;
}

export interface OuraDetailedSleep {
  id: string;
  average_breath?: number;
  average_heart_rate?: number;
  average_hrv?: number;
  awake_time?: number; // seconds
  bedtime_end: string;
  bedtime_start: string;
  day: string;
  deep_sleep_duration?: number; // seconds
  efficiency?: number;
  latency?: number; // seconds
  light_sleep_duration?: number; // seconds
  lowest_heart_rate?: number;
  rem_sleep_duration?: number; // seconds
  restless_percentage?: number;
  time_in_bed?: number; // seconds
  total_sleep_duration?: number; // seconds
  type: string; // "long_sleep", etc.
}

export interface OuraCombinedData {
  personalInfo: OuraPersonalInfo | null;
  dailySleep: OuraDailySleep[];
  dailyReadiness: OuraDailyReadiness[];
  dailyActivity: OuraDailyActivity[];
  heartRate: OuraHeartRate[];
  workouts: OuraWorkout[];
  detailedSleep: OuraDetailedSleep[];
}
