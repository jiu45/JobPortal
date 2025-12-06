// utils/fileHelpers.js
import { BASE_URL } from "./apiPaths";

export const buildFileUrl = (url) => {
  if (!url) return "";
  if (url.startsWith("http")) return url;
  return `${BASE_URL}${url}`;
};
