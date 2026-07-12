import React, { useState, useEffect } from "react";
import { jobAPI, eligibilityAPI, applicationAPI } from "../../api/placement.api.js";
import { deduplicateByEmail } from "../../utils/deduplication.js";
import toast from "react-hot-toast";
import { FiCheck, FiX, FiDownload, FiBriefcase, FiPlayCircle, FiAlertCircle } from "react-icons/fi";

const EligibilityCheck = () => {
  const [jobs, setJobs] = useState([]);
  const [selectedJob, setSelectedJob] = useState(null);
  const [eligibilityResults, setEligibilityResults] = useState([]);
  const [loading, setLoading] = useState(false);
  const [checking, setChecking] = useState(false);

  useEffect(() => {
    fetchJobs();
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

  const handleJobSelect = async (job) => {
    setSelectedJob(job);
    try {
      setLoading(true);
      const response = await eligibilityAPI.getJobResults(job._id);
      const deduped = deduplicateByEmail(response.data.results || []);
      setEligibilityResults(deduped);
    } catch (error) {
      setEligibilityResults([]);
    } finally {
      setLoading(false);
    }
  };

  const handleCheckAllEligibilities = async () => {
    if (!selectedJob) {
      toast.error("Please select a job first");
      return;
    }

    try {
      setChecking(true);
      const response = await eligibilityAPI.checkAll(selectedJob._id);
      toast.success(`Checked eligibility for ${response.data.totalChecked} students`);
      handleJobSelect(selectedJob);
    } catch (error) {
      toast.error(error.response?.data?.message || "Failed to check eligibility");
    } finally {
      setChecking(false);
    }
  };

  const handleDownloadList = () => {
    if (!eligibilityResults.length) {
      toast.error("No results to download");
      return;
    }

    const uniqueResults = deduplicateByEmail(eligibilityResults);
    const csvContent = [
      ["Student Name", "Email", "Status", "Eligible", "Reasons"].join(","),
      ...uniqueResults.map((result) =>
        [
          result.student.name,
          result.student.email,
          "Applied",
          result.isEligible ? "Yes" : "No",
          `"${result.failureReasons.join("; ")}"`,
        ].join(",")
      ),
    ].join("\n");

    const blob = new Blob([csvContent], { type: "text/csv" });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `eligibility-${selectedJob.jobRole}-${Date.now()}.csv`;
    a.click();
  };

  const eligibleCount = eligibilityResults.filter(r => r.isEligible).length;
  const ineligibleCount = eligibilityResults.length - eligibleCount;

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 p-6">
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center gap-3 mb-2">
            <FiBriefcase className="text-3xl text-blue-600" />
            <h1 className="text-4xl font-bold text-gray-900">Eligibility Check</h1>
          </div>
          <p className="text-gray-600">Verify candidate eligibility for positions</p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
          {/* Jobs Sidebar */}
          <div className="lg:col-span-1">
            <div className="bg-white rounded-xl shadow-md p-5 sticky top-6">
              <h2 className="text-lg font-bold text-gray-900 mb-4 flex items-center gap-2">
                <FiBriefcase className="text-blue-600" />
                Active Jobs
              </h2>
              {loading && !selectedJob ? (
                <div className="text-center py-8 text-gray-500">
                  <div className="animate-spin text-2xl mb-2">⏳</div>
                  Loading...
                </div>
              ) : jobs.length > 0 ? (
                <div className="space-y-2 max-h-96 overflow-y-auto">
                  {jobs.map((job) => (
                    <button
                      key={job._id}
                      onClick={() => handleJobSelect(job)}
                      className={`w-full text-left p-4 rounded-lg border-2 transition-all duration-200 ${
                        selectedJob?._id === job._id
                          ? "border-blue-600 bg-blue-50 shadow-md"
                          : "border-gray-200 hover:border-blue-400 hover:bg-gray-50"
                      }`}
                    >
                      <p className="font-bold text-sm text-gray-900">{job.jobRole}</p>
                      <p className="text-xs text-gray-500 mt-1">{job.company.name}</p>
                      <p className="text-xs text-gray-400 mt-0.5">₹{job.stipend}/month</p>
                    </button>
                  ))}
                </div>
              ) : (
                <p className="text-gray-500 text-sm">No active jobs</p>
              )}
            </div>
          </div>

          {/* Results */}
          <div className="lg:col-span-3">
            {selectedJob ? (
              <div className="bg-white rounded-xl shadow-md overflow-hidden">
                {/* Header */}
                <div className="bg-gradient-to-r from-blue-50 to-indigo-50 p-6 border-b border-blue-200">
                  <h2 className="text-2xl font-bold text-gray-900">{selectedJob.jobRole}</h2>
                  <p className="text-gray-600 mt-1">{selectedJob.company.name}</p>
                </div>

                {/* Stats */}
                {eligibilityResults.length > 0 && (
                  <div className="grid grid-cols-3 gap-4 p-6 bg-gray-50 border-b">
                    <div className="bg-white rounded-lg p-4 text-center">
                      <p className="text-3xl font-bold text-gray-900">{eligibilityResults.length}</p>
                      <p className="text-sm text-gray-600 mt-1">Total Checked</p>
                    </div>
                    <div className="bg-white rounded-lg p-4 text-center border-l-4 border-green-500">
                      <p className="text-3xl font-bold text-green-600">{eligibleCount}</p>
                      <p className="text-sm text-gray-600 mt-1">Eligible</p>
                    </div>
                    <div className="bg-white rounded-lg p-4 text-center border-l-4 border-red-500">
                      <p className="text-3xl font-bold text-red-600">{ineligibleCount}</p>
                      <p className="text-sm text-gray-600 mt-1">Ineligible</p>
                    </div>
                  </div>
                )}

                {/* Actions */}
                <div className="p-6 border-b bg-gray-50 flex gap-3 flex-wrap">
                  <button
                    onClick={handleCheckAllEligibilities}
                    disabled={checking}
                    className="flex items-center gap-2 bg-gradient-to-r from-blue-600 to-indigo-600 text-white px-6 py-3 rounded-lg font-semibold hover:from-blue-700 hover:to-indigo-700 disabled:opacity-50 disabled:cursor-not-allowed transition-all"
                  >
                    <FiPlayCircle className="text-lg" />
                    {checking ? "Checking..." : "Check All Eligibilities"}
                  </button>
                  {eligibilityResults.length > 0 && (
                    <button
                      onClick={handleDownloadList}
                      className="flex items-center gap-2 bg-green-600 text-white px-6 py-3 rounded-lg font-semibold hover:bg-green-700 transition"
                    >
                      <FiDownload className="text-lg" />
                      Download CSV
                    </button>
                  )}
                </div>

                {/* Results */}
                {loading && eligibilityResults.length === 0 ? (
                  <div className="text-center py-12 text-gray-500">
                    <div className="animate-spin text-3xl mb-3">⏳</div>
                    Loading results...
                  </div>
                ) : eligibilityResults.length === 0 ? (
                  <div className="text-center py-12">
                    <FiBriefcase className="text-5xl text-gray-300 mx-auto mb-4" />
                    <p className="text-gray-600 font-semibold">No eligibility checks yet</p>
                    <p className="text-gray-500 text-sm mt-1">Click "Check All Eligibilities" to start</p>
                  </div>
                ) : (
                  <div className="divide-y">
                    {eligibilityResults.map((result) => (
                      <div
                        key={result._id}
                        className="p-4 hover:bg-gray-50 transition-colors border-l-4"
                        style={{
                          borderLeftColor: result.isEligible ? '#10b981' : '#ef4444'
                        }}
                      >
                        <div className="flex items-start justify-between gap-4">
                          <div className="flex-1 min-w-0">
                            <p className="font-bold text-gray-900 truncate">{result.student.name}</p>
                            <p className="text-sm text-gray-600 truncate mt-0.5">
                              {result.student.email}
                            </p>
                          </div>
                          <div className={`flex items-center gap-2 px-4 py-2 rounded-lg font-semibold whitespace-nowrap ${
                            result.isEligible
                              ? "bg-green-100 text-green-800"
                              : "bg-red-100 text-red-800"
                          }`}>
                            {result.isEligible ? (
                              <>
                                <FiCheck className="text-lg" />
                                Eligible
                              </>
                            ) : (
                              <>
                                <FiX className="text-lg" />
                                Ineligible
                              </>
                            )}
                          </div>
                        </div>
                        {result.failureReasons.length > 0 && (
                          <div className="mt-3 bg-red-50 border border-red-200 rounded-lg p-3">
                            <div className="flex items-start gap-2">
                              <FiAlertCircle className="text-red-600 mt-0.5 flex-shrink-0" />
                              <div className="text-sm text-red-800">
                                <p className="font-semibold mb-1">Failure reasons:</p>
                                <ul className="space-y-0.5">
                                  {result.failureReasons.map((reason, idx) => (
                                    <li key={idx}>• {reason}</li>
                                  ))}
                                </ul>
                              </div>
                            </div>
                          </div>
                        )}
                      </div>
                    ))}
                  </div>
                )}
              </div>
            ) : (
              <div className="bg-white rounded-xl shadow-md p-12 text-center flex flex-col items-center justify-center min-h-96">
                <FiBriefcase className="text-6xl text-gray-300 mb-4" />
                <p className="text-gray-600 text-lg font-semibold">Select a job to view eligibility results</p>
                <p className="text-gray-500 text-sm mt-2">Choose from the jobs list on the left</p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default EligibilityCheck;
