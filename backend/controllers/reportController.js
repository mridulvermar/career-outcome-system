const PDFDocument = require('pdfkit');
const Analysis = require('../models/Analysis');

// @desc    Generate PDF report for analysis
// @route   GET /api/analysis/:id/report
// @access  Private
exports.generateReport = async (req, res) => {
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

    // Create PDF document
    const doc = new PDFDocument({ margin: 50 });

    // Set response headers
    res.setHeader('Content-Type', 'application/pdf');
    res.setHeader('Content-Disposition', `attachment; filename=career-analysis-${analysis._id}.pdf`);

    // Pipe PDF to response
    doc.pipe(res);

    // Add content to PDF
    addPDFContent(doc, analysis);

    // Finalize PDF
    doc.end();
  } catch (error) {
    console.error('PDF generation error:', error);
    res.status(500).json({
      success: false,
      message: 'Error generating report',
      error: error.message
    });
  }
};

// Helper function to add content to PDF
function addPDFContent(doc, analysis) {
  // Header
  doc.fontSize(24)
     .font('Helvetica-Bold')
     .text('Career Outcome Analysis Report', { align: 'center' });
  
  doc.moveDown();
  doc.fontSize(12)
     .font('Helvetica')
     .text(`Generated on: ${new Date().toLocaleDateString()}`, { align: 'center' });
  
  doc.moveDown(2);

  // User Input Section
  doc.fontSize(16)
     .font('Helvetica-Bold')
     .text('Your Profile');
  
  doc.moveDown(0.5);
  doc.fontSize(11)
     .font('Helvetica')
     .text(`Degree: ${analysis.inputData.degree}`)
     .text(`Experience: ${analysis.inputData.experience} years`)
     .text(`Skills: ${analysis.inputData.skills.join(', ')}`)
     .text(`Interests: ${analysis.inputData.interests.join(', ') || 'Not specified'}`);
  
  doc.moveDown(1.5);

  // Career Prediction Section
  doc.fontSize(16)
     .font('Helvetica-Bold')
     .text('Career Prediction');
  
  doc.moveDown(0.5);
  
  // Add colored box for predicted role
  const roleBoxY = doc.y;
  doc.rect(50, roleBoxY, 495, 60)
     .fillAndStroke('#e3f2fd', '#2196f3');
  
  doc.fillColor('#000000')
     .fontSize(14)
     .font('Helvetica-Bold')
     .text('Predicted Role:', 60, roleBoxY + 10);
  
  doc.fontSize(18)
     .text(analysis.prediction.careerRole, 60, roleBoxY + 30);
  
  doc.moveDown(4);
  
  doc.fontSize(11)
     .font('Helvetica')
     .text(`Probability: ${(analysis.prediction.probability * 100).toFixed(1)}%`)
     .text(`Confidence Level: ${analysis.prediction.confidence}`)
     .text(`Expected Salary Range: $${analysis.prediction.salaryRange.min.toLocaleString()} - $${analysis.prediction.salaryRange.max.toLocaleString()}`)
     .text(`Average Salary: $${analysis.prediction.salaryRange.average.toLocaleString()}`);
  
  doc.moveDown(1.5);

  // Alternative Careers
  if (analysis.prediction.alternativeCareers && analysis.prediction.alternativeCareers.length > 0) {
    doc.fontSize(14)
       .font('Helvetica-Bold')
       .text('Alternative Career Paths:');
    
    doc.moveDown(0.5);
    doc.fontSize(11)
       .font('Helvetica');
    
    analysis.prediction.alternativeCareers.forEach((alt, index) => {
      doc.text(`${index + 1}. ${alt.role} - Match: ${(alt.probability * 100).toFixed(1)}%`);
    });
    
    doc.moveDown(1.5);
  }

  // Skill Gap Analysis
  doc.addPage();
  
  doc.fontSize(16)
     .font('Helvetica-Bold')
     .text('Skill Gap Analysis');
  
  doc.moveDown(0.5);
  
  doc.fontSize(11)
     .font('Helvetica')
     .text(`Overall Skill Match: ${analysis.skillGap.overallMatch}%`);
  
  doc.moveDown(1);

  // Matching Skills
  if (analysis.skillGap.matchingSkills && analysis.skillGap.matchingSkills.length > 0) {
    doc.fontSize(13)
       .font('Helvetica-Bold')
       .fillColor('#4caf50')
       .text('✓ Your Matching Skills:');
    
    doc.moveDown(0.3);
    doc.fontSize(11)
       .font('Helvetica')
       .fillColor('#000000')
       .text(analysis.skillGap.matchingSkills.join(', '));
    
    doc.moveDown(1);
  }

  // Missing Skills
  if (analysis.skillGap.missingSkills && analysis.skillGap.missingSkills.length > 0) {
    doc.fontSize(13)
       .font('Helvetica-Bold')
       .fillColor('#f44336')
       .text('✗ Skills to Acquire:');
    
    doc.moveDown(0.3);
    doc.fontSize(11)
       .font('Helvetica')
       .fillColor('#000000');
    
    analysis.skillGap.missingSkills.forEach((item) => {
      doc.text(`• ${item.skill} (${item.importance}) - Impact: +${item.impactOnSuccess}%`);
    });
    
    doc.moveDown(1);
  }

  // Recommended Skills
  if (analysis.skillGap.recommendedSkills && analysis.skillGap.recommendedSkills.length > 0) {
    doc.fontSize(13)
       .font('Helvetica-Bold')
       .fillColor('#ff9800')
       .text('Recommended Skills:');
    
    doc.moveDown(0.3);
    doc.fontSize(11)
       .font('Helvetica')
       .fillColor('#000000');
    
    analysis.skillGap.recommendedSkills.forEach((item, index) => {
      doc.text(`${index + 1}. ${item.skill} - ${item.reason}`);
    });
    
    doc.moveDown(1.5);
  }

  // Insights Section
  doc.fontSize(16)
     .font('Helvetica-Bold')
     .fillColor('#000000')
     .text('Market Insights');
  
  doc.moveDown(0.5);
  doc.fontSize(11)
     .font('Helvetica')
     .text(`Market Demand: ${analysis.insights.marketDemand}`)
     .text(`Growth Potential: ${analysis.insights.growthPotential}`);
  
  doc.moveDown(1);

  // Recommendations
  if (analysis.insights.recommendations && analysis.insights.recommendations.length > 0) {
    doc.fontSize(13)
       .font('Helvetica-Bold')
       .text('Recommendations:');
    
    doc.moveDown(0.3);
    doc.fontSize(11)
       .font('Helvetica');
    
    analysis.insights.recommendations.forEach((rec, index) => {
      doc.text(`${index + 1}. ${rec}`);
    });
    
    doc.moveDown(1);
  }

  // Industry Trends
  if (analysis.insights.industryTrends && analysis.insights.industryTrends.length > 0) {
    doc.fontSize(13)
       .font('Helvetica-Bold')
       .text('Industry Trends:');
    
    doc.moveDown(0.3);
    doc.fontSize(11)
       .font('Helvetica');
    
    analysis.insights.industryTrends.forEach((trend, index) => {
      doc.text(`• ${trend}`);
    });
  }

  // Footer
  doc.moveDown(2);
  doc.fontSize(9)
     .font('Helvetica')
     .fillColor('#666666')
     .text('This report is generated by Career Outcome Analysis System', { align: 'center' })
     .text('For educational and career planning purposes', { align: 'center' });
}

module.exports = exports;
