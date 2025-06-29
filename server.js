const express = require('express');
const app = express();
const path = require('path');
app.use(express.static(path.join(__dirname, 'public')));
app.use('/videos', express.static('videos'));
app.listen(3000, () => console.log('Static server running on port 3000'));