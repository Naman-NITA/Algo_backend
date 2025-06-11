const mongoose = require('mongoose');

const questionSchema = new mongoose.Schema({
  text: {
    type: String,
    required: true
  },
  topic: {
    type: String,
    required: true,
    enum: ['Arrays', 'DP', 'Graphs', 'LLD', 'System Design', 'Algorithms', 'Behavioral']
  },
  roundType: {
    type: String,
    required: true,
    enum: ['OA', 'Technical', 'Design', 'HR']
  },
  difficulty: {
    type: String,
    enum: ['Easy', 'Medium', 'Hard'],
    required: true
  },
  frequency: {
    type: Number,
    min: 1,
    max: 5,
    default: 3
  },
  recency: {
    type: Date,
    default: Date.now
  }
});

const interviewSchema = new mongoose.Schema({
  company: {
    type: String,
    required: true,
    index: true
  },
  role: {
    type: String,
    required: true
  },
  position: {
    type: String,
    enum: ['Intern', 'SDE1', 'SDE2', 'Senior', 'Lead'],
    required: true
  },
  experience: {
    type: String,
    required: true
  },
  year: {
    type: String,
    required: true
  },
  questions: [questionSchema] // Array of structured questions
});

module.exports = mongoose.model('Interview', interviewSchema);
