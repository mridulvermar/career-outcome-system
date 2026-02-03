const mongoose = require('mongoose');

const analysisSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  
  // Input Data
  inputData: {
    degree: {
      type: String,
      required: true
    },
    skills: [{
      type: String,
      required: true
    }],
    experience: {
      type: Number,
      required: true,
      min: 0
    },
    interests: [{
      type: String
    }],
    education: {
      type: String
    },
    certifications: [{
      type: String
    }]
  },
  
  // Prediction Results
  prediction: {
    careerRole: {
      type: String,
      required: true
    },
    probability: {
      type: Number,
      required: true,
      min: 0,
      max: 1
    },
    confidence: {
      type: String,
      enum: ['Low', 'Medium', 'High'],
      required: true
    },
    salaryRange: {
      min: Number,
      max: Number,
      average: Number,
      currency: {
        type: String,
        default: 'USD'
      }
    },
    alternativeCareers: [{
      role: String,
      probability: Number,
      matchScore: Number
    }]
  },
  
  // Skill Gap Analysis
  skillGap: {
    matchingSkills: [{
      type: String
    }],
    missingSkills: [{
      skill: String,
      importance: {
        type: String,
        enum: ['Critical', 'Important', 'Nice-to-have']
      },
      impactOnSuccess: Number
    }],
    recommendedSkills: [{
      skill: String,
      reason: String,
      priority: Number
    }],
    overallMatch: {
      type: Number,
      min: 0,
      max: 100
    }
  },
  
  // Additional Insights
  insights: {
    marketDemand: {
      type: String,
      enum: ['Low', 'Medium', 'High', 'Very High']
    },
    growthPotential: {
      type: String,
      enum: ['Low', 'Medium', 'High']
    },
    recommendations: [String],
    industryTrends: [String]
  },
  
  // Metadata
  createdAt: {
    type: Date,
    default: Date.now
  },
  updatedAt: {
    type: Date,
    default: Date.now
  }
});

// Index for faster queries
analysisSchema.index({ userId: 1, createdAt: -1 });

module.exports = mongoose.model('Analysis', analysisSchema);
