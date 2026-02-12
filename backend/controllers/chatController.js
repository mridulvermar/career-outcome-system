const { GoogleGenerativeAI } = require("@google/generative-ai");
const User = require("../models/User");
const Analysis = require("../models/Analysis");


const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);

exports.chatWithBot = async (req, res) => {
    try {
        const { message, analysisContext } = req.body;
        const userId = req.user.id;

        // Optional: Fetch user context but don't fail if null
        let user = null;
        try {
            user = await User.findById(userId);
        } catch (dbError) {
            console.warn('Could not fetch user details for chat:', dbError.message);
        }

        // Define default user values if user is null or missing fields
        const safeUser = {
            name: user?.name || "User",
            degree: user?.degree || "Not specified",
            skills: Array.isArray(user?.skills) ? user.skills.join(', ') : "Not specified"
        };

        const analysis = analysisContext || await Analysis.findOne({ user: userId }).sort({ createdAt: -1 });

        // Use standard gemini-1.5-flash model
        const model = genAI.getGenerativeModel({ model: "gemini-2.5-flash" });

        let prompt;

        if (analysisContext) {
            // Context-aware prompt with specific analysis data
            prompt = `
You are an AI Career Advisor helping a user understand their career analysis.

User Profile:
- Name: ${safeUser.name}
- Degree: ${safeUser.degree}
- Skills: ${safeUser.skills}
- Experience: ${analysisContext.inputData?.experience || 0} years

Career Analysis Results:
- Predicted Role: ${analysisContext.prediction?.careerRole || "Unknown"}
- Match Probability: ${(analysisContext.prediction?.probability * 100).toFixed(1)}%
- Confidence: ${analysisContext.prediction?.confidence || "Unknown"}
- Salary Range: Rs.${analysisContext.prediction?.salaryRange?.min?.toLocaleString() || 0} - Rs.${analysisContext.prediction?.salaryRange?.max?.toLocaleString() || 0}

Skill Gap Analysis:
- Overall Match: ${analysisContext.skillGap?.overallMatch || 0}%
- Matching Skills: ${Array.isArray(analysisContext.skillGap?.matchingSkills) ? analysisContext.skillGap.matchingSkills.join(', ') : 'None'}
- Missing Skills: ${Array.isArray(analysisContext.skillGap?.missingSkills) ? analysisContext.skillGap.missingSkills.map(s => s.skill).join(', ') : 'None'}

Alternative Career Paths:
${Array.isArray(analysisContext.prediction?.alternativeCareers) ? analysisContext.prediction.alternativeCareers.map(c => `- ${c.role} (${(c.probability * 100).toFixed(1)}%)`).join('\n') : 'None'}

Market Insights:
- Market Demand: ${analysisContext.insights?.marketDemand || "Unknown"}
- Growth Potential: ${analysisContext.insights?.growthPotential || "Unknown"}

User Question:
${message}

Provide a helpful, specific answer based on this analysis data. Be encouraging and actionable.
`;
        } else {
            // General prompt without specific analysis
            const analysisData = analysis ? {
                prediction: analysis.prediction,
                skillGap: analysis.skillGap,
                insights: analysis.insights
            } : null;

            prompt = `
You are an AI Career Advisor.

User Info:
Name: ${user.name}
Degree: ${user.degree}
Skills: ${user.skills.join(', ')}

Latest Career Analysis:
${analysisData ? `
- Predicted Role: ${analysisData.prediction?.careerRole}
- Match Probability: ${(analysisData.prediction?.probability * 100).toFixed(1)}%
- Overall Skill Match: ${analysisData.skillGap?.overallMatch}%
- Market Demand: ${analysisData.insights?.marketDemand}
` : "No previous analysis"}

User Question:
${message}

Give structured, helpful advice.
`;
        }

        console.log('Chatbot request received:', { userId, hasAnalysisContext: !!analysisContext, messageLength: message.length });
        console.log('Prompt length:', prompt.length);

        let text;
        try {
            console.log('Calling Gemini API...');
            const result = await model.generateContent(prompt);
            console.log('Gemini API call successful, extracting text...');
            console.log('Result object keys:', Object.keys(result));
            console.log('Response exists:', !!result.response);

            text = result.response.text();
            console.log('Text extracted successfully');
        } catch (geminiError) {
            console.error('Gemini API Error:', {
                message: geminiError.message,
                stack: geminiError.stack,
                name: geminiError.name
            });
            throw geminiError;
        }

        console.log('Extracted text:', text);
        console.log('Text length:', text ? text.length : 0);

        if (!text || text.trim().length === 0) {
            console.error('Empty response from Gemini!');
            return res.status(500).json({
                success: false,
                message: "Received empty response from AI",
                reply: "I apologize, but I couldn't generate a response. Please try again."
            });
        }

        console.log('Chatbot response generated successfully');

        res.json({ reply: text });

    } catch (error) {
        console.error('Chatbot error details:', {
            message: error.message,
            stack: error.stack,
            name: error.name,
            code: error.code
        });
        res.status(500).json({
            success: false,
            message: "Chatbot error",
            error: error.message,
            reply: "Sorry, I encountered an error. Please try again."
        });


    }
};
