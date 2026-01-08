import {
  Building2,
  Clock,
  DollarSign,
  MapPin,
  Users,
} from "lucide-react";

import moment from "moment";
import { useEffect, useState } from "react";
import toast from "react-hot-toast";
import { useParams } from "react-router-dom";
import JobMatchScore from "../../components/JobMatchScore";
import Navbar from "../../components/layout/Navbar";
import StatusBadge from "../../components/StatusBadge";
import { useAuth } from "../../context/AuthContext";
import ApplicationForm from "./ApplicationForm";
import { API_PATHS } from "../../utils/apiPaths";
import axiosInstance from "../../utils/axiosInstance";

const JobDetails = () => {

  const { user } = useAuth();
  const { jobId } = useParams();
  const [jobDetails, setJobDetails] = useState(null);
  const [showApplicationForm, setShowApplicationForm] = useState(false);

  const getJobDetailsById = async () => {
    try {
      const response = await axiosInstance.get(API_PATHS.JOBS.GET_JOB_BY_ID(jobId), {
        params: { userId: user?._id || null },
      });
      setJobDetails(response.data);
    } catch (error) {
      console.error("Error fetching job details:", error);
      toast.error("Failed to fetch job details.");
    }
  };

  const applyToJob = async () => {
    try {
      if (jobId) {
        await axiosInstance.post(API_PATHS.APPLICATIONS.APPLY_TO_JOB(jobId));
        toast.success("Successfully applied to the job!");
      }
      getJobDetailsById();
    } catch (error) {
      console.error("Error applying to job:", error);
      const errorMsg = error.response?.data?.message || "Failed to apply to the job.";
      toast.error(errorMsg || "Failed to apply to the job.");
    }
  };
  useEffect(() => {
    if (jobId && user) {
      getJobDetailsById();
    }
  }, [jobId, user]);


  return (
    <div className="bg-gradient-to-br from-emerald-50 via-white to-teal-50">
      <Navbar />

      <div className="container mx-auto pt-24">
        {/* Main Content card*/}
        {jobDetails && (
          <div className="bg-white p-6 rounded-lg">
            {/* JHero Section with clean background*/}
            <div className="relative px-6 pb-8 border-b border-gray-100">
              <div className="relative z-10">
                <div className="flex items-center gap-3 mb-6">
                  {jobDetails?.company?.companyLogo ? (
                    <img
                      src={jobDetails.company.companyLogo}
                      alt="Company Logo"
                      className="h-20 w-20 object-cover rounded-2xl border-4 border-white/20 shadow-lg"
                    />
                  ) : (
                    <div className="h-20 w-20 bg-gray-50 border-2 border-gray-200 rounded-2xl flex items-center justify-center">
                      <Building2 className="h-8 w-8 text-gray-400" />
                    </div>
                  )}
                  <div className="flex-1">
                    <h1 className="text-lg lg:text-xl font-semibold mb-2 leading-tight text-gray-900">
                      {jobDetails.title}
                    </h1>

                    <div className="flex items-center space-x-4 text-gray-600">
                      <div className="flex items-center space-x-2">
                        <MapPin className="h-4 w-4" />
                        <span className="text-sm font-medium">
                          {jobDetails.location}
                        </span>
                      </div>
                    </div>
                  </div>

                  {jobDetails?.applicationStatus ? (
                    <StatusBadge status={jobDetails.applicationStatus} />
                  ) : (
                    <button
                      className="bg-gradient-to-r from-emerald-50 to-emerald-50 text-sm text-emerald-700 hover:text-white px-6 py-2.5 rounded-xl hover:from-emerald-500 hover:to-emerald-600 transition-all duration-200 font-semibold transform hover:-translate-y-0.5"
                      onClick={() => setShowApplicationForm(true)}
                    >
                      Apply Now
                    </button>
                  )}
                </div>
                {/* Tags */}
                <div className="flex flex-wrap gap-3">
                  <span className="px-4 py-2 bg-emerald-50 text-sm text-emerald-700 font-semibold rounded-full border border-emerald-200">
                    {jobDetails.category}
                  </span>
                  <span className="px-4 py-2 bg-teal-50 text-sm text-teal-700 font-semibold rounded-full border border-teal-200">
                    {jobDetails.type}
                  </span>
                  <div className="flex items-center space-x-1 px-4 py-2 bg-gray-50 text-sm text-gray-700 font-semibold rounded-full border border-gray-200">
                    <Clock className="h-4 w-4" />
                    <span>
                      {jobDetails.createdAt
                        ? moment(jobDetails.createdAt).format("Do MMM YYYY")
                        : "N/A"}
                    </span>
                  </div>
                </div>
              </div>

              {/* Job Match Score - Only show if user has skills */}
              {user && user.role === "jobseeker" && (
                <div className="px-6">
                  <JobMatchScore jobId={jobId} />
                </div>
              )}

              {/* Salary Section */}
              <div className="relative overflow-hidden bg-gradient-to-r from-emerald-50 to-teal-50 border border-emerald-100 p-6 rounded-2xl">
                <div className="absolute top-0 right-0 w-32 h-32 bg-gradient-to-br from-emerald-400/10 to-teal-400/10 rounded-full -translate-y-16 translate-x-16"></div>
                <div className="relative z-10">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-3">
                      <div className="p-3 bg-gradient-to-r from-emerald-500 to-teal-500 rounded-xl">
                        <DollarSign className="h-6 w-6 text-white" />
                      </div>
                      <div>
                        <h3 className="text-sm font-semibold text-gray-900 mb-1">
                          Compensation
                        </h3>
                        <div className="text-lg font-bold text-gray-900">
                          {jobDetails.salaryMin} - {jobDetails.salaryMax}
                          <span className="text-lg text-gray-600 font-normal ml-1">
                            per year
                          </span>
                        </div>
                      </div>
                    </div>
                    <div className="flex items-center space-x-2 text-sm text-emerald-700 bg-emerald-100 px-3 py-1 rounded-full">
                      <Users className="h-4 w-4" />
                      <span>Competitive</span>
                    </div>
                  </div>
                </div>
              </div>

              {/* Job Description */}
              <div className="space-y-4">
                <h3 className="text-2xl font-bold text-gray-900 flex items-center space-x-3">
                  <div className="w-1 h-8 bg-gradient-to-b from-emerald-500 to-teal-600 rounded-full"></div>
                  <span className="text-lg">About This Role</span>
                </h3>
                <div className="bg-gray-50 border border-gray-100 rounded-xl p-6">
                  <div className="text-sm text-gray-700 leading-relaxed whitespace-pre-wrap">
                    {jobDetails.description}
                  </div>
                </div>
              </div>
              {/* Requirements */}
              <div className="space-y-4">
                <h3 className="text-2xl font-bold text-gray-900 flex items-center space-x-3">
                  <div className="w-1 h-8 bg-gradient-to-b from-teal-500 to-pink-600 rounded-full"></div>
                  <span className="text-lg">What We're Looking For</span>
                </h3>
                <div className="bg-gradient-to-br from-teal-50 to-pink-50 border border-teal-100 rounded-xl p-6">
                  <div className="text-sm text-gray-700 leading-relaxed whitespace-pre-wrap">
                    {jobDetails.requirements}
                  </div>
                </div>
              </div>

            </div>
          </div>
        )}
      </div>

      {/* Application Form Modal */}
      {showApplicationForm && jobDetails && (
        <ApplicationForm
          job={jobDetails}
          onClose={() => setShowApplicationForm(false)}
          onSuccess={() => {
            getJobDetailsById();
            setShowApplicationForm(false);
          }}
        />
      )}
    </div>
  )
}

export default JobDetails;