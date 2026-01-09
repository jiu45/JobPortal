const Groq = require("groq-sdk");

const groq = new Groq({
    apiKey: process.env.GROQ_API_KEY,
});

/**
 * Parse resume text and extract structured data using AI
 * @param {string} resumeText - Raw text extracted from PDF
 * @returns {Promise<object>} Parsed resume data (name, skills, experience, education, bio)
 */
const parseResumeWithAI = async (resumeText) => {
    try {
        const completion = await groq.chat.completions.create({
            messages: [
                {
                    role: "system",
                    content: `You are a professional resume parser. Extract structured information from the resume text and return ONLY valid JSON.
          
          Return format:
          {
            "name": "Full Name",
            "bio": "Brief professional summary (2-3 sentences)",
            "skills": ["skill1", "skill2", ...],
            "experience": [
              {
                "title": "Job Title",
                "company": "Company Name",
                "duration": "Jan 2020 - Dec 2022",
                "description": "Brief description"
              }
            ],
            "education": [
              {
                "degree": "Degree Name",
                "institution": "School Name",
                "year": "2020",
                "field": "Field of Study"
              }
            ]
          }
          
          Rules:
          - Extract actual data from the resume
          - If information is not found, use empty string or empty array
          - Skills should be technical skills, tools, languages
          - Keep descriptions concise
          - Return ONLY the JSON object, no additional text`,
                },
                {
                    role: "user",
                    content: `Parse this resume:\n\n${resumeText}`,
                },
            ],
            model: "llama-3.3-70b-versatile",
            temperature: 0.3, // Low temperature for consistent, accurate parsing
            max_tokens: 2000,
            response_format: { type: "json_object" },
        });

        const result = JSON.parse(completion.choices[0].message.content);
        return result;
    } catch (error) {
        console.error("Error parsing resume with AI:", error);
        throw new Error("Failed to parse resume: " + error.message);
    }
};

/**
 * Generate a personalized cover letter
 * @param {object} userData - User profile data (name, skills, experience, bio)
 * @param {object} jobData - Job posting data (title, company, description, requirements)
 * @returns {Promise<string>} Generated cover letter
 */
const generateCoverLetter = async (userData, jobData) => {
    try {
        const userSkillsList = userData.skills?.join(", ") || "N/A";
        const userExperience = userData.experience?.[0] || {};

        const completion = await groq.chat.completions.create({
            messages: [
                {
                    role: "system",
                    content: `You are a professional career advisor helping job seekers write compelling cover letters.
          
          Write a personalized, professional cover letter that:
          - Is 3-4 paragraphs long
          - Highlights relevant skills and experience for the specific job
          - Shows genuine interest in the company and role
          - Uses a professional but warm tone
          - Is ready to use (include proper greeting and closing)
          - Does NOT include placeholder brackets like [Your Name] or [Date]
          
          Structure:
          1. Opening: Express interest in the specific role and company
          2. Body: Highlight 2-3 relevant skills/experiences that match the job requirements
          3. Closing: Express enthusiasm and availability for interview
          
          Keep it concise, authentic, and tailored to the job.`,
                },
                {
                    role: "user",
                    content: `Generate a cover letter for this application:

USER PROFILE:
Name: ${userData.name}
Bio: ${userData.bio || "Experienced professional"}
Skills: ${userSkillsList}
Recent Experience: ${userExperience.title || "N/A"} at ${userExperience.company || "N/A"}

JOB POSTING:
Position: ${jobData.title}
Company: ${jobData.company}
Description: ${jobData.description}
Requirements: ${jobData.requirements || jobData.description}

Write the cover letter now:`,
                },
            ],
            model: "llama-3.3-70b-versatile",
            temperature: 0.7, // Higher temperature for creative but professional writing
            max_tokens: 1500,
        });

        return completion.choices[0].message.content.trim();
    } catch (error) {
        console.error("Error generating cover letter:", error);
        throw new Error("Failed to generate cover letter: " + error.message);
    }
};

/**
 * Calculate job match score based on user skills vs job requirements
 * @param {array} userSkills - Array of user's skills
 * @param {string} jobRequirements - Job requirements text
 * @param {object} jobData - Additional job data for context
 * @returns {Promise<object>} Match score object { score: number, reason: string, matchedSkills: [], missingSkills: [] }
 */
