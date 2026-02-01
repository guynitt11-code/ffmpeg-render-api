const express = require("express");

const app = express();

app.use(express.json({ limit: "200mb" }));

app.get("/health", (req, res) => {
  res.json({ ok: true });
});

app.post("/render", (req, res) => {
  const { source_video_url, clips } = req.body || {};

  if (!source_video_url || typeof source_video_url !== "string") {
    return res.status(400).json({ ok: false, error: "source_video_url is required" });
  }

  if (!Array.isArray(clips)) {
    return res.status(400).json({ ok: false, error: "clips must be an array" });
  }

  console.log("Render request:", {
    source_video_url,
    clips_count: clips.length
  });

  res.json({
    ok: true,
    message: "validated",
    received: { source_video_url, clips_count: clips.length }
  });
});

const PORT = Number(process.env.PORT) || 3000;

app.listen(PORT, "0.0.0.0", () => {
  console.log(`Server running on port ${PORT}`);
});
