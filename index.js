const express = require("express");

const app = express();

app.use(express.json({ limit: "200mb" }));

app.get("/health", (req, res) => {
  res.json({ ok: true });
});

const { execFile } = require("child_process");
const fs = require("fs");
const path = require("path");
const os = require("os");

function run(cmd, args) {
  return new Promise((resolve, reject) => {
    execFile(cmd, args, { maxBuffer: 1024 * 1024 * 20 }, (err, stdout, stderr) => {
      if (err) return reject(new Error(stderr || err.message));
      resolve({ stdout, stderr });
    });
  });
}

app.post("/render", async (req, res) => {
  try {
    const { source_video_url, clips } = req.body;

    if (!source_video_url || !Array.isArray(clips) || clips.length === 0) {
      return res.status(400).json({ ok: false, error: "invalid payload" });
    }

    const tmpDir = fs.mkdtempSync(path.join(os.tmpdir(), "render-"));
    const inputPath = path.join(tmpDir, "input.mp4");

    // download video
    await run("curl", ["-L", "-o", inputPath, source_video_url]);

    // cut clips
    const clipPaths = [];
    for (let i = 0; i < clips.length; i++) {
      const { start, end } = clips[i] || {};
      if (typeof start !== "number" || typeof end !== "number" || end <= start) {
        return res.status(400).json({ ok: false, error: `invalid clip at index ${i}` });
      }

      const outPath = path.join(tmpDir, `clip-${i}.mp4`);
      clipPaths.push(outPath);

      const duration = (end - start).toFixed(3);

      await run("ffmpeg", [
        "-y",
        "-ss", String(start),
        "-i", inputPath,
        "-t", String(duration),
        "-c", "copy",
        outPath
      ]);
    }

    // concat
    const listPath = path.join(tmpDir, "list.txt");
    fs.writeFileSync(listPath, clipPaths.map(p => `file '${p}'`).join("\n"));

    const outputPath = path.join(tmpDir, "output.mp4");
    await run("ffmpeg", [
      "-y",
      "-f", "concat",
      "-safe", "0",
      "-i", listPath,
      "-c", "copy",
      outputPath
    ]);

    // return file
    res.setHeader("Content-Type", "video/mp4");
    res.setHeader("Content-Disposition", 'attachment; filename="output.mp4"');
    fs.createReadStream(outputPath).pipe(res);
  } catch (e) {
    res.status(500).json({ ok: false, error: e.message });
  }
});

const PORT = Number(process.env.PORT) || 3000;

app.listen(PORT, "0.0.0.0", () => {
  console.log(`Server running on port ${PORT}`);
});
