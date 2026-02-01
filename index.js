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
  const { source_video_url, clips } = req.body;

  const input = "/tmp/input.mp4";
  const output = "/tmp/output.mp4";

  // הורדת הוידאו
  await fetch(source_video_url)
    .then(r => r.arrayBuffer())
    .then(b => fs.writeFileSync(input, Buffer.from(b)));

  const { start, end } = clips[0];
  const cmd = `ffmpeg -y -i ${input} -ss ${start} -to ${end} -c copy ${output}`;

  exec(cmd, (err) => {
    if (err) {
      return res.status(500).json({ error: "ffmpeg failed", err });
    }

    res.download(output, "render.mp4");
  });
});



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
