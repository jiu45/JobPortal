export const BASE_URL = 'http://localhost:8000';

export const API_PATHS = {
    AUTH: {
        REGISTER: "/api/auth/register",
        LOGIN: "/api/auth/login",
        GET_PROFILE: "/api/auth/profile",
        UPDATE_PROFILE: "/api/user/profile",
        DELETE_RESUME : "/api/user/resume",
    },
    DASHBOARD: {
        OVERVIEW: "/api/analytics/overview",
    },
    JOBS: {
        GET_JOBS: "/api/jobs",
        GET_ALL_JOBS:"/api/jobs",
        GET_JOB_BY_ID: (id) => `/api/jobs/${id}`,
        POST_JOB: "/api/jobs",
        UPDATE_JOB: (id) => `/api/jobs/${id}`,
        DELETE_JOB: (id) => `/api/jobs/${id}`,
        GET_JOBS_EMPLOYER: "/api/jobs/get-jobs-employer",
        TOGGLE_CLOSE:(id) => `/api/jobs/${id}/toggle-close`,
        SAVE_JOB: (id) => `/api/saved-jobs/${id}`,
        UNSAVE_JOB: (id) => `/api/saved-jobs/${id}`,
        GET_SAVED_JOBS: '/api/saved-jobs/my',
    },
    MESSAGE: {
        SEND: "/api/messages",
        GET_CONVERSATION: (userId) => `/api/messages/conversation/${userId}`,
        GET_UNREAD_COUNT: "/api/messages/unread-count",
        MARK_READ: (userId) => `/api/messages/mark-read/${userId}`,
        GET_CONVERSATIONS: "/api/messages/conversations",
    },
    APPLICATIONS: {
        APPLY_TO_JOB: (jobId) => `/api/applications/${jobId}`,
        GET_ALL_APPLICATIONS :(id) => `/api/applications/job/${id}`,
        UPDATE_STATUS: (id) => `/api/applications/${id}/status`,
    },
    IMAGE: {
        UPLOAD_IMAGE: "/api/auth/upload-image", //Upload profile picture
    }
}