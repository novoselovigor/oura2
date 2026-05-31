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
async function startServer() {
  const app = (0, import_express.default)();
  const PORT = 3e3;
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