const calculateJobMatch = async (userSkills, jobRequirements, jobData = {}) => {
    try {
        const userSkillsList = userSkills?.join(", ") || "None listed";

        const completion = await groq.chat.completions.create({
            messages: [
                {
                    role: "system",
                    content: `You are a job matching AI that analyzes how well a candidate's skills match a job posting.
          
          Analyze the match and return ONLY valid JSON in this exact format:
          {
            "score": 85,
            "reason": "Brief explanation of the match quality (2-3 sentences)",
            "matchedSkills": ["skill1", "skill2", ...],
            "missingSkills": ["skill1", "skill2", ...]
          }
          
          Scoring guidelines:
          - 90-100: Excellent match, has most/all key skills
          - 75-89: Good match, has most important skills
          - 60-74: Fair match, has some relevant skills
          - 40-59: Partial match, has few relevant skills
          - 0-39: Poor match, lacks most required skills
          
          Be realistic and helpful. Return ONLY the JSON object.`,
                },
                {
                    role: "user",
                    content: `Calculate job match score:

USER SKILLS:
${userSkillsList}

JOB REQUIREMENTS:
${jobRequirements}

JOB TITLE: ${jobData.title || "N/A"}

Analyze the match and return the JSON:`,
                },
            ],
            model: "llama-3.3-70b-versatile",
            temperature: 0.3, // Low temperature for consistent scoring
            max_tokens: 800,
            response_format: { type: "json_object" },
        });

        const result = JSON.parse(completion.choices[0].message.content);
        return result;
    } catch (error) {
        console.error("Error calculating job match:", error);
        throw new Error("Failed to calculate match score: " + error.message);
    }
};

/**
 * Calculate advanced job match with experience, location, and culture fit
 * @param {object} userData - Full user profile data
 * @param {object} jobData - Full job posting data
 * @returns {Promise<object>} Advanced match result
 */
const calculateAdvancedMatch = async (userData, jobData) => {
    try {
        // Calculate years of experience from user's experience array
        let totalYearsExperience = 0;
        if (userData.experience && userData.experience.length > 0) {
            userData.experience.forEach(exp => {
                // Try to parse duration like "Jan 2020 - Dec 2022"
                const duration = exp.duration || "";
                const match = duration.match(/(\d{4})\s*[-–]\s*(\d{4}|Present|present|now|Now)/);
                if (match) {
                    const startYear = parseInt(match[1]);
                    const endYear = match[2].toLowerCase() === "present" || match[2].toLowerCase() === "now"
                        ? new Date().getFullYear()
                        : parseInt(match[2]);
                    totalYearsExperience += (endYear - startYear);
                }
            });
        }

        const userSkillsList = userData.skills?.join(", ") || "None listed";
        const userLocation = userData.location || "Not specified";
        const jobLocation = jobData.location || "Not specified";

        const experienceInfo = userData.experience?.map(e =>
            `${e.title} at ${e.company} (${e.duration})`
        ).join("; ") || "No experience listed";

        const completion = await groq.chat.completions.create({
            messages: [
                {
                    role: "system",
                    content: `You are an advanced job matching AI that performs comprehensive candidate analysis.
          
          Analyze the candidate against the job posting and return ONLY valid JSON:
          {
            "overallScore": 85,
            "skillsScore": 80,
            "experienceScore": 90,
            "locationScore": 100,
            "cultureFitScore": 75,
            "summary": "Brief overall assessment (2-3 sentences)",
            "strengths": ["strength1", "strength2", ...],
            "gaps": ["gap1", "gap2", ...],
            "recommendations": ["suggestion1", "suggestion2", ...],
            "matchedSkills": ["skill1", "skill2", ...],
            "missingSkills": ["skill1", "skill2", ...],
            "experienceMatch": "Strong/Moderate/Weak match based on years and relevance",
            "locationCompatibility": "Remote compatible/Location match/Relocation needed/Unknown"
          }
          
          Scoring Guidelines:
          - overallScore: Weighted average (skills 40%, experience 30%, location 15%, culture 15%)
          - skillsScore: Based on skill overlap with requirements
          - experienceScore: Based on years and relevance of experience
          - locationScore: 100 if match or remote, 70 if different city, 50 if different country
          - cultureFitScore: Based on industry alignment and role progression
          
          Be thorough but realistic. Return ONLY the JSON object.`,
                },
                {
                    role: "user",
                    content: `Analyze this candidate for the job:

CANDIDATE PROFILE:
Name: ${userData.name}
Bio: ${userData.bio || "Not provided"}
Skills: ${userSkillsList}
Total Years Experience: ~${totalYearsExperience} years
Experience History: ${experienceInfo}
Location: ${userLocation}

JOB POSTING:
Title: ${jobData.title}
Company: ${jobData.company || "Not specified"}
Location: ${jobLocation}
Type: ${jobData.type || "Not specified"}
Description: ${jobData.description}
Requirements: ${jobData.requirements || jobData.description}

Perform comprehensive analysis and return the JSON:`,
                },
            ],
            model: "llama-3.3-70b-versatile",
            temperature: 0.3,
            max_tokens: 1200,
            response_format: { type: "json_object" },
        });

        const result = JSON.parse(completion.choices[0].message.content);
        result.calculatedYearsExperience = totalYearsExperience;
        return result;
    } catch (error) {
        console.error("Error calculating advanced match:", error);
        throw new Error("Failed to calculate advanced match: " + error.message);
    }
};

