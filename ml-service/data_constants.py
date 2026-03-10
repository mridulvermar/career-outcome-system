# Salary data (role-based) - INDIAN STANDARDS (INR)
# Values are annual packages in INR
SALARY_DATA = {
    'Software Engineer': {'min': 450000, 'max': 2400000, 'avg': 950000},
    'Data Scientist': {'min': 600000, 'max': 3000000, 'avg': 1200000},
    'ML Engineer': {'min': 700000, 'max': 3500000, 'avg': 1400000},
    'AI Engineer': {'min': 800000, 'max': 4000000, 'avg': 1600000},
    'DevOps Engineer': {'min': 500000, 'max': 2800000, 'avg': 1100000},
    'Full Stack Developer': {'min': 500000, 'max': 2800000, 'avg': 1050000},
    'Backend Engineer': {'min': 450000, 'max': 2500000, 'avg': 1000000},
    'Frontend Engineer': {'min': 400000, 'max': 2200000, 'avg': 900000},
    'Data Analyst': {'min': 350000, 'max': 1500000, 'avg': 750000},
    'Data Engineer': {'min': 600000, 'max': 2800000, 'avg': 1300000},
    'Cloud Architect': {'min': 1200000, 'max': 5000000, 'avg': 2200000},
    'Cybersecurity Analyst': {'min': 500000, 'max': 2000000, 'avg': 1000000},
    'Research Scientist': {'min': 800000, 'max': 3500000, 'avg': 1500000},
    'BI Analyst': {'min': 400000, 'max': 1600000, 'avg': 850000},
    'Product Manager': {'min': 1000000, 'max': 4500000, 'avg': 1800000},
    'Business Analyst': {'min': 450000, 'max': 1800000, 'avg': 950000},
    'Consultant': {'min': 600000, 'max': 2500000, 'avg': 1200000},
    'Marketing Manager': {'min': 500000, 'max': 2000000, 'avg': 1000000},
    'Project Manager': {'min': 800000, 'max': 3000000, 'avg': 1500000},
    'Blockchain Developer': {'min': 600000, 'max': 4000000, 'avg': 1500000}
}

