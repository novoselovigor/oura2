import express from "express";
import path from "path";
import { createServer as createViteServer } from "vite";

async function startServer() {
  const app = express();
  const PORT = 3000;

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
