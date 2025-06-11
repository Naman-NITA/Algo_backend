const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors'); // Add CORS package
const Interview = require('./models/Interview');

const app = express();
require('dotenv').config();

// My name is naman

const mongoDB = process.env.URL_API;


// Enable CORS for all routes
app.use(cors({
  origin: 'http://localhost:3000', // Your frontend URL
  methods: ['GET', 'POST'],
  allowedHeaders: ['Content-Type']
}));

app.use(express.json());


app.post('/api/interview', async (req, res) => {
  try {
    const { company, role, position, experience, year, questions } = req.body;

    // Validate required question fields
    if (!questions || !questions.every(q => 
      q.text && q.topic && q.roundType && q.difficulty
    )) {
      return res.status(400).json({
        error: "Each question must have text, topic, roundType, and difficulty"
      });
    }

    const newEntry = new Interview({
      company,
      role,
      position,
      experience,
      year,
      questions: questions.map(q => ({
        text: q.text,
        topic: q.topic,
        roundType: q.roundType,
        difficulty: q.difficulty,
        frequency: q.frequency || 3,
        recency: q.recency || new Date()
      }))
    });

    await newEntry.save();
    res.status(201).json({ 
      message: "Interview data saved successfully", 
      data: newEntry 
    });

  } catch (err) {
    res.status(500).json({ 
      error: "Failed to save data", 
      details: err.message 
    });
  }
});


app.get('/api/interview/search', async (req, res) => {
  try {
    const { company, role, position, year, topic, difficulty } = req.query;

    // Validate required parameters
    if (!company || !role || !position || !year) {
      return res.status(400).json({
        error: "All parameters (company, role, position, year) are required."
      });
    }

    // Build base query for interviews
    const interviewQuery = {
      company: new RegExp(`^${company.trim()}$`, 'i'),
      role: new RegExp(`^${role.trim()}$`, 'i'),
      position: new RegExp(`^${position.trim()}$`, 'i'),
      year: new RegExp(`^${year.trim()}$`, 'i')
    };

    // Fetch interviews matching the base query
    const interviews = await Interview.find(interviewQuery);

    if (interviews.length === 0) {
      return res.status(404).json({ message: "No matching data found." });
    }

    // Aggregate and filter questions
    let allQuestions = [];
    for (const interview of interviews) {
      let filteredQuestions = interview.questions;
      if (topic) {
        filteredQuestions = filteredQuestions.filter(q => q.topic === topic);
      }
      if (difficulty) {
        filteredQuestions = filteredQuestions.filter(q => q.difficulty === difficulty);
      }
      allQuestions.push(...filteredQuestions);
    }

    if (allQuestions.length === 0) {
      return res.status(404).json({ message: "No questions found for the given filters." });
    }

    res.status(200).json({
      totalResults: interviews.length,
      totalQuestions: allQuestions.length,
      questions: allQuestions // Each question contains all metadata
    });

  } catch (error) {
    res.status(500).json({ error: "Internal Server Error", details: error.message });
  }
});







async function startServer() {
  try {
    await mongoose.connect(mongoDB);
    console.log('MongoDB is connected');

    app.listen(5000, () => {
      console.log("Server is running on port: 5000");
    });

  } catch (err) {
    console.error("Unable to connect to the server:", err);
  }
}

startServer();