# Enhanced Mapping for Rule-Based Prediction - EXPANDED with more skills per role
EXTENDED_SKILL_MAPPING = {
    'AI Engineer': ['Artificial Intelligence', 'Machine Learning', 'Deep Learning', 'TensorFlow', 'PyTorch', 'Neural Networks', 'NLP', 'Computer Vision', 'Generative AI', 'Transformers', 'Python', 'MLOps', 'Docker', 'Kubernetes', 'AWS', 'Azure', 'BERT', 'GPT', 'Model Deployment', 'Data Preprocessing', 'Feature Engineering'],
    'ML Engineer': ['Machine Learning', 'Model Training', 'Python', 'Scikit-learn', 'TensorFlow', 'PyTorch', 'Data Modeling', 'Feature Engineering', 'MLOps', 'Pandas', 'NumPy', 'AWS', 'SQL', 'Mathematics', 'Statistics', 'XGBoost', 'Random Forest', 'Regression', 'Classification', 'Model Evaluation', 'Data Preprocessing'],
    'Data Scientist': ['Data Science', 'Statistics', 'Machine Learning', 'Python', 'SQL', 'Data Visualization', 'Pandas', 'NumPy', 'R', 'Tableau', 'Power BI', 'Big Data', 'Matplotlib', 'Seaborn', 'Jupyter', 'Data Analysis', 'Predictive Modeling', 'A/B Testing', 'Hypothesis Testing', 'Data Mining', 'Statistical Analysis'],
    'Data Engineer': ['Data Engineering', 'ETL', 'SQL', 'Python', 'Spark', 'Apache Spark', 'Big Data', 'Data Warehousing', 'Data Pipeline', 'Airflow', 'Kafka', 'Hadoop', 'Database Design', 'AWS', 'Azure', 'GCP', 'PostgreSQL', 'MongoDB', 'Redis', 'Scala', 'Java', 'Snowflake', 'Databricks', 'NoSQL'],
    'Software Engineer': ['Software Engineering', 'System Design', 'Data Structures', 'Algorithms', 'Java', 'C++', 'Python', 'Object-Oriented Programming', 'Design Patterns', 'Problem Solving', 'Git', 'SQL', 'DSA', 'Testing', 'Debugging', 'Code Review', 'Agile', 'REST API', 'Microservices', 'Linux', 'Version Control'],
    'Full Stack Developer': ['Full Stack', 'React', 'Node.js', 'JavaScript', 'HTML', 'CSS', 'MongoDB', 'SQL', 'REST API', 'Express', 'Git', 'TypeScript', 'PostgreSQL', 'MySQL', 'Redux', 'Next.js', 'Vue', 'Angular', 'Responsive Design', 'Web Development', 'Frontend', 'Backend'],
    'Frontend Engineer': ['Frontend', 'React', 'JavaScript', 'HTML', 'CSS', 'UI/UX', 'Responsive Design', 'TypeScript', 'Angular', 'Vue.js', 'Redux', 'Webpack', 'SASS', 'LESS', 'Tailwind CSS', 'Bootstrap', 'jQuery', 'Web Performance', 'Accessibility', 'Cross-browser Compatibility', 'ES6'],
    'Backend Engineer': ['Backend', 'API Design', 'Java', 'Python', 'Node.js', 'SQL', 'NoSQL', 'Microservices', 'System Design', 'Database Design', 'Redis', 'Docker', 'PostgreSQL', 'MongoDB', 'REST API', 'GraphQL', 'Spring Boot', 'Django', 'Flask', 'Express', 'Kafka', 'RabbitMQ', 'Go', 'Caching'],
    'DevOps Engineer': ['DevOps', 'CI/CD', 'Docker', 'Kubernetes', 'Jenkins', 'Terraform', 'Linux', 'AWS', 'Azure', 'GCP', 'Ansible', 'Git', 'Bash', 'Python', 'Monitoring', 'Prometheus', 'Grafana', 'Infrastructure as Code', 'Shell Scripting', 'Automation', 'Cloud Computing', 'Networking'],
    'Cloud Architect': ['Cloud Architecture', 'AWS', 'Azure', 'GCP', 'System Design', 'Microservices', 'Networking', 'Security', 'Kubernetes', 'Terraform', 'Cloud Computing', 'Infrastructure as Code', 'Serverless', 'Lambda', 'EC2', 'S3', 'VPC', 'Load Balancing', 'Auto Scaling', 'Cloud Migration', 'Cost Optimization', 'DevOps', 'Docker'],
    'Cybersecurity Analyst': ['Cybersecurity', 'Network Security', 'Penetration Testing', 'Incident Response', 'Risk Analysis', 'Linux', 'Python', 'Firewalls', 'Cryptography', 'SIEM', 'Vulnerability Assessment', 'Security Auditing', 'Ethical Hacking', 'Wireshark', 'Nmap', 'Metasploit', 'Security Compliance', 'Threat Intelligence', 'InfoSec'],
    'Blockchain Developer': ['Blockchain', 'Smart Contracts', 'Solidity', 'Ethereum', 'Web3.js', 'Cryptography', 'Decentralized Applications', 'DApps', 'Web3', 'Go', 'Rust', 'Cryptocurrency', 'Bitcoin', 'Hyperledger', 'Truffle', 'Hardhat', 'NFT', 'DeFi', 'Consensus Algorithms', 'Distributed Systems'],
    'Product Manager': ['Product Management', 'Product Strategy', 'User Research', 'Roadmapping', 'Agile', 'Scrum', 'Stakeholder Management', 'Data Analysis', 'Communication', 'Leadership', 'Product Development', 'Market Research', 'User Stories', 'A/B Testing', 'Analytics', 'Product Lifecycle', 'Prioritization', 'SQL', 'Jira', 'Product Vision'],
    'Business Analyst': ['Business Analysis', 'Requirements Gathering', 'Process Modeling', 'SQL', 'Excel', 'Tableau', 'Power BI', 'Data Analysis', 'Communication', 'Stakeholder Management', 'Documentation', 'JIRA', 'Agile', 'Scrum', 'Data Visualization', 'Problem Solving', 'Reporting', 'Analytics', 'Business Process'],
    'Data Analyst': ['Data Analysis', 'SQL', 'Excel', 'Tableau', 'Power BI', 'Statistics', 'Data Visualization', 'Python', 'Reporting', 'Pandas', 'NumPy', 'Dashboard', 'Google Analytics', 'R', 'Data Mining', 'Business Intelligence', 'ETL', 'Data Cleaning', 'Analytics'],
    'Research Scientist': ['Research', 'Scientific Computing', 'Python', 'Deep Learning', 'Publications', 'Statistics', 'Machine Learning', 'Mathematics', 'TensorFlow', 'PyTorch', 'Experimentation', 'Data Analysis', 'Academic Writing', 'Peer Review', 'R', 'MATLAB', 'Algorithm Development', 'AI', 'NLP', 'Computer Vision'],
    'BI Analyst': ['Business Intelligence', 'SQL', 'Tableau', 'Power BI', 'Data Warehousing', 'Data Visualization', 'Excel', 'ETL', 'Reporting', 'Dashboard Design', 'Data Modeling', 'SSRS', 'SSIS', 'Analytics', 'Data Analysis', 'Database', 'Data Mining', 'KPI', 'Metrics'],
    'Consultant': ['Consulting', 'Strategy', 'Problem Solving', 'Communication', 'Excel', 'PowerPoint', 'Data Analysis', 'Business Analysis', 'Project Management', 'Stakeholder Management', 'Presentation Skills', 'Research', 'Critical Thinking', 'Client Management', 'Business Strategy', 'Process Improvement', 'Change Management'],
    'Marketing Manager': ['Marketing', 'Marketing Strategy', 'SEO', 'Content Marketing', 'Analytics', 'Social Media', 'Digital Marketing', 'Google Analytics', 'Campaign Management', 'Brand Management', 'Market Research', 'Email Marketing', 'PPC', 'SEM', 'Communication', 'Leadership', 'Budget Management', 'Marketing Automation', 'CRM'],
    'Project Manager': ['Project Management', 'Agile', 'Scrum', 'Risk Management', 'Stakeholder Management', 'Leadership', 'Communication', 'Planning', 'Budgeting', 'Resource Management', 'JIRA', 'MS Project', 'PMP', 'Kanban', 'Team Management', 'Problem Solving', 'Documentation', 'Reporting', 'Timeline Management']
}

