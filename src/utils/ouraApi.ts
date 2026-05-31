import {
  OuraPersonalInfo,
  OuraDailySleep,
  OuraDailyReadiness,
  OuraDailyActivity,
  OuraHeartRate,
  OuraWorkout,
  OuraDetailedSleep,
  OuraResponse
} from "../types";

export type ProxyMode = "localproxy" | "corsproxy.io" | "allorigins" | "direct" | "custom";

export interface ApiConfig {
  token: string;
  proxyMode: ProxyMode;
  customProxyUrl?: string;
}

/**
 * Detects if the current environment hosts a custom server backend (Local/Sandbox Cloud Run)
 */
export function isLocalServerAvailable(): boolean {
  if (typeof window === "undefined") return false;
  const host = window.location.hostname;
  return (
    host === "localhost" ||
    host === "127.0.0.1" ||
    host.endsWith(".run.app") ||
    host.endsWith(".wspace.app") ||
    host.includes("aistudio") ||
    host.includes("google")
  );
}

/**
 * Utility to format Date to YYYY-MM-DD local time offset
 */
export function formatDate(date: Date): string {
  const d = new Date(date);
  const month = "" + (d.getMonth() + 1);
  const day = "" + d.getDate();
  const year = d.getFullYear();

  return [year, month.padStart(2, "0"), day.padStart(2, "0")].join("-");
}

/**
 * Builds the appropriate request URL based on proxy strategy
 */
export function buildUrl(endpoint: string, queryParams: Record<string, string>, config: ApiConfig): string {
  const baseUrl = "https://api.ouraring.com/v2/usercollection/";
  const urlObj = new URL(endpoint, baseUrl);
  
  Object.entries(queryParams).forEach(([key, val]) => {
    urlObj.searchParams.append(key, val);
  });

  const targetUrl = urlObj.toString();

  // If localproxy is chosen but no backend server exists (e.g. running statically on GitHub Pages),
  // automatically redirect requests through corsproxy.io so the app works seamlessly out-of-the-box.
  let activeProxyMode = config.proxyMode;
  if (activeProxyMode === "localproxy" && !isLocalServerAvailable()) {
    console.warn("[Oura API Sync] Local secure proxy is unavailable on this host. Falling back to corsproxy.io");
    activeProxyMode = "corsproxy.io";
  }

  switch (activeProxyMode) {
    case "localproxy":
      const localUrlObj = new URL(`/api/oura/${endpoint}`, window.location.origin);
      Object.entries(queryParams).forEach(([key, val]) => {
        localUrlObj.searchParams.append(key, val);
      });
      return localUrlObj.pathname + localUrlObj.search;
    case "corsproxy.io":
      return `https://corsproxy.io/?url=${encodeURIComponent(targetUrl)}`;
    case "allorigins":
      return `https://api.allorigins.win/raw?url=${encodeURIComponent(targetUrl)}`;
    case "custom":
      if (config.customProxyUrl) {
        // Strip trailing slash if present, check for placeholder or append target as suffix
        const proxyBase = config.customProxyUrl.endsWith("/") 
          ? config.customProxyUrl.slice(0, -1) 
          : config.customProxyUrl;
        return proxyBase.includes("{url}") 
          ? proxyBase.replace("{url}", encodeURIComponent(targetUrl))
          : `${proxyBase}/${targetUrl}`; // Safe fallback
      }
      return targetUrl;
    case "direct":
    default:
      return targetUrl;
  }
}

/**
 * Fetch generic data from Oura API
 */
async function fetchOura<T>(
  endpoint: string,
  queryParams: Record<string, string>,
  config: ApiConfig,
  rawSaver?: (endpointName: string, data: any) => void
): Promise<T> {
  if (!config.token) {
    throw new Error("Oura Personal Access Token (API Key) is required.");
  }

  const url = buildUrl(endpoint, queryParams, config);

  const headers: Record<string, string> = {
    "Authorization": `Bearer ${config.token}`,
    "Accept": "application/json"
  };

  const response = await fetch(url, {
    method: "GET",
    headers: headers
  });

  if (!response.ok) {
    let errorMsg = `Server error ${response.status}: ${response.statusText}`;
    try {
      const errJson = await response.json();
      if (errJson && errJson.detail) {
        errorMsg = errJson.detail;
      }
    } catch {
      // ignore parsing error
    }
    throw new Error(errorMsg);
  }

  const json = await response.json();
  
  // Feed the raw saving callback if provided (for audit / verification tab!)
  if (rawSaver) {
    rawSaver(endpoint, json);
  }

  return json;
}

