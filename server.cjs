var __create = Object.create;
var __defProp = Object.defineProperty;
var __getOwnPropDesc = Object.getOwnPropertyDescriptor;
var __getOwnPropNames = Object.getOwnPropertyNames;
var __getProtoOf = Object.getPrototypeOf;
var __hasOwnProp = Object.prototype.hasOwnProperty;
var __copyProps = (to, from, except, desc) => {
  if (from && typeof from === "object" || typeof from === "function") {
    for (let key of __getOwnPropNames(from))
      if (!__hasOwnProp.call(to, key) && key !== except)
        __defProp(to, key, { get: () => from[key], enumerable: !(desc = __getOwnPropDesc(from, key)) || desc.enumerable });
  }
  return to;
};
var __toESM = (mod, isNodeMode, target) => (target = mod != null ? __create(__getProtoOf(mod)) : {}, __copyProps(
  // If the importer is in node compatibility mode or this is not an ESM
  // file that has been converted to a CommonJS file using a Babel-
  // compatible transform (i.e. "__esModule" has not been set), then set
  // "default" to the CommonJS "module.exports" for node compatibility.
  isNodeMode || !mod || !mod.__esModule ? __defProp(target, "default", { value: mod, enumerable: true }) : target,
  mod
));

// server.ts
var import_express = __toESM(require("express"), 1);
var import_path = __toESM(require("path"), 1);
var import_vite = require("vite");
var import_genai = require("@google/genai");
var import_dotenv = __toESM(require("dotenv"), 1);
import_dotenv.default.config();
function formatOuraContext(d) {
  if (!d) return "No Oura Ring data has been shared yet.";
  const p = d.personalInfo || {};
  const personalStr = `Age: ${p.age ?? "N/A"}, Weight: ${p.weight ?? "N/A"}kg, Height: ${p.height ?? "N/A"}m, Gender: ${p.gender ?? "N/A"}`;
  const recentSleeps = d.dailySleep?.slice(-3) || [];
  const sleepsFormatted = recentSleeps.map(
    (s) => `- Day: ${s.day}, Score: ${s.score}, Sleep Duration: ${Math.round((s.contributors?.total_sleep || 0) / 60)} mins, Deep Sleep: ${Math.round((s.contributors?.deep_sleep || 0) / 60)} mins`
  ).join("\n");
  const recentReadiness = d.dailyReadiness?.slice(-3) || [];
  const readinessFormatted = recentReadiness.map(
    (r) => `- Day: ${r.day}, Score: ${r.score}, RHR: ${r.contributors?.resting_heart_rate ?? "N/A"}, HRV Balance: ${r.contributors?.hrv_balance ?? "N/A"}`
  ).join("\n");
  const recentActivity = d.dailyActivity?.slice(-3) || [];
  const activityFormatted = recentActivity.map(
    (a) => `- Day: ${a.day}, Score: ${a.score}, Steps: ${a.steps}, Active Calories: ${a.active_calories} kcal`
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
  const app = (0, import_express.default)();
  const PORT = 3e3;
  app.use(import_express.default.json({ limit: "10mb" }));
  app.use(import_express.default.urlencoded({ limit: "10mb", extended: true }));
  app.get("/api/health", (req, res) => {
    res.json({ status: "ok", mode: process.env.NODE_ENV || "development", timestamp: (/* @__PURE__ */ new Date()).toISOString() });
  });
  app.post("/api/coach/chat", async (req, res) => {
    try {
      const { messages, ouraData, geminiApiKey } = req.body;
      const keyToUse = geminiApiKey || process.env.GEMINI_API_KEY;
      if (!keyToUse) {
        throw new Error("GEMINI_API_KEY is missing. Please set it in Application Secrets or enter it directly in the AI Trainer tab.");
      }
      const client = new import_genai.GoogleGenAI({
        apiKey: keyToUse,
        httpOptions: {
          headers: {
            "User-Agent": "aistudio-build"
          }
        }
      });
      const ouraSummary = formatOuraContext(ouraData);
      const systemInstruction = `You are a professional elite athletic and health coach (\u0418\u0418 \u0422\u0440\u0435\u043D\u0435\u0440). 
Your task is to analyze the user's Oura Ring sleep, readiness, heart rate, and activity metrics, and provide bespoke, incredibly accurate coaching, recovery protocols, athletic training guidance, and sleep optimization advice.

The user's recent Oura Ring data context:
${ouraSummary}

Important Guidelines:
1. Always base your advice on the actual Oura metrics provided above. Do not hallucinate or make up metrics. If certain metrics are not in the data, acknowledge that but still guide based on what IS there.
2. Maintain an encouraging, friendly, and expert coach tone, combining deep biomarker knowledge (such as HRV balance, resting heart rate, deep/REM sleep percentages, sleep efficiency, and respiratory rates) with simple, actionable advice.
3. Keep answers concise, highly specific, and clear. Avoid very long essays, keep it readable and structured.
4. Speak in Russian by default (unless the user explicitly greets or asks in English) because the client interface and user are primarily Russian-speaking. Use natural, motivational, professional Russian terminology.
5. Format your output using clean Markdown (such as bold headers, clear short bullet points, and neat spacing) for an elegant bento UI display.`;
      const contents = (messages || []).map((m) => ({
        role: m.role === "assistant" ? "model" : "user",
        parts: [{ text: m.content }]
      }));
      if (contents.length === 0) {
        contents.push({
          role: "user",
          parts: [{ text: "\u041F\u0440\u0438\u0432\u0435\u0442! \u0414\u0430\u0439 \u043C\u043D\u0435 \u043A\u0440\u0430\u0442\u043A\u0438\u0439 \u043F\u0435\u0440\u0441\u043E\u043D\u0430\u043B\u044C\u043D\u044B\u0439 \u0430\u043D\u0430\u043B\u0438\u0437 \u043C\u043E\u0438\u0445 \u043F\u043E\u043A\u0430\u0437\u0430\u0442\u0435\u043B\u0435\u0439 \u0437\u0430 \u043F\u043E\u0441\u043B\u0435\u0434\u043D\u0438\u0435 \u0434\u043D\u0438 \u0438 \u0434\u0430\u0439 3 \u043A\u043B\u044E\u0447\u0435\u0432\u044B\u0445 \u0440\u0435\u043A\u043E\u043C\u0435\u043D\u0434\u0430\u0446\u0438\u0438 \u0442\u0440\u0435\u043D\u0435\u0440\u0430." }]
        });
      }
      const response = await client.models.generateContent({
        model: "gemini-3.5-flash",
        contents,
        config: {
          systemInstruction,
          temperature: 0.7
        }
      });
      res.json({ text: response.text });
    } catch (error) {
      console.error("[Gemini Coach Error]:", error);
      res.status(500).json({ error: error.message || "Failed to generate coaching response" });
    }
  });
  app.get("/api/oura/:endpoint", async (req, res) => {
    const { endpoint } = req.params;
    const token = req.headers.authorization;
    if (!token) {
      console.warn("[Oura Proxy] Rejected request: Missing Authorization header");
      return res.status(401).json({ detail: "Missing Authorization header" });
    }
    const targetUrl = new URL(`https://api.ouraring.com/v2/usercollection/${endpoint}`);
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
          "Accept": "application/json"
        }
      });
      const responseStatus = ouraResponse.status;
      if (!ouraResponse.ok) {
        let errorMsg = `Upstream server returned error ${responseStatus}: ${ouraResponse.statusText}`;
        try {
          const errJson = await ouraResponse.json();
          if (errJson && errJson.detail) {
            errorMsg = errJson.detail;
          }
        } catch {
        }
        console.error(`[Oura Proxy] Upstream Error (${responseStatus}): ${errorMsg}`);
        return res.status(responseStatus).json({ detail: errorMsg });
      }
      const responseJson = await ouraResponse.json();
      res.status(responseStatus).json(responseJson);
    } catch (error) {
      console.error(`[Oura Proxy] local fallback error on endpoint ${endpoint}:`, error);
      res.status(500).json({ detail: `Local proxy connection error: ${error.message || "Unknown proxy error"}` });
    }
  });
  if (process.env.NODE_ENV !== "production") {
    console.log("[Oura App] Loading Vite middleware mode...");
    const vite = await (0, import_vite.createServer)({
      server: { middlewareMode: true },
      appType: "spa"
    });
    app.use(vite.middlewares);
  } else {
    console.log("[Oura App] Loading static file serving for Production...");
    const distPath = import_path.default.join(process.cwd(), "dist");
    app.use(import_express.default.static(distPath));
    app.get("*", (req, res) => {
      res.sendFile(import_path.default.join(distPath, "index.html"));
    });
  }
  app.listen(PORT, "0.0.0.0", () => {
    console.log(`[Oura Mirror Server] listening at http://0.0.0.0:${PORT}`);
  });
}
startServer();
//# sourceMappingURL=server.cjs.map
