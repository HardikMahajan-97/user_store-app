import React, { useState, useEffect } from "react";
import { jobAPI, eligibilityAPI, applicationAPI } from "../../api/placement.api.js";
import toast from "react-hot-toast";
import { FiCheck, FiX, FiDownload } from "react-icons/fi";

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
      setEligibilityResults(response.data.results || []);
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

    const csvContent = [
      ["Student Name", "Email", "Status", "Eligible", "Reasons"].join(","),
      ...eligibilityResults.map((result) =>
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

  return (
    <div className="p-6">
      <h1 className="text-3xl font-bold mb-6">Eligibility Check</h1>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Jobs List */}
        <div className="lg:col-span-1">
          <h2 className="text-xl font-semibold mb-4">Select Job</h2>
          {loading && !selectedJob ? (
            <div className="text-center py-8">Loading jobs...</div>
          ) : (
            <div className="space-y-2">
              {jobs.map((job) => (
                <button
                  key={job._id}
                  onClick={() => handleJobSelect(job)}
                  className={`w-full text-left p-3 rounded border-2 transition ${
                    selectedJob?._id === job._id
                      ? "border-blue-600 bg-blue-50"
                      : "border-gray-200 hover:border-gray-300"
                  }`}
                >
                  <p className="font-semibold">{job.jobRole}</p>
                  <p className="text-sm text-gray-600">{job.company.name}</p>
                </button>
              ))}
            </div>
          )}
        </div>

        {/* Results */}
        <div className="lg:col-span-2">
          {selectedJob ? (
            <div className="bg-white rounded-lg shadow p-6">
              <div className="mb-6">
                <h2 className="text-2xl font-bold mb-2">{selectedJob.jobRole}</h2>
                <p className="text-gray-600">{selectedJob.company.name}</p>
              </div>

              <div className="flex gap-2 mb-6">
                <button
                  onClick={handleCheckAllEligibilities}
                  disabled={checking}
                  className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700 disabled:bg-gray-400"
                >
                  {checking ? "Checking..." : "Check All Eligibilities"}
                </button>
                {eligibilityResults.length > 0 && (
                  <button
                    onClick={handleDownloadList}
                    className="flex items-center gap-2 bg-green-600 text-white px-4 py-2 rounded hover:bg-green-700"
                  >
                    <FiDownload size={16} />
                    Download List
                  </button>
                )}
              </div>

              {loading && eligibilityResults.length === 0 ? (
                <div className="text-center py-8">Loading results...</div>
              ) : eligibilityResults.length === 0 ? (
                <div className="text-center py-8 text-gray-600">
                  No eligibility checks yet. Click "Check All Eligibilities" to start.
                </div>
              ) : (
                <div className="space-y-3">
                  {eligibilityResults.map((result) => (
                    <div key={result._id} className="border rounded p-4">
                      <div className="flex items-center justify-between">
                        <div>
                          <p className="font-semibold">{result.student.name}</p>
                          <p className="text-sm text-gray-600">
                            {result.student.email}
                          </p>
                        </div>
                        <div className={`flex items-center gap-2 px-3 py-1 rounded ${
                          result.isEligible
                            ? "bg-green-100 text-green-800"
                            : "bg-red-100 text-red-800"
                        }`}>
                          {result.isEligible ? (
                            <FiCheck size={18} />
                          ) : (
                            <FiX size={18} />
                          )}
                          <span className="font-semibold">
                            {result.isEligible ? "Eligible" : "Ineligible"}
                          </span>
                        </div>
                      </div>
                      {result.failureReasons.length > 0 && (
                        <div className="mt-3 text-sm text-red-700 bg-red-50 p-2 rounded">
                          <p className="font-semibold mb-1">Failure reasons:</p>
                          {result.failureReasons.map((reason, idx) => (
                            <p key={idx}>• {reason}</p>
                          ))}
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              )}
            </div>
          ) : (
            <div className="bg-gray-50 rounded-lg p-12 text-center">
              <p className="text-gray-600">Select a job to view eligibility results</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default EligibilityCheck;
