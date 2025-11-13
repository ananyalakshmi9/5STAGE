const express = require("express");
const cors = require("cors");
const helmet = require("helmet");
const morgan = require("morgan");
const bodyParser = require("body-parser");
const Cache = require("./cache/cache");

const PORT = process.env.PORT || 4000;
const ADMIN_TOKEN = process.env.ADMIN_TOKEN || "dev-admin-token";
const MAX_ITEMS = parseInt(process.env.MAX_ITEMS || "1000", 10);

const app = express();
const cache = new Cache(MAX_ITEMS);

// Middlewares
app.use(cors());
app.use(helmet());
app.use(morgan("tiny"));
app.use(bodyParser.raw({ type: "*/*", limit: "10mb" }));

// Health
app.get("/health", (req, res) => {
  res.json({ status: "ok", items: cache.stats().items });
});

// Metrics
app.get("/metrics", (req, res) => {
  res.json(cache.stats());
});

// PUT
app.put("/v1/cache/:key", (req, res) => {
  const key = req.params.key;
  const ttl = req.query.ttl ? parseInt(req.query.ttl, 10) : null;
  const value = req.body.toString("base64");

  const stored = cache.set(key, value, ttl);
  stored.updated ? res.status(200).json({ status: "updated" }) : res.status(201).json({ status: "created" });
});

// GET
app.get("/v1/cache/:key", (req, res) => {
  const val = cache.get(req.params.key);
  if (!val) return res.status(404).json({ error: "not found" });

  const data = Buffer.from(val, "base64");
  res.status(200).send(data);
});

// DELETE
app.delete("/v1/cache/:key", (req, res) => {
  const ok = cache.del(req.params.key);
  if (!ok) return res.status(404).json({ error: "not found" });
  res.json({ status: "deleted" });
});

// Admin
app.post("/v1/admin/config/eviction", (req, res) => {
  const auth = req.header("authorization") || "";
  if (!auth.startsWith("Bearer ") || auth.slice(7) !== ADMIN_TOKEN)
    return res.status(401).json({ error: "unauthorized" });

  try {
    const body = JSON.parse(req.body.toString());
    if (!["LRU", "LFU", "FIFO"].includes(body.policy))
      return res.status(400).json({ error: "invalid policy" });

    return res.json({ status: "Eviction policy updated" });
  } catch {
    return res.status(400).json({ error: "invalid json" });
  }
});

// Cleanup expired items
let cleanupInterval;
if (require.main === module) {
  cleanupInterval = setInterval(() => cache.cleanupExpired(), 1000);
}

// Only start server if run directly
if (require.main === module) {
  app.listen(PORT, () => console.log(`Simple cache listening on ${PORT}`));
}

module.exports = app;
