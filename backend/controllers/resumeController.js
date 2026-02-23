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

        console.log('--- Resume Text Extracted ---');
        console.log(`Text length: ${text.length} characters`);
        console.log('Preview:', text.substring(0, 500).replace(/\n/g, ' '));
        console.log('-----------------------------');

        // Basic extraction logic (regex-based)
        // ... (email extraction) ...
        const emailRegex = /\b[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Z|a-z]{2,}\b/;
        const emailMatch = text.match(emailRegex);
        const email = emailMatch ? emailMatch[0] : '';

        // Extract Skills (Expanded list with improved matching)
        const predefinedSkills = [
            // Programming Languages
            'Python', 'JavaScript', 'Java', 'C++', 'C', 'C#', 'Go', 'Rust', 'Swift', 'Kotlin', 'PHP', 'Ruby', 'TypeScript', 'Scala', 'R', 'Matlab', 'Dart', 'Lua', 'Perl', 'Haskell', 'Julia', 'VBA', 'Objective-C', 'Assembly',
            'SQL', 'NoSQL', 'R', 'HTML', 'CSS', 'Sass', 'Less',

            // Frameworks & Libraries
            'React', 'Angular', 'Vue.js', 'Node.js', 'Express.js', 'Next.js', 'NestJS', 'Django', 'Flask', 'FastAPI', 'Spring Boot', 'ASP.NET', 'Laravel', 'Rails', 'Svelte', 'jQuery', 'Bootstrap', 'Tailwind CSS', 'Material UI', 'MUI', 'Redux', 'Zustand', 'Axios',

            // Cloud & DevOps
            'AWS', 'Azure', 'GCP', 'Google Cloud', 'Docker', 'Kubernetes', 'Jenkins', 'Git', 'GitHub', 'GitLab', 'CI/CD', 'Terraform', 'Ansible', 'Linux', 'Unix', 'Bash', 'Shell Scripting', 'Nginx', 'Apache', 'Heroku', 'Vercel', 'Netlify', 'CircleCI', 'Prometheus', 'Grafana',

            // Data Science & ML
            'Machine Learning', 'Deep Learning', 'Artificial Intelligence', 'AI', 'NLP', 'Computer Vision', 'Generative AI', 'LLMs', 'TensorFlow', 'PyTorch', 'Keras', 'Scikit-learn', 'Pandas', 'NumPy', 'Matplotlib', 'Seaborn', 'OpenCV', 'Spark', 'Hadoop', 'Tableau', 'Power BI',

            // Databases
            'MySQL', 'PostgreSQL', 'MongoDB', 'Redis', 'Cassandra', 'Oracle', 'SQL Server', 'Firebase', 'DynamoDB', 'Elasticsearch', 'MariaDB', 'SQLite', 'Prisma', 'Sequelize', 'Mongoose',

            // Mobile
            'Flutter', 'React Native', 'Android', 'iOS', 'Ionic', 'Xamarin', 'Kotlin Multiplatform',

            // Tools & Concepts
            'Agile', 'Scrum', 'Jira', 'Trello', 'Postman', 'Swagger', 'Unit Testing', 'Jest', 'Cypress', 'Microservices', 'System Design', 'Design Patterns', 'Algorithms', 'Data Structures', 'REST API', 'GraphQL', 'WebSockets'
        ];

        console.log(`Checking for ${predefinedSkills.length} predefined skills...`);

        const extractedSkills = predefinedSkills.filter(skill => {
            // Escape special characters for regex
            const escapedSkill = skill.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');

            // Improved boundary check: 
            // - Preceded by start of string or something not a word char, +, or #
            // - Followed by end of string or something not a word char, +, or #
            const pattern = `(?:^|[^a-zA-Z0-9+#])${escapedSkill}(?![a-zA-Z0-9+#])`;

            const regex = new RegExp(pattern, 'i');
            return regex.test(text);
        });

        console.log(`Extracted ${extractedSkills.length} skills:`, extractedSkills);

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
