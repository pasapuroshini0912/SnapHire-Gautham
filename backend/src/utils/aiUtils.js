import OpenAI from "openai";
import natural from "natural";

const openai = process.env.OPENAI_API_KEY 
  ? new OpenAI({
      apiKey: process.env.OPENAI_API_KEY,
    })
  : null;

// Common tech skills for matching
const TECH_SKILLS = [
  "JavaScript", "Python", "Java", "React", "Node.js", "MongoDB", "PostgreSQL",
  "AWS", "Docker", "Kubernetes", "Git", "TypeScript", "Angular", "Vue.js",
  "Express.js", "Django", "Flask", "Spring Boot", "Laravel", "PHP", "C++",
  "C#", "Go", "Rust", "Swift", "Kotlin", "Scala", "Ruby", "Elixir",
  "GraphQL", "REST API", "Microservices", "CI/CD", "Jenkins", "GitHub Actions",
  "Terraform", "Ansible", "Kafka", "Redis", "Elasticsearch", "Machine Learning",
  "Deep Learning", "TensorFlow", "PyTorch", "Scikit-learn", "Data Science",
  "SQL", "NoSQL", "Big Data", "Hadoop", "Spark", "Tableau", "Power BI"
];

// Extract skills from text using OpenAI
export const extractSkillsFromText = async (text) => {
  try {
    if (!openai) {
      console.log("OpenAI not configured, using basic skill extraction");
      // Basic skill extraction without OpenAI
      const words = text.toLowerCase().split(/\s+/);
      return words.filter(word => TECH_SKILLS.includes(word));
    }

    const response = await openai.chat.completions.create({
      model: "gpt-3.5-turbo",
      messages: [
        {
          role: "system",
          content: "Extract technical skills from the given text. Return only the skills as a JSON array of strings. Focus on programming languages, frameworks, tools, and technologies."
        },
        {
          role: "user",
          content: text
        }
      ],
      temperature: 0.3,
    });

    const skills = JSON.parse(response.choices[0].message.content);
    return skills.filter(skill => TECH_SKILLS.includes(skill));
  } catch (error) {
    console.error("Error extracting skills:", error);
    return [];
  }
};

// Extract skills from resume PDF
export const extractSkillsFromResume = async (buffer) => {
  try {
    // For now, return empty array since pdf-parse has issues
    // In production, you would implement proper PDF parsing
    console.log("PDF parsing not implemented yet");
    return [];
  } catch (error) {
    console.error("Error extracting skills from resume:", error);
    return [];
  }
};

// Calculate job-applicant match score
export const calculateMatchScore = (jobSkills, applicantSkills) => {
  if (!jobSkills || !applicantSkills || jobSkills.length === 0) {
    return 0;
  }

  const jobSkillsSet = new Set(jobSkills.map(skill => skill.toLowerCase()));
  const applicantSkillsSet = new Set(applicantSkills.map(skill => skill.toLowerCase()));
  
  const intersection = new Set([...jobSkillsSet].filter(skill => applicantSkillsSet.has(skill)));
  const union = new Set([...jobSkillsSet, ...applicantSkillsSet]);
  
  return (intersection.size / union.size) * 100;
};

// Get job recommendations based on user skills
export const getJobRecommendations = async (userSkills, jobs) => {
  if (!userSkills || userSkills.length === 0) {
    return jobs.slice(0, 10); // Return first 10 jobs if no skills
  }

  const scoredJobs = jobs.map(job => {
    const jobSkills = [...(job.requirements || []), ...(job.aiExtractedSkills || [])];
    const matchScore = calculateMatchScore(jobSkills, userSkills);
    
    return {
      ...job.toObject(),
      matchScore: Math.round(matchScore)
    };
  });

  // Sort by match score (highest first)
  return scoredJobs
    .sort((a, b) => b.matchScore - a.matchScore)
    .slice(0, 10);
};

// Get user recommendations based on job requirements
export const getUserRecommendations = async (jobSkills, users) => {
  if (!jobSkills || jobSkills.length === 0) {
    return users.slice(0, 10);
  }

  const scoredUsers = users.map(user => {
    const userSkills = [
      ...(user.profile?.skills || []),
      ...(user.profile?.aiExtractedSkills || [])
    ];
    const matchScore = calculateMatchScore(jobSkills, userSkills);
    
    return {
      ...user.toObject(),
      matchScore: Math.round(matchScore)
    };
  });

  return scoredUsers
    .sort((a, b) => b.matchScore - a.matchScore)
    .slice(0, 10);
}; 