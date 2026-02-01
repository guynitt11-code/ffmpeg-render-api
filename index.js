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

    if (!source_video_url || !clips || !clips.length) {
      return res.status(400).json({ error: "missing input" });
    }

    const input = "/tmp/input.mp4";
    const output = "/tmp/output.mp4";

    // download video
    const r = await fetch(source_video_url);
    const b = await r.arrayBuffer();
    fs.writeFileSync(input, Buffer.from(b));

    const { start, end } = clips[0];

    // re-encode to guarantee valid output
    const cmd = `ffmpeg -y -i ${input} -ss ${start} -to ${end} -c:v libx264 -c:a aac ${output}`;

    exec(cmd, (err) => {
      if (err) {
        return res.status(500).json({ error: "ffmpeg failed", details: err.message });
      }

      res.download(output, "render.mp4");
    });

  } catch (e) {
    res.status(500).json({ error: e.message });
  }
});

const PORT = Number(process.env.PORT) || 3000;
app.listen(PORT, "0.0.0.0", () => {
  console.log(`Server running on port ${PORT}`);
});
