import express from "express";
import path from "path";
import { createServer as createViteServer } from "vite";
import { GoogleGenAI } from "@google/genai";
import dotenv from "dotenv";

dotenv.config();

// Lazy-initialized Gemini Client
let genAIClient: GoogleGenAI | null = null;

function getGeminiClient(): GoogleGenAI {
  if (!genAIClient) {
    const key = process.env.GEMINI_API_KEY;
    if (!key) {
      throw new Error("GEMINI_API_KEY is required but is missing in local environment secrets.");
    }
    genAIClient = new GoogleGenAI({
      apiKey: key,
      httpOptions: {
        headers: {
          "User-Agent": "aistudio-build",
        },
      },
    });
  }
  return genAIClient;
}

function formatOuraContext(d: any): string {
  if (!d) return "No Oura Ring data has been shared yet.";
  
  const p = d.personalInfo || {};
  const personalStr = `Age: ${p.age ?? "N/A"}, Weight: ${p.weight ?? "N/A"}kg, Height: ${p.height ?? "N/A"}m, Gender: ${p.gender ?? "N/A"}`;

  const recentSleeps = d.dailySleep?.slice(-3) || [];
  const sleepsFormatted = recentSleeps.map((s: any) => 
    `- Day: ${s.day}, Score: ${s.score}, Sleep Duration: ${Math.round((s.contributors?.total_sleep || 0)/60)} mins, Deep Sleep: ${Math.round((s.contributors?.deep_sleep || 0)/60)} mins`
  ).join("\n");

  const recentReadiness = d.dailyReadiness?.slice(-3) || [];
  const readinessFormatted = recentReadiness.map((r: any) => 
    `- Day: ${r.day}, Score: ${r.score}, RHR: ${r.contributors?.resting_heart_rate ?? "N/A"}, HRV Balance: ${r.contributors?.hrv_balance ?? "N/A"}`
  ).join("\n");

  const recentActivity = d.dailyActivity?.slice(-3) || [];
  const activityFormatted = recentActivity.map((a: any) => 
    `- Day: ${a.day}, Score: ${a.score}, Steps: ${a.steps}, Active Calories: ${a.active_calories} kcal`
  ).join("\n");

  return `
[User Profile]: ${personalStr}
[Sleep Records - Last 3 Days]:
${sleepsFormatted}
[Readiness Records - Last 3 Days]:
${readinessFormatted}
[Activity Records - Last 3 Days]:
${activityFormatted}
  `.trim();
}

