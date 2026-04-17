const express = require('express');
const cors = require('cors');
const fs = require('fs');
const path = require('path');
const app = express();

app.use(cors());

const ARCHIVE_UA = 'UWB-Textbook-Website/1.0 (uwbstartupclub@gmail.com)';

// GET /api/textbooks — curated list, optional ?subject= filter
app.get('/api/textbooks', (req, res) => {
  try {
    const filePath = path.join(__dirname, 'textbooks.json');
    const textbooks = JSON.parse(fs.readFileSync(filePath, 'utf8'));
    const { subject } = req.query;
    if (subject) {
      return res.json(textbooks.filter(
        (b) => b.subject.toLowerCase() === subject.toLowerCase()
      ));
    }
    res.json(textbooks);
  } catch (error) {
    res.status(500).json({ error: 'Could not read textbooks.json' });
  }
});

// GET /api/download?ia=identifier — returns a direct PDF download URL from Internet Archive
app.get('/api/download', async (req, res) => {
  const { ia } = req.query;
  if (!ia || !ia.trim()) {
    return res.status(400).json({ error: 'Query parameter "ia" is required' });
  }

  try {
    const response = await fetch(`https://archive.org/metadata/${encodeURIComponent(ia)}`, {
      headers: { 'User-Agent': ARCHIVE_UA },
    });

    if (!response.ok) {
      return res.status(502).json({ error: 'Internet Archive request failed' });
    }

    const data = await response.json();
    const files = data.files || [];

    const pdfFile = files.find(
      (f) =>
        f.format === 'Text PDF' ||
        f.format === 'Additional Text PDF' ||
        (typeof f.name === 'string' && f.name.endsWith('.pdf'))
    );

    if (pdfFile) {
      return res.json({ downloadUrl: `https://archive.org/download/${ia}/${pdfFile.name}` });
    }

    res.json({ downloadUrl: null });
  } catch (error) {
    res.status(500).json({ error: 'Failed to reach Internet Archive' });
  }
});

app.listen(5000, () => {
  console.log('Backend running on http://localhost:5000');
});
