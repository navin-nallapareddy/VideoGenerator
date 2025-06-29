const express = require('express');
const ffmpeg = require('fluent-ffmpeg');
const fs = require('fs');
const path = require('path');
const { v4: uuidv4 } = require('uuid');

const app = express();
app.use(express.json());
app.use(express.static('public'));
app.use('/videos', express.static('videos'));

// POST endpoint to generate the video
app.post('/generate-video', (req, res) => {
  const words = req.body.words || [];
  if (!words.length) return res.status(400).send('No words provided');

  const lineDuration = 2;
  const videoDuration = words.length * lineDuration;
  const filename = `${uuidv4()}.mp4`;
  const filepath = path.join(__dirname, 'videos', filename);

  // Ensure videos directory exists
  if (!fs.existsSync('./videos')) fs.mkdirSync('./videos');

  // Build ffmpeg drawtext filter
  let filter = "";
  words.forEach((word, i) => {
    const start = i * lineDuration;
    filter += `drawtext=text='${word}':fontfile=/usr/share/fonts/truetype/dejavu/DejaVuSans-Bold.ttf:fontcolor=white:fontsize=48:x=(w-text_w)/2:y=(h-text_h)/2:enable='between(t,${start},${start + lineDuration})',`;
  });
  filter = filter.slice(0, -1); // remove trailing comma

  // Run ffmpeg
  ffmpeg()
    .input(`color=c=black:s=1280x720:d=${videoDuration}`)
    .inputFormat('lavfi')
    .complexFilter(filter)
    .outputOptions('-preset', 'fast')
    .output(filepath)
    .on('end', () => {
      console.log(`✅ Video created: ${filename}`);
      res.json({ video_url: `/videos/${filename}` });
    })
    .on('error', (err) => {
      console.error(`❌ ffmpeg error: ${err.message}`);
      res.status(500).send('Error generating video');
    })
    .run();
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => console.log(`🚀 Server running on port ${PORT}`));
