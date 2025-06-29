const express = require('express');
const ffmpeg = require('fluent-ffmpeg');
const fs = require('fs');
const path = require('path');
const { v4: uuidv4 } = require('uuid');

const app = express();
app.use(express.json());
app.use(express.static('public')); // <== this serves index.html
app.use('/videos', express.static('videos'));

app.post('/generate-video', (req, res) => {
  const words = req.body.words || [];
  if (!words.length) return res.status(400).send('No words provided');

  const filename = `${uuidv4()}.mp4`;
  const filepath = path.join(__dirname, 'videos', filename);
  if (!fs.existsSync('./videos')) fs.mkdirSync('./videos');

  let filter = '';
  const lineDuration = 2;
  words.forEach((word, i) => {
    const start = i * lineDuration;
    filter += `[0:v]drawtext=text='${word}':fontcolor=white:fontsize=48:x=(w-text_w)/2:y=(h-text_h)/2:enable='between(t,${start},${start + lineDuration})'[v${i}];`;
  });
  filter = filter.slice(0, -1);

  const map = words.map((_, i) => `[v${i}]`).join('');
  const finalFilter = `${filter}${map}concat=n=${words.length}:v=1:a=0[out]`;

  ffmpeg()
    .input('color=c=black:s=1280x720:d=' + (words.length * lineDuration))
    .inputFormat('lavfi')
    .complexFilter(finalFilter, ['out'])
    .outputOptions('-map', '[out]')
    .outputOptions('-preset', 'fast')
    .output(filepath)
    .on('end', () => res.json({ video_url: `/videos/${filename}` }))
    .on('error', (err) => {
      console.error(err);
      res.status(500).send('Error generating video');
    })
    .run();
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
