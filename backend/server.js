const express = require('express');
const cors = require('cors');
const fs = require('fs');
const path = require('path');
const app = express();

app.use(cors());

app.get('/api/textbooks', (req, res) => {
  try {
    const filePath = path.join(__dirname, 'textbooks.json');
    const data = fs.readFileSync(filePath, 'utf8');
    const textbooks = JSON.parse(data);
    res.json(textbooks);
  } catch (error) {
    res.status(500).json({ error: 'Could not read textbooks.json' });
  }
});

app.listen(5000, () => {
  console.log('Backend running on http://localhost:5000');
});