/**
 * Generate an interview question based on job role
 * @param {string} jobRole - The job role (e.g., "Frontend Developer")
 * @param {string} jobDescription - Optional job description for context
 * @returns {Promise<object>} Generated question with category
 */
const generateInterviewQuestion = async (jobRole, jobDescription = "") => {
    try {
        const completion = await groq.chat.completions.create({
            messages: [
                {
                    role: "system",
                    content: `You are an experienced technical interviewer. Generate ONE relevant interview question for the given job role.

Return format (JSON only):
{
  "question": "The interview question",
  "category": "technical|behavioral|situational",
  "difficulty": "easy|medium|hard",
  "expectedTopics": ["topic1", "topic2", "topic3"],
  "hints": "Brief hint about what a good answer should include"
}

Rules:
- Generate challenging but fair questions
- Focus on practical, real-world scenarios
- For technical roles, include coding concepts, system design, or problem-solving
- For non-technical roles, focus on behavioral and situational questions
- Return ONLY valid JSON`,
                },
                {
                    role: "user",
                    content: `Job Role: ${jobRole}
${jobDescription ? `Job Description: ${jobDescription}` : ""}

Generate a relevant interview question for this position.`,
                },
            ],
            model: "llama-3.3-70b-versatile",
            temperature: 0.7,
            max_tokens: 500,
            response_format: { type: "json_object" },
        });

        return JSON.parse(completion.choices[0].message.content);
    } catch (error) {
        console.error("Error generating interview question:", error);
        throw new Error("Failed to generate interview question: " + error.message);
    }
};

/**
 * Evaluate an interview answer and provide feedback
 * @param {string} question - The interview question
 * @param {string} answer - The user's answer
 * @param {string} jobRole - The job role for context
 * @returns {Promise<object>} Evaluation with score and feedback
 */
const evaluateInterviewAnswer = async (question, answer, jobRole = "") => {
    try {
        const completion = await groq.chat.completions.create({
            messages: [
                {
                    role: "system",
                    content: `You are an experienced technical interviewer evaluating a candidate's answer. Provide constructive, actionable feedback.

Return format (JSON only):
{
  "score": 7,
  "maxScore": 10,
  "overallFeedback": "Clear, constructive summary of the answer quality",
  "strengths": ["strength1", "strength2"],
  "improvements": ["area1", "area2"],
  "suggestedAnswer": "Brief example of an ideal answer",
  "keyPointsCovered": ["point1", "point2"],
  "keyPointsMissed": ["missed1", "missed2"],
  "tips": "One specific tip for improvement"
}

Rules:
- Be encouraging but honest
- Score from 1-10 (1=poor, 5=average, 10=excellent)
- Provide specific, actionable feedback
- Highlight what was done well
- Suggest improvements without being harsh
- Return ONLY valid JSON`,
                },
                {
                    role: "user",
                    content: `Job Role: ${jobRole || "General Position"}

Interview Question: ${question}

Candidate's Answer: ${answer}

Evaluate this answer and provide detailed feedback.`,
                },
            ],
            model: "llama-3.3-70b-versatile",
            temperature: 0.4,
            max_tokens: 800,
            response_format: { type: "json_object" },
        });

        return JSON.parse(completion.choices[0].message.content);
    } catch (error) {
        console.error("Error evaluating interview answer:", error);
        throw new Error("Failed to evaluate interview answer: " + error.message);
    }
};

module.exports = {
    parseResumeWithAI,
    generateCoverLetter,
    calculateJobMatch,
    calculateAdvancedMatch,
    generateInterviewQuestion,
    evaluateInterviewAnswer,
};
