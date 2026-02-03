const Analysis = require('../models/Analysis');
const axios = require('axios');

// @desc    Create new career analysis
// @route   POST /api/analysis
// @access  Private
exports.createAnalysis = async (req, res) => {
  try {
    const { degree, skills, experience, interests, education, certifications } = req.body;

    // Validate input
    if (!degree || !skills || experience === undefined) {
      return res.status(400).json({
        success: false,
        message: 'Please provide degree, skills, and experience'
      });
    }

    // Prepare data for ML service
    const mlPayload = {
      degree,
      skills,
      experience,
      interests: interests || [],
      education: education || degree,
      certifications: certifications || []
    };

    // Call ML service for prediction
    let mlResponse;
    try {
      mlResponse = await axios.post(`${process.env.ML_SERVICE_URL}/api/predict`, mlPayload);
    } catch (mlError) {
      console.error('ML Service Error:', mlError.message);
      
      // Fallback to mock prediction if ML service is unavailable
      mlResponse = {
        data: generateMockPrediction(mlPayload)
      };
    }

    const predictionData = mlResponse.data;

    // Create analysis record
    const analysis = await Analysis.create({
      userId: req.user.id,
      inputData: {
        degree,
        skills,
        experience,
        interests: interests || [],
        education: education || degree,
        certifications: certifications || []
      },
      prediction: predictionData.prediction,
      skillGap: predictionData.skillGap,
      insights: predictionData.insights
    });

    res.status(201).json({
      success: true,
      data: analysis
    });
  } catch (error) {
    console.error('Analysis creation error:', error);
    res.status(500).json({
      success: false,
      message: 'Error creating analysis',
      error: error.message
    });
  }
};

// @desc    Get user's analysis history
// @route   GET /api/analysis
// @access  Private
exports.getAnalysisHistory = async (req, res) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;
    const skip = (page - 1) * limit;

    const analyses = await Analysis.find({ userId: req.user.id })
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit);

    const total = await Analysis.countDocuments({ userId: req.user.id });

    res.status(200).json({
      success: true,
      count: analyses.length,
      total,
      page,
      pages: Math.ceil(total / limit),
      data: analyses
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error fetching analysis history',
      error: error.message
    });
  }
};

// @desc    Get single analysis by ID
// @route   GET /api/analysis/:id
// @access  Private
exports.getAnalysisById = async (req, res) => {
  try {
    const analysis = await Analysis.findById(req.params.id);

    if (!analysis) {
      return res.status(404).json({
        success: false,
        message: 'Analysis not found'
      });
    }

    // Make sure user owns this analysis
    if (analysis.userId.toString() !== req.user.id) {
      return res.status(403).json({
        success: false,
        message: 'Not authorized to access this analysis'
      });
    }

    res.status(200).json({
      success: true,
      data: analysis
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error fetching analysis',
      error: error.message
    });
  }
};

// @desc    Compare two career paths
// @route   POST /api/analysis/compare
// @access  Private
exports.compareCareers = async (req, res) => {
  try {
    const { career1, career2 } = req.body;

    if (!career1 || !career2) {
      return res.status(400).json({
        success: false,
        message: 'Please provide two career paths to compare'
      });
    }

    // Get comparison data from ML service or use mock data
    const comparison = generateCareerComparison(career1, career2);

    res.status(200).json({
      success: true,
      data: comparison
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error comparing careers',
      error: error.message
    });
  }
};

// @desc    Delete analysis
// @route   DELETE /api/analysis/:id
// @access  Private
exports.deleteAnalysis = async (req, res) => {
  try {
    const analysis = await Analysis.findById(req.params.id);

    if (!analysis) {
      return res.status(404).json({
        success: false,
        message: 'Analysis not found'
      });
    }

    // Make sure user owns this analysis
    if (analysis.userId.toString() !== req.user.id) {
      return res.status(403).json({
        success: false,
        message: 'Not authorized to delete this analysis'
      });
    }

    await analysis.deleteOne();

    res.status(200).json({
      success: true,
      message: 'Analysis deleted successfully'
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error deleting analysis',
      error: error.message
    });
  }
};

