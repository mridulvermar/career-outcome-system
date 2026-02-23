
const predefinedSkills = [
    // Programming Languages
    'Python', 'JavaScript', 'Java', 'C++', 'C', 'C#', 'Go', 'Rust', 'Swift', 'Kotlin', 'PHP', 'Ruby', 'TypeScript', 'Scala', 'R', 'Matlab', 'Dart', 'Lua', 'Perl', 'Haskell', 'Julia', 'VBA', 'Objective-C', 'Assembly',

    // Web Development (Frontend/Backend/Fullstack)
    'HTML', 'CSS', 'React', 'Angular', 'Vue.js', 'Node.js', 'Express.js', 'Next.js', 'NestJS', 'Django', 'Flask', 'FastAPI', 'Spring Boot', 'ASP.NET', 'Laravel', 'Rails', 'Svelte', 'jQuery', 'Bootstrap', 'Tailwind CSS', 'Material UI', 'GraphQL', 'REST API', 'WebSockets',

    // Data Science & AI/ML
    'Machine Learning', 'Deep Learning', 'Artificial Intelligence', 'Data Science', 'Data Analysis', 'Statistics', 'TensorFlow', 'PyTorch', 'Keras', 'Scikit-learn', 'Pandas', 'NumPy', 'Matplotlib', 'Seaborn', 'OpenCV', 'NLP', 'Computer Vision', 'Generative AI', 'LLMs', 'Hugging Face', 'Data Mining', 'Big Data', 'Hadoop', 'Spark',

    // Database
    'SQL', 'MySQL', 'PostgreSQL', 'MongoDB', 'NoSQL', 'Redis', 'Cassandra', 'Oracle', 'SQL Server', 'Firebase', 'DynamoDB', 'Elasticsearch', 'MariaDB', 'SQLite',

    // DevOps & Cloud
    'AWS', 'Azure', 'GCP', 'Google Cloud', 'Docker', 'Kubernetes', 'Jenkins', 'Git', 'GitHub', 'GitLab', 'Bitbucket', 'CI/CD', 'Terraform', 'Ansible', 'Linux', 'Unix', 'Bash', 'Shell Scripting', 'Nginx', 'Apache', 'Heroku', 'Vercel', 'Netlify',

    // Mobile Development
    'Flutter', 'React Native', 'Android', 'iOS', 'Ionic', 'Xamarin',

    // Other Tools & Concepts
    'Agile', 'Scrum', 'Jira', 'Trello', 'Slack', 'Postman', 'Swagger', 'Unit Testing', 'Jest', 'Mocha', 'Selenium', 'Cypress', 'Microservices', 'System Design', 'Design Patterns', 'Algorithms', 'Data Structures', 'Problem Solving', 'Teamwork', 'Communication'
];

const text = `
John Doe
Software Engineer
Email: john@example.com

Summary:
Experienced Full Stack Developer with 5 years of experience in building scalable web applications.
Proficient in Python, JavaScript, and Java.
Strong background in Web Development using React, Node.js, and Express.js.
Experience with Database management using PostgreSQL and MongoDB.
Familiar with Cloud technologies like AWS and Docker.
Also know C++ and C# from university days.
Good at Machine Learning and Deep Learning concepts.
`;

const escapeRegExp = (string) => {
    return string.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
};

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

console.log('Extracted Skills:', extractedSkills);

const expectedSkills = [
    'Python', 'JavaScript', 'Java', 'C++', 'C#',
    'React', 'Node.js', 'Express.js',
    'Machine Learning', 'Deep Learning',
    'PostgreSQL', 'MongoDB',
    'AWS', 'Docker'
];

// Check if all expected skills are present
const missing = expectedSkills.filter(skill => !extractedSkills.includes(skill));
if (missing.length > 0) {
    console.error('Missing skills:', missing);
} else {
    console.log('All expected skills found!');
}