# Skill Synonyms Mapping - maps variations to canonical skill names
SKILL_SYNONYMS = {
    # AI/ML Related
    'machine learning': ['ml', 'ai/ml', 'machine learning', 'artificial intelligence', 'ai'],
    'deep learning': ['dl', 'deep learning', 'neural networks', 'deep neural networks', 'dnn'],
    'natural language processing': ['nlp', 'natural language processing', 'text mining', 'language models'],
    'computer vision': ['cv', 'computer vision', 'image processing', 'image recognition'],
    'tensorflow': ['tensorflow', 'tf', 'tensor flow'],
    'pytorch': ['pytorch', 'torch', 'py torch'],
    'scikit-learn': ['sklearn', 'scikit-learn', 'scikit learn', 'sci-kit learn'],
    
    # Programming Languages
    'javascript': ['js', 'javascript', 'ecmascript', 'es6', 'es2015'],
    'typescript': ['ts', 'typescript'],
    'python': ['python', 'py', 'python3'],
    'c++': ['cpp', 'c++', 'cplusplus'],
    'c#': ['csharp', 'c#', 'c sharp'],
    
    # Web Development
    'react': ['react', 'reactjs', 'react.js'],
    'angular': ['angular', 'angularjs', 'angular.js'],
    'vue': ['vue', 'vuejs', 'vue.js'],
    'node.js': ['node', 'nodejs', 'node.js'],
    'express': ['express', 'expressjs', 'express.js'],
    'next.js': ['next', 'nextjs', 'next.js'],
    
    # Databases
    'mongodb': ['mongo', 'mongodb', 'mongo db'],
    'postgresql': ['postgres', 'postgresql', 'psql'],
    'mysql': ['mysql', 'my sql'],
    'sql': ['sql', 'structured query language', 'database'],
    'nosql': ['nosql', 'no sql', 'non-relational'],
    
    # DevOps & Cloud
    'amazon web services': ['aws', 'amazon web services', 'amazon cloud'],
    'google cloud platform': ['gcp', 'google cloud', 'google cloud platform'],
    'azure': ['azure', 'microsoft azure', 'ms azure'],
    'docker': ['docker', 'containerization', 'containers'],
    'kubernetes': ['k8s', 'kubernetes', 'kube'],
    'ci/cd': ['cicd', 'ci/cd', 'continuous integration', 'continuous deployment', 'devops pipeline'],
    'jenkins': ['jenkins', 'ci server'],
    'terraform': ['terraform', 'tf', 'infrastructure as code', 'iac'],
    
    # Data Science & Analytics
    'data analysis': ['data analysis', 'data analytics', 'analytics'],
    'data visualization': ['data viz', 'data visualization', 'visualization', 'dataviz'],
    'tableau': ['tableau', 'tableau desktop'],
    'power bi': ['powerbi', 'power bi', 'power-bi', 'ms power bi'],
    'excel': ['excel', 'ms excel', 'microsoft excel', 'spreadsheet'],
    'pandas': ['pandas', 'pd'],
    'numpy': ['numpy', 'np'],
    'spark': ['spark', 'apache spark', 'pyspark'],
    'hadoop': ['hadoop', 'apache hadoop'],
    'kafka': ['kafka', 'apache kafka'],
    'airflow': ['airflow', 'apache airflow'],
    
    # Blockchain
    'solidity': ['solidity', 'sol'],
    'ethereum': ['ethereum', 'eth'],
    'smart contracts': ['smart contracts', 'smart contract', 'blockchain contracts'],
    'web3': ['web3', 'web3.js', 'web 3'],
    
    # Methodologies & Soft Skills
    'agile': ['agile', 'agile methodology', 'agile development'],
    'scrum': ['scrum', 'scrum framework'],
    'data structures and algorithms': ['dsa', 'data structures', 'algorithms', 'data structures and algorithms'],
    'problem solving': ['problem solving', 'problem-solving', 'analytical thinking'],
    'communication': ['communication', 'verbal communication', 'written communication'],
    'leadership': ['leadership', 'team leadership', 'leading teams'],
    
    # Security
    'cybersecurity': ['cybersecurity', 'cyber security', 'infosec', 'information security'],
    'penetration testing': ['penetration testing', 'pen testing', 'pentesting', 'ethical hacking'],
    'network security': ['network security', 'network protection'],
    
    # Other Technologies
    'rest api': ['rest', 'rest api', 'restful', 'rest apis', 'api'],
    'graphql': ['graphql', 'graph ql'],
    'git': ['git', 'version control', 'source control'],
    'linux': ['linux', 'unix'],
    'bash': ['bash', 'shell scripting', 'shell'],
    'microservices': ['microservices', 'micro services', 'microservice architecture']
}

DEGREE_MAP = {
    'Computer Science': ['Software Engineer', 'Full Stack Developer', 'Backend Engineer', 'Frontend Engineer', 'DevOps Engineer', 'AI Engineer', 'ML Engineer', 'Cloud Architect', 'Cybersecurity Analyst', 'Blockchain Developer', 'Data Scientist', 'Data Engineer'],
    'Data Science': ['Data Scientist', 'Data Analyst', 'Data Engineer', 'ML Engineer', 'AI Engineer', 'BI Analyst', 'Research Scientist'],
    'Information Technology': ['Software Engineer', 'DevOps Engineer', 'Cloud Architect', 'Cybersecurity Analyst', 'Data Engineer', 'Business Analyst'],
    'Business': ['Product Manager', 'Business Analyst', 'Consultant', 'Marketing Manager', 'Project Manager'],
    'Mathematics': ['Data Scientist', 'Data Analyst', 'ML Engineer', 'Research Scientist', 'AI Engineer'],
    'Engineering': ['Software Engineer', 'ML Engineer', 'AI Engineer', 'Data Engineer', 'DevOps Engineer'],
    'Other': ['Data Analyst', 'Business Analyst', 'Project Manager']
}

MAX_SKILLS_TO_CHECK = 15
