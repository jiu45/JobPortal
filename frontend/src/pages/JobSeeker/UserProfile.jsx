import { File, FileImage, FileText, Save, Trash2, X } from "lucide-react";
import { useEffect, useMemo, useState } from "react";
import toast from "react-hot-toast";
import { Link } from "react-router-dom";
import Navbar from "../../components/layout/Navbar";
import { useAuth } from "../../context/AuthContext";
import { API_PATHS } from "../../utils/apiPaths";
import axiosInstance from "../../utils/axiosInstance";
import uploadImage from "../../utils/uploadImage";

// ===== Helpers =====
const getFileNameFromUrl = (url = "") => {
  try {
    const clean = url.split("?")[0];
    return decodeURIComponent(clean.substring(clean.lastIndexOf("/") + 1));
  } catch {
    return url;
  }
};

// remove "1700000000000-" prefix
const prettifyName = (name = "") => name.replace(/^\d+-/, "");

const getFileExt = (name = "") => name.split(".").pop()?.toLowerCase() || "";

const getFileIcon = (ext) => {
  if (["png", "jpg", "jpeg", "gif", "webp"].includes(ext)) return FileImage;
  if (["pdf", "doc", "docx", "txt", "rtf"].includes(ext)) return FileText;
  return File;
};

const UserProfile = () => {
  const { user, updateUser } = useAuth();

  const [profileData, setProfileData] = useState({
    name: user?.name || "",
    email: user?.email || "",
    avatar: user?.avatar || "",
    resume: user?.resume || "",
  });

  const [formData, setFormData] = useState({ ...profileData });

  // FIX: dùng avatar + resume, không có logo
  const [uploading, setUploading] = useState({ avatar: false, resume: false });
  const [saving, setSaving] = useState(false);

  const handleInputChange = (field, value) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
  };

  // Upload dùng chung cho avatar/resume (tùy util uploadImage trả về key gì)
  const handleUpload = async (file, type) => {
    setUploading((prev) => ({ ...prev, [type]: true }));
    try {
      const uploadRes = await uploadImage(file);

      // hỗ trợ nhiều kiểu response
      const uploadedUrl =
        uploadRes?.imageUrl || uploadRes?.fileUrl || uploadRes?.url || "";

      if (!uploadedUrl) throw new Error("Upload response missing URL");

      handleInputChange(type, uploadedUrl);

      toast.success(
        type === "avatar"
          ? "Avatar uploaded successfully."
          : "Resume uploaded successfully."
      );
    } catch (error) {
      console.error("Upload failed:", error);
      toast.error("Failed to upload. Please try again.");
    } finally {
      setUploading((prev) => ({ ...prev, [type]: false }));
    }
  };

  const handleFileChange = async (e, type) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // Preview chỉ cho avatar
    if (type === "avatar") {
      const previewUrl = URL.createObjectURL(file);
      handleInputChange("avatar", previewUrl);
    }

    await handleUpload(file, type);

    // reset để chọn lại cùng file vẫn trigger
    e.target.value = "";
  };

  const handleSaveChanges = async () => {
    setSaving(true);
    try {
      const response = await axiosInstance.put(
        API_PATHS.AUTH.UPDATE_PROFILE,
        formData
      );

      if (response.status === 200) {
        toast.success("Profile updated successfully.");
        setProfileData({ ...formData });
        updateUser({ ...formData });
      }
    } catch (error) {
      console.error("Error updating profile:", error);
      toast.error("Failed to update profile. Please try again.");
    } finally {
      setSaving(false);
    }
  };

  const handleCancel = () => {
    setFormData({ ...profileData });
  };

  const DeleteResume = async () => {
    const currentResumeUrl = formData?.resume || user?.resume;
    if (!currentResumeUrl) {
      toast.error("No resume to delete.");
      return;
    }

    setSaving(true);
    try {
      const response = await axiosInstance.delete(API_PATHS.AUTH.DELETE_RESUME, {
        data: { resumeUrl: currentResumeUrl },
      });

      if (response.status === 200) {
        toast.success("Resume deleted successfully.");
        const updated = { ...formData, resume: "" };

        setProfileData(updated);
        setFormData(updated);
        updateUser(updated);
      }
    } catch (error) {
      console.error("Error deleting resume:", error);
      toast.error(
        error.response?.data?.message ||
          "Failed to delete resume. Please try again."
      );
    } finally {
      setSaving(false);
    }
  };

  useEffect(() => {
    const userData = {
      name: user?.name || "",
      email: user?.email || "",
      avatar: user?.avatar || "",
      resume: user?.resume || "",
    };

    setProfileData(userData);
    setFormData(userData);
  }, [user]);

  // meta để render resume đẹp
  const resumeMeta = useMemo(() => {
    const resumeUrl = formData?.resume || "";
    const rawName = getFileNameFromUrl(resumeUrl);
    const niceName = prettifyName(rawName);
    const ext = getFileExt(niceName);
    const Icon = getFileIcon(ext);
    return { resumeUrl, rawName, niceName, ext, Icon };
  }, [formData?.resume]);

  return (
    <div className="bg-gradient-to-br from-emerald-50 via-white to-teal-50">
      <Navbar />

      <div className="min-h-screen bg-gray-50 py-8 px-4 mt-16 lg:m-20">
        <div className="max-w-4xl mx-auto">
          <div className="bg-white rounded-xl shadow-lg overflow-hidden">
            {/* Header */}
            <div className="bg-gradient-to-r from-emerald-500 to-emerald-600 px-8 py-6 flex justify-between items-center">
              <h1 className="text-xl font-medium text-white">Profile</h1>
            </div>

            <div className="p-8">
              <div className="space-y-6">
                {/* Avatar */}
                <div className="flex items-center space-x-4">
                  <div className="relative">
                    <img
                      src={formData?.avatar || ""}
                      alt="Avatar"
                      className="w-20 h-20 rounded-full object-cover border-4 border-gray-200 bg-gray-100"
                    />
                    {uploading.avatar && (
                      <div className="absolute inset-0 bg-black bg-opacity-50 rounded-full flex items-center justify-center">
                        <div className="w-6 h-6 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                      </div>
                    )}
                  </div>

                  <div>
                    <label className="block">
                      <span className="sr-only">Choose avatar</span>
                      <input
                        type="file"
                        accept="image/*"
                        className="block w-full text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-emerald-50 file:text-emerald-700 hover:file:bg-emerald-100 transition-colors"
                        onChange={(e) => handleFileChange(e, "avatar")}
                      />
                    </label>
                  </div>
                </div>

                {/* Name */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Full Name
                  </label>
                  <input
                    type="text"
                    value={formData.name}
                    placeholder="Enter your full name"
                    onChange={(e) => handleInputChange("name", e.target.value)}
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-transparent transition-all"
                  />
                </div>

                {/* Email */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Email Address
                  </label>
                  <input
                    type="email"
                    value={formData.email}
                    disabled
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg bg-gray-50 text-gray-500"
                  />
                </div>

                {/* Resume */}
                {formData?.resume ? (
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Resume
                    </label>

                    <div className="flex items-center justify-between gap-3">
                      <div className="flex items-center gap-2 min-w-0">
                        <resumeMeta.Icon className="w-5 h-5 text-gray-500 shrink-0" />

                        <a
                          href={resumeMeta.resumeUrl}
                          target="_blank"
                          rel="noreferrer"
                          className="text-sm text-emerald-600 hover:underline truncate max-w-[520px]"
                          title={resumeMeta.rawName}
                        >
                          {resumeMeta.niceName}
                        </a>

                        <span className="text-[11px] px-2 py-0.5 rounded-full bg-gray-100 text-gray-600 uppercase shrink-0">
                          {resumeMeta.ext || "file"}
                        </span>
                      </div>

                      <button
                        onClick={DeleteResume}
                        type="button"
                        className="p-1 rounded hover:bg-red-50"
                        title="Remove resume"
                      >
                        <Trash2 className="w-5 h-5 text-red-500" />
                      </button>
                    </div>
                  </div>
                ) : (
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Upload Resume
                    </label>

                    <label className="block">
                      <span className="sr-only">Choose File</span>
                      <input
                        type="file"
                        // cho nhiều loại file resume
                        accept=".pdf,.doc,.docx,.txt,.rtf,.png,.jpg,.jpeg"
                        onChange={(e) => handleFileChange(e, "resume")}
                        className="block w-full text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-emerald-50 file:text-emerald-700 hover:file:bg-emerald-200 transition-colors"
                      />
                    </label>

                    {uploading.resume && (
                      <p className="mt-2 text-sm text-gray-500">
                        Uploading resume...
                      </p>
                    )}
                  </div>
                )}
              </div>

              {/* Buttons */}
              <div className="flex justify-end space-x-4 mt-8 pt-6 border-t">
                <Link
                  onClick={handleCancel}
                  to="/find-jobs"
                  className="px-6 py-3 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors flex items-center space-x-2"
                >
                  <X className="w-4 h-4" />
                  <span>Cancel</span>
                </Link>

                <button
                  onClick={handleSaveChanges}
                  className="px-6 py-3 bg-emerald-600 text-white rounded-lg hover:bg-emerald-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors flex items-center space-x-2"
                  disabled={saving || uploading.avatar || uploading.resume}
                >
                  {saving ? (
                    <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                  ) : (
                    <Save className="w-4 h-4" />
                  )}
                  <span>{saving ? "Saving..." : "Save Changes"}</span>
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default UserProfile;