/**
 * Fetch all Oura metrics concurrently
 */
export async function fetchAllOuraData(
  config: ApiConfig,
  startDate: string,
  endDate: string,
  rawSaver?: (endpointName: string, data: any) => void
): Promise<{
  personalInfo: OuraPersonalInfo | null;
  dailySleep: OuraDailySleep[];
  dailyReadiness: OuraDailyReadiness[];
  dailyActivity: OuraDailyActivity[];
  heartRate: OuraHeartRate[];
  workouts: OuraWorkout[];
  detailedSleep: OuraDetailedSleep[];
}> {
  // Setup queries
  const dateParams = { start_date: startDate, end_date: endDate };

  // Fetch HR logs for a shorter window (last 2 days maximum to limit payload and memory footprint)
  const hrStart = new Date(endDate);
  hrStart.setDate(hrStart.getDate() - 1); // today and yesterday
  const hrStartStr = hrStart.toISOString().split(".")[0] + "Z";
  const hrEndStr = new Date(endDate).toISOString().split(".")[0] + "Z";

  // Individual fetches wrapped in safe tries to ensure one broken endpoint doesn't crash the whole load
  // (Shows only what's there - "показывает только то, что есть").
  
  const errors: Error[] = [];

  const personalInfoPromise = fetchOura<OuraPersonalInfo>("personal_info", {}, config, rawSaver)
    .catch((err) => {
      console.warn("Failed to fetch personal_info:", err);
      errors.push(err);
      return null;
    });

  const dailySleepPromise = fetchOura<OuraResponse<OuraDailySleep>>("daily_sleep", dateParams, config, rawSaver)
    .then((res) => res.data || [])
    .catch((err) => {
      console.warn("Failed to fetch daily_sleep:", err);
      errors.push(err);
      return [] as OuraDailySleep[];
    });

  const dailyReadinessPromise = fetchOura<OuraResponse<OuraDailyReadiness>>("daily_readiness", dateParams, config, rawSaver)
    .then((res) => res.data || [])
    .catch((err) => {
      console.warn("Failed to fetch daily_readiness:", err);
      errors.push(err);
      return [] as OuraDailyReadiness[];
    });

  const dailyActivityPromise = fetchOura<OuraResponse<OuraDailyActivity>>("daily_activity", dateParams, config, rawSaver)
    .then((res) => res.data || [])
    .catch((err) => {
      console.warn("Failed to fetch daily_activity:", err);
      errors.push(err);
      return [] as OuraDailyActivity[];
    });

  const heartRatePromise = fetchOura<OuraResponse<OuraHeartRate>>("heartrate", {
    start_datetime: hrStartStr,
    end_datetime: hrEndStr
  }, config, rawSaver)
    .then((res) => res.data || [])
    .catch((err) => {
      console.warn("Failed to fetch heartrate:", err);
      errors.push(err);
      return [] as OuraHeartRate[];
    });

  const workoutsPromise = fetchOura<OuraResponse<OuraWorkout>>("workout", dateParams, config, rawSaver)
    .then((res) => res.data || [])
    .catch((err) => {
      console.warn("Failed to fetch workouts:", err);
      errors.push(err);
      return [] as OuraWorkout[];
    });

  const detailedSleepPromise = fetchOura<OuraResponse<OuraDetailedSleep>>("sleep", dateParams, config, rawSaver)
    .then((res) => res.data || [])
    .catch((err) => {
      console.warn("Failed to fetch detailed sleep (periods):", err);
      errors.push(err);
      return [] as OuraDetailedSleep[];
    });

  const [
    personalInfo,
    dailySleep,
    dailyReadiness,
    dailyActivity,
    heartRate,
    workouts,
    detailedSleep
  ] = await Promise.all([
    personalInfoPromise,
    dailySleepPromise,
    dailyReadinessPromise,
    dailyActivityPromise,
    heartRatePromise,
    workoutsPromise,
    detailedSleepPromise
  ]);

  // Raise explicit auth failures if encountered
  const authErr = errors.find((e) => {
    const msg = e.message.toLowerCase();
    return msg.includes("401") || msg.includes("403") || msg.includes("unauthorized") || msg.includes("forbidden") || msg.includes("token");
  });

  if (authErr) {
    throw authErr;
  }

  // Raise a holistic error if ALL requested endpoints failed and we ended up with zero data
  if (errors.length >= 7) {
    throw errors[0] || new Error("Failed to contact Oura Ring API servers via current proxy.");
  }

  return {
    personalInfo,
    dailySleep,
    dailyReadiness,
    dailyActivity,
    heartRate,
    workouts,
    detailedSleep
  };
}