// Helper function: Generate mock prediction (fallback)
function generateMockPrediction(input) {
  const careerRoles = {
    'Computer Science': ['Software Engineer', 'Data Scientist', 'ML Engineer', 'DevOps Engineer'],
    'Business': ['Product Manager', 'Business Analyst', 'Consultant', 'Marketing Manager'],
    'Data Science': ['Data Analyst', 'Data Engineer', 'ML Engineer', 'Research Scientist'],
    'Engineering': ['Systems Engineer', 'Quality Engineer', 'Technical Lead', 'Solutions Architect']
  };

  const primaryRole = careerRoles[input.degree]?.[0] || 'Software Engineer';
  const alternatives = careerRoles[input.degree]?.slice(1, 4) || ['Data Analyst', 'Business Analyst'];

  const requiredSkills = {
    'Software Engineer': ['JavaScript', 'Python', 'Git', 'Docker', 'SQL', 'REST APIs', 'Agile'],
    'Data Scientist': ['Python', 'Machine Learning', 'Statistics', 'SQL', 'Data Visualization', 'TensorFlow'],
    'Product Manager': ['Product Strategy', 'Agile', 'Stakeholder Management', 'Analytics', 'UX Design']
  };

  const roleSkills = requiredSkills[primaryRole] || ['JavaScript', 'Python', 'Git'];
  const matchingSkills = input.skills.filter(s => roleSkills.includes(s));
  const missingSkills = roleSkills.filter(s => !input.skills.includes(s));

  return {
    prediction: {
      careerRole: primaryRole,
      probability: 0.75 + (matchingSkills.length * 0.03),
      confidence: matchingSkills.length >= roleSkills.length * 0.6 ? 'High' : 'Medium',
      salaryRange: {
        min: 60000 + (input.experience * 5000),
        max: 100000 + (input.experience * 10000),
        average: 80000 + (input.experience * 7500),
        currency: 'USD'
      },
      alternativeCareers: alternatives.map((role, idx) => ({
        role,
        probability: 0.65 - (idx * 0.1),
        matchScore: 75 - (idx * 10)
      }))
    },
    skillGap: {
      matchingSkills,
      missingSkills: missingSkills.map((skill, idx) => ({
        skill,
        importance: idx < 3 ? 'Critical' : 'Important',
        impactOnSuccess: 15 - (idx * 2)
      })),
      recommendedSkills: missingSkills.slice(0, 5).map((skill, idx) => ({
        skill,
        reason: `Essential for ${primaryRole} role`,
        priority: 5 - idx
      })),
      overallMatch: Math.round((matchingSkills.length / roleSkills.length) * 100)
    },
    insights: {
      marketDemand: input.experience > 3 ? 'High' : 'Medium',
      growthPotential: 'High',
      recommendations: [
        `Focus on acquiring ${missingSkills.slice(0, 3).join(', ')}`,
        'Consider building a portfolio of projects',
        'Network with professionals in your target role'
      ],
      industryTrends: [
        'AI and ML integration is trending',
        'Cloud computing skills are in high demand',
        'Remote work opportunities expanding'
      ]
    }
  };
}

// Helper function: Generate career comparison
function generateCareerComparison(career1, career2) {
  return {
    comparison: {
      career1: {
        role: career1.role || 'Software Engineer',
        avgSalary: career1.avgSalary || 95000,
        growthRate: career1.growthRate || '15%',
        requiredSkills: career1.skills || ['JavaScript', 'React', 'Node.js']
      },
      career2: {
        role: career2.role || 'Data Scientist',
        avgSalary: career2.avgSalary || 110000,
        growthRate: career2.growthRate || '18%',
        requiredSkills: career2.skills || ['Python', 'Machine Learning', 'Statistics']
      },
      insights: {
        salaryDifference: Math.abs((career1.avgSalary || 95000) - (career2.avgSalary || 110000)),
        betterGrowth: (career2.growthRate || '18%') > (career1.growthRate || '15%') ? career2.role : career1.role,
        recommendation: 'Both careers show strong potential. Choose based on your interest in coding vs. data analysis.'
      }
    }
  };
}

module.exports = exports;
