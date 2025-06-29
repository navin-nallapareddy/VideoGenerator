const express = require('express');
const ffmpeg = require('fluent-ffmpeg');
const fs = require('fs');
const path = require('path');
const { v4: uuidv4 } = require('uuid');

const app = express();
app.use(express.json());
app.use(express.static('public'));
app.use('/videos', express.static('videos'));

app.post('/generate-video', (req, res) => {
  const words = req.body.words || [];
  if (!words.length) return res.status(400).send('No words provided');

  const lineDuration = 2;
  const videoDuration = words.length * lineDuration;
  const filename = `${uuidv4()}.mp4`;
  const filepath = path.join(__dirname, 'videos', filename);

  if (!fs.existsSync('./videos')) fs.mkdirSync('./videos');

  let filter = "";
  words.forEach((word, i) => {
    const start = i * lineDuration;
    filter += `drawtext=text='${word}':fontfile=/usr/share/fonts/truetype/dejavu/DejaVuSans-Bold.ttf:fontcolor=white:fontsize=96:x=(w-text_w)/2:y=(h-text_h)/2:alpha='if(lt(t,${start}),0, if(lt(t,${start+1}),(t-${start})/1, if(lt(t,${start+lineDuration-1}),1, max(0,1-(t-${start+lineDuration-1})/1))))',`;
  });
  filter = filter.slice(0, -1);

  ffmpeg()
    .input('public/bg.jpg')
    .loop(videoDuration)
    .inputFormat('image2')
    .input('public/music.mp3')
    .complexFilter(filter)
    .outputOptions('-shortest')
    .outputOptions('-preset', 'fast')
    .size('720x1280')
    .output(filepath)
    .on('end', () => {
      console.log(`✅ TikTok style video created: ${filename}`);
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
