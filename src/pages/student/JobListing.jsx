import React, { useState, useEffect } from "react";
import { jobAPI, applicationAPI } from "../../api/placement.api.js";
import toast from "react-hot-toast";
import { FiBriefcase, FiDollarSign, FiMapPin } from "react-icons/fi";

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
      setJobs(response.data.jobs || []);
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
    <div className="p-6">
      <h1 className="text-3xl font-bold mb-6">Available Opportunities</h1>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Job List */}
        <div className="lg:col-span-1">
          <h2 className="text-xl font-semibold mb-4">Jobs</h2>
          {loading && !selectedJob ? (
            <div className="text-center py-8">Loading jobs...</div>
          ) : (
            <div className="space-y-2">
              {jobs.map((job) => (
                <button
                  key={job._id}
                  onClick={() => setSelectedJob(job)}
                  className={`w-full text-left p-3 rounded border-2 transition ${
                    selectedJob?._id === job._id
                      ? "border-blue-600 bg-blue-50"
                      : "border-gray-200 hover:border-gray-300"
                  }`}
                >
                  <p className="font-semibold">{job.jobRole}</p>
                  <p className="text-sm text-gray-600">{job.company.name}</p>
                  <p className="text-sm text-green-600 font-medium">
                    ₹{job.stipend}
                  </p>
                </button>
              ))}
            </div>
          )}
        </div>

        {/* Job Details */}
        <div className="lg:col-span-2">
          {selectedJob ? (
            <div className="bg-white rounded-lg shadow p-6">
              <div className="mb-6">
                <h2 className="text-2xl font-bold mb-2">
                  {selectedJob.jobRole}
                </h2>
                <p className="text-gray-600 text-lg mb-4">
                  {selectedJob.company.name}
                </p>

                <div className="flex flex-wrap gap-4 mb-6">
                  <div className="flex items-center gap-2">
                    <FiDollarSign className="text-green-600" />
                    <span>
                      <strong>Stipend:</strong> ₹{selectedJob.stipend}
                    </span>
                  </div>
                  {selectedJob.postPpoCTC && (
                    <div className="flex items-center gap-2">
                      <FiDollarSign className="text-green-600" />
                      <span>
                        <strong>PPO CTC:</strong> ₹{selectedJob.postPpoCTC}
                      </span>
                    </div>
                  )}
                </div>
              </div>

              {/* Description */}
              <div className="mb-6">
                <h3 className="text-lg font-semibold mb-2">Description</h3>
                <p className="text-gray-700">{selectedJob.jobDescription}</p>
              </div>

              {/* Responsibilities */}
              {selectedJob.responsibilities.length > 0 && (
                <div className="mb-6">
                  <h3 className="text-lg font-semibold mb-2">
                    Responsibilities
                  </h3>
                  <ul className="list-disc list-inside space-y-1">
                    {selectedJob.responsibilities.map((resp, idx) => (
                      <li key={idx} className="text-gray-700">
                        {resp}
                      </li>
                    ))}
                  </ul>
                </div>
              )}

              {/* Requirements */}
              {selectedJob.requirements.length > 0 && (
                <div className="mb-6">
                  <h3 className="text-lg font-semibold mb-2">Requirements</h3>
                  <ul className="list-disc list-inside space-y-1">
                    {selectedJob.requirements.map((req, idx) => (
                      <li key={idx} className="text-gray-700">
                        {req}
                      </li>
                    ))}
                  </ul>
                </div>
              )}

              {/* Skills */}
              <div className="mb-6">
                <h3 className="text-lg font-semibold mb-2">Required Skills</h3>
                <div className="flex flex-wrap gap-2">
                  {selectedJob.requiredSkills.map((skill, idx) => (
                    <span
                      key={idx}
                      className="bg-blue-100 text-blue-800 px-3 py-1 rounded-full text-sm"
                    >
                      {skill}
                    </span>
                  ))}
                </div>
              </div>

              {/* Soft Skills */}
              <div className="mb-6">
                <h3 className="text-lg font-semibold mb-2">Soft Skills</h3>
                <div className="flex flex-wrap gap-2">
                  {selectedJob.softSkills.map((skill, idx) => (
                    <span
                      key={idx}
                      className="bg-purple-100 text-purple-800 px-3 py-1 rounded-full text-sm"
                    >
                      {skill}
                    </span>
                  ))}
                </div>
              </div>

              {/* Eligibility Criteria */}
              {selectedJob.criteria && (
                <div className="mb-6 bg-gray-50 p-4 rounded">
                  <h3 className="text-lg font-semibold mb-3">
                    Eligibility Criteria
                  </h3>
                  <div className="grid grid-cols-2 gap-3 text-sm">
                    {selectedJob.criteria.tenthPercentage > 0 && (
                      <p>
                        <strong>10th %:</strong>{" "}
                        {selectedJob.criteria.tenthPercentage}%
                      </p>
                    )}
                    {selectedJob.criteria.twelthPercentage > 0 && (
                      <p>
                        <strong>12th %:</strong>{" "}
                        {selectedJob.criteria.twelthPercentage}%
                      </p>
                    )}
                    {selectedJob.criteria.aggregateCgpa > 0 && (
                      <p>
                        <strong>Aggregate CGPA:</strong>{" "}
                        {selectedJob.criteria.aggregateCgpa}
                      </p>
                    )}
                    {selectedJob.criteria.compositeScoreThreshold > 0 && (
                      <p>
                        <strong>Composite Score:</strong>{" "}
                        {selectedJob.criteria.compositeScoreThreshold}
                      </p>
                    )}
                  </div>
                </div>
              )}

              {/* Apply Button */}
              <button
                onClick={() => handleApply(selectedJob._id)}
                disabled={appliedJobs.includes(selectedJob._id) || loading}
                className={`w-full py-3 rounded font-semibold transition ${
                  appliedJobs.includes(selectedJob._id)
                    ? "bg-gray-300 text-gray-700 cursor-not-allowed"
                    : "bg-green-600 text-white hover:bg-green-700 disabled:bg-gray-400"
                }`}
              >
                {appliedJobs.includes(selectedJob._id)
                  ? "✓ Already Applied"
                  : "Apply Now"}
              </button>
            </div>
          ) : (
            <div className="bg-gray-50 rounded-lg p-12 text-center">
              <FiBriefcase size={48} className="mx-auto text-gray-400 mb-4" />
              <p className="text-gray-600">Select a job to view details</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default JobListing;
