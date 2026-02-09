const pdf = require('pdf-parse');
const fs = require('fs');

exports.parseResume = async (req, res) => {
    try {
        if (!req.file) {
            return res.status(400).json({ success: false, message: 'No file uploaded' });
        }

        const dataBuffer = fs.readFileSync(req.file.path);
        const data = await pdf(dataBuffer);
        const text = data.text;

        // Basic extraction logic (regex-based)
        // This is a simplified example. In a real app, use NLP or OpenAI.

        // Extract Email
        const emailRegex = /\b[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Z|a-z]{2,}\b/;
        const emailMatch = text.match(emailRegex);
        const email = emailMatch ? emailMatch[0] : '';

        // Extract Skills (Simple keyword matching from our predefined list)
        const predefinedSkills = [
            'Python', 'JavaScript', 'Java', 'C++', 'SQL', 'Git',
            'Docker', 'Kubernetes', 'AWS', 'Azure', 'GCP',
            'React', 'Angular', 'Vue.js', 'Node.js', 'Django', 'Flask',
            'Machine Learning', 'Deep Learning', 'Data Analysis', 'Statistics',
            'TensorFlow', 'PyTorch', 'Scikit-learn',
            'PostgreSQL', 'MongoDB', 'Redis', 'Elasticsearch',
            'CI/CD', 'DevOps', 'Linux', 'Networking',
            'Agile', 'Scrum', 'Project Management',
            'Communication', 'Problem Solving', 'Teamwork', 'Leadership','aws','AI/Ml'
        ];

        const extractedSkills = predefinedSkills.filter(skill =>
            new RegExp(`\\b${skill}\\b`, 'i').test(text)
        );

        // Cleanup: Delete the uploaded file after processing
        fs.unlinkSync(req.file.path);

        res.json({
            success: true,
            data: {
                email,
                skills: extractedSkills,
                rawText: text.substring(0, 1000) + '...' // Preview
            }
        });

    } catch (error) {
        console.error('Resume parsing error details:', error);
        // Fallback: If parsing fails, still return success but with empty data to avoid UI blocking
        res.status(200).json({
            success: true,
            data: {
                email: '',
                skills: [],
                rawText: 'Could not parse text from PDF. Please enter details manually.',
                warning: 'Resume parsing failed, but file was uploaded.'
            }
        });
    }
};