async function startServer() {
  const app = express();
  const PORT = 3000;

  // Middleware to support incoming JSON POST requests with generous limits to handle large Oura Ring data
  app.use(express.json({ limit: "10mb" }));
  app.use(express.urlencoded({ limit: "10mb", extended: true }));

  // Health Check Endpoint
  app.get("/api/health", (req, res) => {
    res.json({ status: "ok", mode: process.env.NODE_ENV || "development", timestamp: new Date().toISOString() });
  });

  // Gemini AI Coach Chat Endpoint
  app.post("/api/coach/chat", async (req, res) => {
    try {
      const { messages, ouraData, geminiApiKey } = req.body;
      
      const keyToUse = geminiApiKey || process.env.GEMINI_API_KEY;
      if (!keyToUse) {
        throw new Error("GEMINI_API_KEY is missing. Please set it in Application Secrets or enter it directly in the AI Trainer tab.");
      }
      
      const client = new GoogleGenAI({
        apiKey: keyToUse,
        httpOptions: {
          headers: {
            "User-Agent": "aistudio-build",
          },
        },
      });

      const ouraSummary = formatOuraContext(ouraData);

      const systemInstruction = `You are a professional elite athletic and health coach (ИИ Тренер). 
Your task is to analyze the user's Oura Ring sleep, readiness, heart rate, and activity metrics, and provide bespoke, incredibly accurate coaching, recovery protocols, athletic training guidance, and sleep optimization advice.

The user's recent Oura Ring data context:
${ouraSummary}

Important Guidelines:
1. Always base your advice on the actual Oura metrics provided above. Do not hallucinate or make up metrics. If certain metrics are not in the data, acknowledge that but still guide based on what IS there.
2. Maintain an encouraging, friendly, and expert coach tone, combining deep biomarker knowledge (such as HRV balance, resting heart rate, deep/REM sleep percentages, sleep efficiency, and respiratory rates) with simple, actionable advice.
3. Keep answers concise, highly specific, and clear. Avoid very long essays, keep it readable and structured.
4. Speak in Russian by default (unless the user explicitly greets or asks in English) because the client interface and user are primarily Russian-speaking. Use natural, motivational, professional Russian terminology.
5. Format your output using clean Markdown (such as bold headers, clear short bullet points, and neat spacing) for an elegant bento UI display.`;

      const contents = (messages || []).map((m: any) => ({
        role: m.role === "assistant" ? "model" : "user",
        parts: [{ text: m.content }]
      }));

      // If no custom user queries, generate an initial analysis
      if (contents.length === 0) {
        contents.push({
          role: "user",
          parts: [{ text: "Привет! Дай мне краткий персональный анализ моих показателей за последние дни и дай 3 ключевых рекомендации тренера." }]
        });
      }

      const response = await client.models.generateContent({
        model: "gemini-3.5-flash",
        contents: contents,
        config: {
          systemInstruction,
          temperature: 0.7,
        },
      });

      res.json({ text: response.text });
    } catch (error: any) {
      console.error("[Gemini Coach Error]:", error);
      res.status(500).json({ error: error.message || "Failed to generate coaching response" });
    }
  });

  // Let's implement a direct server-side secure Oura proxy
  app.get("/api/oura/:endpoint", async (req, res) => {
    const { endpoint } = req.params;
    const token = req.headers.authorization;

    if (!token) {
      console.warn("[Oura Proxy] Rejected request: Missing Authorization header");
      return res.status(401).json({ detail: "Missing Authorization header" });
    }

    // Oura API URL V2 Base
    const targetUrl = new URL(`https://api.ouraring.com/v2/usercollection/${endpoint}`);

    // Forward all incoming client query parameters
    Object.entries(req.query).forEach(([key, val]) => {
      if (typeof val === "string") {
        targetUrl.searchParams.append(key, val);
      }
    });

    console.log(`[Oura Proxy] Fetching: ${targetUrl.toString()}`);

    try {
      const ouraResponse = await fetch(targetUrl.toString(), {
        method: "GET",
        headers: {
          "Authorization": token,
          "Accept": "application/json",
        },
      });

      const responseStatus = ouraResponse.status;

      // Handle non-2xx status codes elegantly
      if (!ouraResponse.ok) {
        let errorMsg = `Upstream server returned error ${responseStatus}: ${ouraResponse.statusText}`;
        try {
          const errJson = await ouraResponse.json();
          if (errJson && errJson.detail) {
            errorMsg = errJson.detail;
          }
        } catch {
          // keep fallback error statement
        }
        console.error(`[Oura Proxy] Upstream Error (${responseStatus}): ${errorMsg}`);
        return res.status(responseStatus).json({ detail: errorMsg });
      }

      const responseJson = await ouraResponse.json();
      res.status(responseStatus).json(responseJson);

    } catch (error: any) {
      console.error(`[Oura Proxy] local fallback error on endpoint ${endpoint}:`, error);
      res.status(500).json({ detail: `Local proxy connection error: ${error.message || "Unknown proxy error"}` });
    }
  });

  // Vite integration middleware
  if (process.env.NODE_ENV !== "production") {
    console.log("[Oura App] Loading Vite middleware mode...");
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "spa",
    });
    app.use(vite.middlewares);
  } else {
    console.log("[Oura App] Loading static file serving for Production...");
    const distPath = path.join(process.cwd(), "dist");
    app.use(express.static(distPath));
    app.get("*", (req, res) => {
      res.sendFile(path.join(distPath, "index.html"));
    });
  }

  app.listen(PORT, "0.0.0.0", () => {
    console.log(`[Oura Mirror Server] listening at http://0.0.0.0:${PORT}`);
  });
}

startServer();
