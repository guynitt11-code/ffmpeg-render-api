# ffmpeg-render-api

HTTP API for video rendering with ffmpeg. Designed for deployment on Railway.

## Local Development

```bash
npm install
PORT=3000 npm start
```

## Endpoints

### GET /health

Health check endpoint.

**Response:**
```json
{ "ok": true }
```

### POST /render

Submit a video rendering job.

**Request body:**
```json
{
  "source_video_url": "https://example.com/video.mp4",
  "clips": []
}
```

**Response:**
```json
{ "ok": true, "message": "API alive" }
```

## Railway Deployment

Railway automatically sets the `PORT` environment variable. The server binds to `0.0.0.0` and uses `process.env.PORT` for compatibility.
