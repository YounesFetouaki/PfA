const express = require('express');
const router = express.Router();
const { PythonShell } = require('python-shell');
const path = require('path');

// CV Quality Score
router.post('/cv-quality', async (req, res) => {
  try {
    const { resumeText } = req.body;
    
    const pyshell = new PythonShell(
      path.join(__dirname, '../python/cv_quality_scorer.py'),
      {
        args: [resumeText]
      }
    );

    let result = '';
    pyshell.on('message', (message) => {
      result += message;
    });

    pyshell.end((err) => {
      if (err) {
        return res.status(500).json({ error: err.message });
      }
      res.json({ success: true, data: JSON.parse(result) });
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Skill Analysis
router.post('/analyze-skills', async (req, res) => {
  try {
    const { resumeText } = req.body;
    
    const pyshell = new PythonShell(
      path.join(__dirname, '../python/skill_analyzer.py'),
      {
        args: [resumeText]
      }
    );

    let result = '';
    pyshell.on('message', (message) => {
      result += message;
    });

    pyshell.end((err) => {
      if (err) {
        return res.status(500).json({ error: err.message });
      }
      res.json({ success: true, data: JSON.parse(result) });
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Analyze entire dataset
router.get('/dataset-analysis', async (req, res) => {
  try {
    const pyshell = new PythonShell(
      path.join(__dirname, '../python/analyze_dataset.py')
    );

    let result = '';
    pyshell.on('message', (message) => {
      result += message;
    });

    pyshell.end((err) => {
      if (err) {
        return res.status(500).json({ error: err.message });
      }
      res.json({ success: true, data: JSON.parse(result) });
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

module.exports = router;
