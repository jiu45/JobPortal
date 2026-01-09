//Validation functions
export const validateEmail = (email) => {
    if (!email.trim()) return "Email is required.";
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) return "Please enter a valid email address";
    return "";
};
export const validatePassword = (password) => {
    if (!password) return "Password is required.";
    if (password.length < 8) return "Password must be at least 8 characters";
    if (!/(?=.*[a-z])/.test(password)) return "Password must contain at least one lowercase letter";
    if (!/(?=.*[A-Z])/.test(password)) return "Password must contain at least one uppercase letter";
    if (!/(?=.*\d)/.test(password)) return "Password must contain at least one number";
    return "";
};
export const validateAvatar = (file) => {
    if (!file) return "";//Avatar is optional
    const allowedTypes = ["image/jpeg", "image/jpg", "image/png"];
    if (!allowedTypes.includes(file.type)) {
        return "Avatar must be a JPG or PNG file";
    }
    const maxSize = 5 * 1024 * 1024;//5MB
    if (file.size > maxSize) return "Avatar must be less than 5MB";
    return "";
};

export const getInitials = (name) => {
    if (!name) return "";
    const names = name.trim().split(" ");
    const initials = names.map(n => n.charAt(0).toUpperCase()).join("");
    return initials.slice(0, 2);
};

/**
 * Normalize image URLs to work in both local and Codespaces environments.
 * Converts absolute localhost URLs to relative paths.
 */
export const normalizeImageUrl = (url) => {
    if (!url) return null;

    // If URL contains localhost, extract just the path
    if (url.includes("localhost:8000/uploads/") || url.includes("127.0.0.1:8000/uploads/")) {
        return url.replace(/https?:\/\/[^/]+\/uploads\//, "/uploads/");
    }

    // If it's already a relative path or external URL, return as-is
    return url;
};