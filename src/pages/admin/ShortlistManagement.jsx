import React, { useState, useEffect } from "react";
import { jobAPI, eligibilityAPI, applicationAPI } from "../../api/placement.api.js";
import toast from "react-hot-toast";
import { FiCheck, FiX } from "react-icons/fi";

const ShortlistManagement = () => {
  const [jobs, setJobs] = useState([]);
  const [selectedJob, setSelectedJob] = useState(null);
  const [eligibleStudents, setEligibleStudents] = useState([]);
  const [ineligibleStudents, setIneligibleStudents] = useState([]);
  const [shortlistedStudents, setShortlistedStudents] = useState([]);
  const [processedApplications, setProcessedApplications] = useState(new Set());
  const [loading, setLoading] = useState(false);
  const [updating, setUpdating] = useState(false);

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
    setProcessedApplications(new Set());
    try {
      setLoading(true);
      const eligibleRes = await eligibilityAPI.getJobResults(job._id, true);
      const ineligibleRes = await eligibilityAPI.getJobResults(job._id, false);
      const applicationsRes = await applicationAPI.getJobApplications(job._id);

      setEligibleStudents(eligibleRes.data.results || []);
      setIneligibleStudents(ineligibleRes.data.results || []);

      const shortlisted = applicationsRes.data.applications.filter(
        (app) => app.status === "shortlisted"
      );
      setShortlistedStudents(shortlisted);
    } catch (error) {
      setEligibleStudents([]);
      setIneligibleStudents([]);
      setShortlistedStudents([]);
    } finally {
      setLoading(false);
    }
  };

  const handleShortlist = async (applicationId) => {
    if (processedApplications.has(applicationId)) return;

    try {
      setProcessedApplications(prev => new Set(prev).add(applicationId));

      await applicationAPI.updateStatus(applicationId, {
        status: "shortlisted",
      });

      toast.success("Student shortlisted successfully");

      handleJobSelect(selectedJob);
    } catch (error) {
      setProcessedApplications(prev => {
        const copy = new Set(prev);
        copy.delete(applicationId);
        return copy;
      });

      toast.error(error.response?.data?.message || "Failed to shortlist");
    }
  };

  const handleReject = async (applicationId) => {
    if (processedApplications.has(applicationId)) return;

    const reason = prompt("Enter rejection reason:");
    if (!reason) return;

    try {
      setProcessedApplications(prev => new Set(prev).add(applicationId));

      await applicationAPI.updateStatus(applicationId, {
        status: "rejected",
        rejectionReason: reason,
      });

      toast.success("Student rejected");

      handleJobSelect(selectedJob);
    } catch (error) {
      setProcessedApplications(prev => {
        const copy = new Set(prev);
        copy.delete(applicationId);
        return copy;
      });

      toast.error(error.response?.data?.message || "Failed to reject");
    }
  };

  const handleDownloadShortlist = () => {
    if (!shortlistedStudents.length) {
      toast.error("No shortlisted students");
      return;
    }

    const csvContent = [
      ["Student Name", "Email", "Status"].join(","),
      ...shortlistedStudents.map((student) =>
        [student.student.name, student.student.email, "Shortlisted"].join(",")
      ),
    ].join("\n");

    const blob = new Blob([csvContent], { type: "text/csv" });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `shortlist-${selectedJob.jobRole}-${Date.now()}.csv`;
    a.click();
  };

  const handleShortlistAll = async () => {
    try {
      setUpdating(true);

      for (const result of eligibleStudents) {
        if (processedApplications.has(result.application)) continue;

        setProcessedApplications(prev => new Set(prev).add(result.application));

        await applicationAPI.updateStatus(result.application, {
          status: "shortlisted",
        });
      }

      toast.success("All eligible students shortlisted");

      handleJobSelect(selectedJob);
    } catch (error) {
      toast.error("Failed to shortlist all students");
    } finally {
      setUpdating(false);
    }
  };

  return (
    <div className="p-6">
      <h1 className="text-3xl font-bold mb-6">Shortlist Management</h1>

      <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
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
                  <p className="font-semibold text-sm">{job.jobRole}</p>
                  <p className="text-xs text-gray-600">{job.company.name}</p>
                </button>
              ))}
            </div>
          )}
        </div>

        {/* Results */}
        {selectedJob ? (
          <>
            {/* Eligible Students */}
            <div className="lg:col-span-1 bg-white rounded-lg shadow p-4">
              <button
                  onClick={handleShortlistAll}
                  className="w-full mb-3 bg-green-600 text-white py-2 rounded hover:bg-green-700"
              >
                Shortlist All
              </button>
              <h3 className="font-semibold text-green-700 mb-3">
                ✓ Eligible ({eligibleStudents.length})
              </h3>
              <div className="space-y-2 max-h-96 overflow-y-auto">
                {eligibleStudents.map((result) => (
                  <div key={result._id} className="border border-green-200 p-2 rounded text-sm">
                    <p className="font-semibold">{result.student.name}</p>
                    <p className="text-gray-600 text-xs">{result.student.email}</p>
                    <button
                      onClick={() =>
                        handleShortlist(result.application)
                      }
                      disabled={processedApplications.has(result.application)}
                      className="mt-2 w-full bg-green-600 text-white py-1 rounded text-xs hover:bg-green-700 disabled:bg-gray-400"
                    >
                      {processedApplications.has(result.application)
                          ? "Shortlisted"
                          : "Shortlist"}
                    </button>
                    <button
                        onClick={() =>
                            handleReject(result.application)
                        }
                        disabled={processedApplications.has(result.application)}
                        className="mt-2 w-full bg-red-600 text-white py-1 rounded text-xs hover:bg-red-700 disabled:bg-gray-400"
                    >
                      {processedApplications.has(result.application)
                          ? "Rejected"
                          : "Reject"}
                    </button>
                  </div>
                ))}
              </div>
            </div>

            {/* Shortlisted Students */}
            <div className="lg:col-span-1 bg-white rounded-lg shadow p-4">
              <h3 className="font-semibold text-blue-700 mb-3">
                ★ Shortlisted ({shortlistedStudents.length})
              </h3>
              {shortlistedStudents.length > 0 && (
                <button
                  onClick={handleDownloadShortlist}
                  className="w-full mb-3 bg-blue-600 text-white px-3 py-1 rounded text-sm hover:bg-blue-700"
                >
                  Download List
                </button>
              )}
              <div className="space-y-2 max-h-96 overflow-y-auto">
                {shortlistedStudents.map((student) => (
                  <div key={student._id} className="border border-blue-200 p-2 rounded text-sm bg-blue-50">
                    <p className="font-semibold">{student.student.name}</p>
                    <p className="text-gray-600 text-xs">{student.student.email}</p>
                    <span className="inline-block mt-1 bg-blue-600 text-white px-2 py-0.5 rounded text-xs">
                      Shortlisted
                    </span>
                  </div>
                ))}
              </div>
            </div>

            {/* Ineligible Students */}
            <div className="lg:col-span-1 bg-white rounded-lg shadow p-4">
              <h3 className="font-semibold text-red-700 mb-3">
                ✗ Ineligible ({ineligibleStudents.length})
              </h3>
              <div className="space-y-2 max-h-96 overflow-y-auto">
                {ineligibleStudents.map((result) => (
                  <div key={result._id} className="border border-red-200 p-2 rounded text-sm bg-red-50">
                    <p className="font-semibold">{result.student.name}</p>
                    <p className="text-gray-600 text-xs">{result.student.email}</p>
                    <p className="text-red-700 text-xs mt-1">
                      {result.failureReasons[0] || "Not eligible"}
                    </p>
                  </div>
                ))}
              </div>
            </div>
          </>
        ) : (
          <div className="lg:col-span-3 bg-gray-50 rounded-lg p-12 text-center">
            <p className="text-gray-600">Select a job to manage shortlisting</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default ShortlistManagement;
