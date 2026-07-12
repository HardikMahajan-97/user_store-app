import React, { useState, useEffect } from "react";
import { jobAPI, applicationAPI } from "../../api/placement.api.js";
import { deduplicateByEmail } from "../../utils/deduplication.js";
import toast from "react-hot-toast";
import { FiBriefcase, FiDollarSign, FiMapPin, FiArrowRight } from "react-icons/fi";

const JobListing = () => {
  const [jobs, setJobs] = useState([]);
  const [selectedJob, setSelectedJob] = useState(null);
  const [loading, setLoading] = useState(false);
  const [appliedJobs, setAppliedJobs] = useState([]);

  useEffect(() => {
    fetchJobs();
    fetchMyApplications();
  }, []);

  const fetchJobs = async () => {
    try {
      setLoading(true);
      const response = await jobAPI.getAll({ status: "active" });
      const deduped = deduplicateByEmail(response.data.jobs || []);
      setJobs(deduped);
    } catch (error) {
      toast.error("Failed to fetch jobs");
    } finally {
      setLoading(false);
    }
  };

  const fetchMyApplications = async () => {
    try {
      const response = await applicationAPI.getMyApplications();
      const jobIds = response.data.applications.map((app) => app.job._id);
      setAppliedJobs(jobIds);
    } catch (error) {
      console.log("Could not fetch applications");
    }
  };

  const handleApply = async (jobId) => {
    try {
      setLoading(true);
      await applicationAPI.apply(jobId);
      toast.success("Applied successfully!");
      setAppliedJobs([...appliedJobs, jobId]);
      fetchMyApplications();
    } catch (error) {
      toast.error(error.response?.data?.message || "Failed to apply");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 p-6">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center gap-3 mb-2">
            <FiBriefcase className="text-3xl text-blue-600" />
            <h1 className="text-4xl font-bold text-gray-900">Job Opportunities</h1>
          </div>
          <p className="text-gray-600">Explore and apply to open positions</p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Job List */}
          <div className="lg:col-span-1">
            <div className="bg-white rounded-xl shadow-md overflow-hidden sticky top-6">
              <div className="bg-gradient-to-r from-blue-50 to-indigo-50 p-5 border-b">
                <h2 className="text-lg font-bold text-gray-900">Available Jobs</h2>
                <p className="text-xs text-gray-600 mt-1">{jobs.length} opportunities</p>
              </div>

              {loading && !selectedJob ? (
                <div className="text-center py-12 text-gray-500">
                  <div className="animate-spin text-2xl mb-2">⏳</div>
                  Loading jobs...
                </div>
              ) : jobs.length > 0 ? (
                <div className="space-y-1 p-2 max-h-[600px] overflow-y-auto">
                  {jobs.map((job) => (
                    <button
                      key={job._id}
                      onClick={() => setSelectedJob(job)}
                      className={`w-full text-left p-4 rounded-lg border-2 transition-all duration-200 hover:shadow-md ${
                        selectedJob?._id === job._id
                          ? "border-blue-600 bg-blue-50 shadow-md"
                          : "border-gray-200 hover:border-blue-300 hover:bg-gray-50"
                      }`}
                    >
                      <p className="font-bold text-sm text-gray-900 truncate">{job.jobRole}</p>
                      <p className="text-xs text-gray-600 mt-0.5 truncate">{job.company.name}</p>
                      <div className="flex items-center gap-1 mt-1">
                        <FiDollarSign className="text-xs text-green-600" />
                        <span className="text-xs font-semibold text-green-600">₹{job.stipend}</span>
                        {appliedJobs.includes(job._id) && (
                          <span className="ml-auto text-xs bg-green-100 text-green-800 px-2 py-0.5 rounded">
                            Applied
                          </span>
                        )}
                      </div>
                    </button>
                  ))}
                </div>
              ) : (
                <div className="text-center py-12 text-gray-500">
                  <p className="text-sm">No jobs available</p>
                </div>
              )}
            </div>
          </div>

          {/* Job Details */}
          <div className="lg:col-span-2">
            {selectedJob ? (
              <div className="bg-white rounded-xl shadow-md overflow-hidden">
                {/* Header */}
                <div className="bg-gradient-to-r from-blue-600 to-indigo-600 p-8 text-white">
                  <h2 className="text-3xl font-bold mb-2">{selectedJob.jobRole}</h2>
                  <p className="text-blue-100 text-lg">{selectedJob.company.name}</p>
                </div>

                {/* Quick Stats */}
                <div className="grid grid-cols-3 gap-4 p-6 bg-gray-50 border-b">
                  <div className="text-center">
                    <p className="text-2xl font-bold text-green-600">₹{selectedJob.stipend}</p>
                    <p className="text-xs text-gray-600 mt-1">Monthly Stipend</p>
                  </div>
                  {selectedJob.postPpoCTC && (
                    <div className="text-center">
                      <p className="text-2xl font-bold text-indigo-600">₹{selectedJob.postPpoCTC}</p>
                      <p className="text-xs text-gray-600 mt-1">PPO CTC</p>
                    </div>
                  )}
                  <div className="text-center">
                    <p className="text-2xl font-bold text-blue-600">
                      {selectedJob.requirements?.length || 0}
                    </p>
                    <p className="text-xs text-gray-600 mt-1">Requirements</p>
                  </div>
                </div>

                {/* Content */}
                <div className="p-6 space-y-6 max-h-[600px] overflow-y-auto">
                  {/* Description */}
                  <div>
                    <h3 className="text-lg font-bold text-gray-900 mb-2">About the Role</h3>
                    <p className="text-gray-700 leading-relaxed">{selectedJob.jobDescription}</p>
                  </div>

                  {/* Responsibilities */}
                  {selectedJob.responsibilities.length > 0 && (
                    <div>
                      <h3 className="text-lg font-bold text-gray-900 mb-3">Responsibilities</h3>
                      <ul className="space-y-2">
                        {selectedJob.responsibilities.map((resp, idx) => (
                          <li key={idx} className="flex items-start gap-3">
                            <FiArrowRight className="text-blue-600 mt-1 flex-shrink-0" />
                            <span className="text-gray-700">{resp}</span>
                          </li>
                        ))}
                      </ul>
                    </div>
                  )}

                  {/* Requirements */}
                  {selectedJob.requirements.length > 0 && (
                    <div>
                      <h3 className="text-lg font-bold text-gray-900 mb-3">Requirements</h3>
                      <ul className="space-y-2">
                        {selectedJob.requirements.map((req, idx) => (
                          <li key={idx} className="flex items-start gap-3">
                            <FiArrowRight className="text-blue-600 mt-1 flex-shrink-0" />
                            <span className="text-gray-700">{req}</span>
                          </li>
                        ))}
                      </ul>
                    </div>
                  )}

                  {/* Technical Skills */}
                  {selectedJob.requiredSkills.length > 0 && (
                    <div>
                      <h3 className="text-lg font-bold text-gray-900 mb-3">Technical Skills</h3>
                      <div className="flex flex-wrap gap-2">
                        {selectedJob.requiredSkills.map((skill, idx) => (
                          <span
                            key={idx}
                            className="bg-blue-100 text-blue-800 px-4 py-2 rounded-full text-sm font-medium"
                          >
                            {skill}
                          </span>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* Soft Skills */}
                  {selectedJob.softSkills.length > 0 && (
                    <div>
                      <h3 className="text-lg font-bold text-gray-900 mb-3">Soft Skills</h3>
                      <div className="flex flex-wrap gap-2">
                        {selectedJob.softSkills.map((skill, idx) => (
                          <span
                            key={idx}
                            className="bg-purple-100 text-purple-800 px-4 py-2 rounded-full text-sm font-medium"
                          >
                            {skill}
                          </span>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* Eligibility Criteria */}
                  {selectedJob.criteria && (
                    <div className="bg-blue-50 border-l-4 border-blue-500 p-4 rounded">
                      <h3 className="text-lg font-bold text-gray-900 mb-3">Eligibility Criteria</h3>
                      <div className="grid grid-cols-2 gap-3 text-sm">
                        {selectedJob.criteria.tenthPercentage > 0 && (
                          <p className="text-gray-700">
                            <strong className="text-gray-900">10th %:</strong> {selectedJob.criteria.tenthPercentage}%
                          </p>
                        )}
                        {selectedJob.criteria.twelthPercentage > 0 && (
                          <p className="text-gray-700">
                            <strong className="text-gray-900">12th %:</strong> {selectedJob.criteria.twelthPercentage}%
                          </p>
                        )}
                        {selectedJob.criteria.aggregateCgpa > 0 && (
                          <p className="text-gray-700">
                            <strong className="text-gray-900">CGPA:</strong> {selectedJob.criteria.aggregateCgpa}
                          </p>
                        )}
                        {selectedJob.criteria.compositeScoreThreshold > 0 && (
                          <p className="text-gray-700">
                            <strong className="text-gray-900">Composite:</strong> {selectedJob.criteria.compositeScoreThreshold}
                          </p>
                        )}
                      </div>
                    </div>
                  )}
                </div>

                {/* Apply Button */}
                <div className="p-6 border-t bg-gray-50">
                  <button
                    onClick={() => handleApply(selectedJob._id)}
                    disabled={appliedJobs.includes(selectedJob._id) || loading}
                    className={`w-full py-4 rounded-lg font-bold text-lg transition-all duration-200 ${
                      appliedJobs.includes(selectedJob._id)
                        ? "bg-gray-300 text-gray-700 cursor-not-allowed"
                        : "bg-gradient-to-r from-green-600 to-emerald-600 text-white hover:from-green-700 hover:to-emerald-700 disabled:opacity-50"
                    }`}
                  >
                    {appliedJobs.includes(selectedJob._id)
                      ? "✓ Already Applied"
                      : "Apply Now"}
                  </button>
                </div>
              </div>
            ) : (
              <div className="bg-white rounded-xl shadow-md p-12 text-center flex flex-col items-center justify-center min-h-96">
                <FiBriefcase className="text-6xl text-gray-300 mb-4" />
                <p className="text-gray-600 text-lg font-semibold">Select a job to view details</p>
                <p className="text-gray-500 text-sm mt-2">Choose from the list on the left to explore opportunities</p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default JobListing;
