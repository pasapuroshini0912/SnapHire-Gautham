import natural from 'natural';
import { Configuration, OpenAIApi } from 'openai';

const configuration = new Configuration({
    apiKey: process.env.OPENAI_API_KEY,
});
const openai = new OpenAIApi(configuration);

// TF-IDF for skill matching
const TfIdf = natural.TfIdf;

export const extractSkillsFromText = async (text) => {
    try {
        const response = await openai.createChatCompletion({
            model: "gpt-3.5-turbo",
            messages: [
                {
                    role: "system",
                    content: "You are a skilled recruiter who specializes in identifying technical and professional skills from resumes and job descriptions."
                },
                {
                    role: "user",
                    content: `Extract all professional, technical, and soft skills from the following text. Include programming languages, frameworks, tools, methodologies, and interpersonal skills. Return only a comma-separated list of skills, nothing else:\n\n${text}`
                }
            ],
            temperature: 0.3,
        });

        const skills = response.data.choices[0].message.content
            .trim()
            .split(',')
            .map(skill => skill.trim())
            .filter(skill => skill.length > 0 && skill.length < 50); // Filter out any overly long "skills"

        return skills;
    } catch (error) {
        console.error('Error extracting skills:', error);
        return [];
    }
};

export const calculateJobMatch = (jobDescription, candidateProfile) => {
    const tfidf = new TfIdf();

    // Add job description and requirements
    tfidf.addDocument(jobDescription.toLowerCase());

    // Add candidate's bio and skills
    const candidateText = `${candidateProfile.bio} ${candidateProfile.skills.join(' ')} ${candidateProfile.aiExtractedSkills.join(' ')}`.toLowerCase();
    tfidf.addDocument(candidateText);

    // Calculate similarity score
    let score = 0;
    tfidf.listTerms(0).forEach(item => {
        const jobTermWeight = item.tfidf;
        tfidf.tfidfs(item.term, (i, measure) => {
            if (i === 1) { // candidate document
                score += (jobTermWeight * measure);
            }
        });
    });

    // Normalize score to percentage
    const normalizedScore = Math.min(Math.round((score / 100) * 100), 100);
    return normalizedScore;
};

export const getJobSuggestions = (jobs, userProfile) => {
    return jobs.map(job => ({
        ...job,
        matchScore: calculateJobMatch(
            `${job.title} ${job.description} ${job.requirements.join(' ')}`,
            userProfile
        ),
    }))
    .sort((a, b) => b.matchScore - a.matchScore)
    .slice(0, 5); // Return top 5 matches
};
