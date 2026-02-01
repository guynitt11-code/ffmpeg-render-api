const express = require("express");

const app = express();

app.use(express.json({ limit: "200mb" }));

app.get("/health", (req, res) => {
  res.json({ ok: true });
});

app.post("/render", (req, res) => {
  const { source_video_url, clips } = req.body;
  // TODO: Implement ffmpeg rendering
  res.json({ ok: true, message: "API alive" });
});

const PORT = process.env.PORT;
app.listen(PORT, "0.0.0.0", () => {
  console.log(`Server running on port ${PORT}`);
});
