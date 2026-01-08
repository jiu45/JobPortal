import axiosInstance from "./axiosInstance";
import { API_PATHS } from "./apiPaths";

/**
 * Parse resume PDF and get structured data
 * @param {File} resumeFile - PDF file
 * @returns {Promise<object>} Parsed resume data
 */
export const parseResume = async (resumeFile) => {
    const formData = new FormData();
    formData.append("resume", resumeFile);

    const response = await axiosInstance.post(
        API_PATHS.AI.PARSE_RESUME,
        formData,
        {
            headers: {
                "Content-Type": "multipart/form-data",
            },
        }
    );

    return response.data;
};

/**
 * Generate cover letter for a job application
 * @param {string} jobId - Job ID
 * @returns {Promise<string>} Generated cover letter
 */
export const generateCoverLetter = async (jobId) => {
    const response = await axiosInstance.post(
        API_PATHS.AI.GENERATE_COVER_LETTER,
        { jobId }
    );

    return response.data.coverLetter;
};

/**
 * Calculate job match score
 * @param {string} jobId - Job ID
 * @returns {Promise<object>} Match score object
 */
export const calculateMatchScore = async (jobId) => {
    const response = await axiosInstance.post(API_PATHS.AI.MATCH_SCORE, {
        jobId,
    });

    return response.data.matchScore;
};
