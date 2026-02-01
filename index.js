const express = require("express");
const { exec } = require("child_process");
const fs = require("fs");

const app = express();
app.use(express.json({ limit: "200mb" }));

app.get("/health", (req, res) => {
  res.json({ ok: true });
});

app.post("/render", async (req, res) => {
  try {
    const { source_video_url, clips } = req.body;

    if (!source_video_url || !Array.isArray(clips) || clips.length === 0) {
      return res.status(400).json({ ok: false, error: "invalid payload" });
    }

    const { start, end } = clips[0];
    if (typeof start !== "number" || typeof end !== "number" || end <= start) {
      return res.status(400).json({ ok: false, error: "invalid clip range" });
    }

    const input = "/tmp/input.mp4";
    const output = "/tmp/output.mp4";

    const buf = Buffer.from(await (await fetch(source_video_url)).arrayBuffer());
    fs.writeFileSync(input, buf);

    const cmd = `ffmpeg -y -i ${input} -ss ${start} -to ${end} -c copy ${output}`;

    exec(cmd, (err, stdout, stderr) => {
      if (err) {
        return res.status(500).json({
          ok: false,
          error: "ffmpeg failed",
          details: (stderr || err.message || "").slice(0, 2000),
        });
      }
      res.download(output, "render.mp4");
    });
  } catch (e) {
    res.status(500).json({ ok: false, error: e.message });
  }
});

const PORT = Number(process.env.PORT) || 3000;
app.listen(PORT, "0.0.0.0", () => {
  console.log(`Server running on port ${PORT}`);
});
