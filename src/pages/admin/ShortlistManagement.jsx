import React, { useState, useEffect } from "react";
import { jobAPI, eligibilityAPI, applicationAPI } from "../../api/placement.api.js";
import { deduplicateByEmail } from "../../utils/deduplication.js";
import toast from "react-hot-toast";
import { FiBriefcase, FiUsers, FiDownload, FiCheckCircle, FiXCircle, FiAlertCircle, FiPlay } from "react-icons/fi";

const ShortlistManagement = () => {
  const [jobs, setJobs] = useState([]);
  const [selectedJob, setSelectedJob] = useState(null);
  const [eligibleStudents, setEligibleStudents] = useState([]);
  const [ineligibleStudents, setIneligibleStudents] = useState([]);
  const [shortlistedStudents, setShortlistedStudents] = useState([]);
  const [processedApplications, setProcessedApplications] = useState(new Set());
  const [loading, setLoading] = useState(false);
  const [shortlistingAll, setShortlistingAll] = useState(false);
  const [shortlistAllProgress, setShortlistAllProgress] = useState(0);

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
    setShortlistAllProgress(0);
    try {
      setLoading(true);
      const eligibleRes = await eligibilityAPI.getJobResults(job._id, true);
      const ineligibleRes = await eligibilityAPI.getJobResults(job._id, false);
      const applicationsRes = await applicationAPI.getJobApplications(job._id);

      const eligibleData = deduplicateByEmail(eligibleRes.data.results || []);
      const ineligibleData = deduplicateByEmail(ineligibleRes.data.results || []);
      const shortlisted = deduplicateByEmail(applicationsRes.data.applications.filter(
        (app) => app.status === "shortlisted"
      ));

      setEligibleStudents(eligibleData);
      setIneligibleStudents(ineligibleData);
      setShortlistedStudents(shortlisted);
    } catch (error) {
      setEligibleStudents([]);
      setIneligibleStudents([]);
      setShortlistedStudents([]);
    } finally {
      setLoading(false);
    }
  };

  const handleShortlist = async (student, applicationId) => {
    if (processedApplications.has(applicationId)) return;

    try {
      setProcessedApplications(prev => new Set(prev).add(applicationId));

      await applicationAPI.updateStatus(applicationId, {
        status: "shortlisted",
      });

      setEligibleStudents(prev => prev.filter(s => s._id !== student._id));
      setShortlistedStudents(prev => [...prev, { _id: applicationId, student, status: "shortlisted" }]);

      toast.success("Student shortlisted successfully");
    } catch (error) {
      setProcessedApplications(prev => {
        const copy = new Set(prev);
        copy.delete(applicationId);
        return copy;
      });
      toast.error(error.response?.data?.message || "Failed to shortlist");
    }
  };

  const handleReject = async (student, applicationId) => {
    if (processedApplications.has(applicationId)) return;

    const reason = prompt("Enter rejection reason:");
    if (!reason) return;

    try {
      setProcessedApplications(prev => new Set(prev).add(applicationId));

      await applicationAPI.updateStatus(applicationId, {
        status: "rejected",
        rejectionReason: reason,
      });

      setEligibleStudents(prev => prev.filter(s => s._id !== student._id));
      setIneligibleStudents(prev => [...prev, { _id: applicationId, student, failureReasons: [reason] }]);

      toast.success("Student rejected");
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

    const uniqueStudents = deduplicateByEmail(shortlistedStudents);
    const csvContent = [
      ["Student Name", "Email", "Status"].join(","),
      ...uniqueStudents.map((student) =>
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
    if (shortlistingAll) return;
    
    try {
      setShortlistingAll(true);
      setShortlistAllProgress(0);

      const studentsToProcess = eligibleStudents.filter(
        (result) => !processedApplications.has(result.application)
      );

      if (!studentsToProcess.length) {
        toast.info("All eligible students already processed");
        return;
      }

      setShortlistingAll(true);
      const total = studentsToProcess.length;
      let completed = 0;

      for (const result of studentsToProcess) {
        try {
          setProcessedApplications(prev => new Set(prev).add(result.application));
          await applicationAPI.updateStatus(result.application, {
            status: "shortlisted",
          });
          
          setEligibleStudents(prev => prev.filter(s => s._id !== result._id));
          setShortlistedStudents(prev => [...prev, { _id: result.application, student: result.student, status: "shortlisted" }]);
          
          completed++;
          setShortlistAllProgress(Math.round((completed / total) * 100));
        } catch (error) {
          console.error(`Failed to shortlist student ${result.student.name}:`, error);
        }
      }

      toast.success(`Shortlisted ${completed}/${total} students`);
    } catch (error) {
      toast.error("Failed to shortlist students");
    } finally {
      setShortlistingAll(false);
      setShortlistAllProgress(0);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 p-6">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center gap-3 mb-2">
            <FiBriefcase className="text-2xl text-blue-600" />
            <h1 className="text-4xl font-bold text-gray-900">Shortlist Management</h1>
          </div>
          <p className="text-gray-600">Manage candidate eligibility and shortlisting</p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-5 gap-6">
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
                  Loading jobs...
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

          {/* Results Grid */}
          {selectedJob ? (
            <>
              {/* Eligible Students */}
              <div className="lg:col-span-2 bg-white rounded-xl shadow-md overflow-hidden">
                <div className="bg-gradient-to-r from-green-50 to-emerald-50 p-5 border-b border-green-200">
                  <h3 className="font-bold text-lg text-green-900 flex items-center gap-2">
                    <FiCheckCircle className="text-green-600" />
                    Eligible Candidates ({eligibleStudents.length})
                  </h3>
                </div>

                {eligibleStudents.length > 0 && (
                  <div className="p-4 border-b border-green-100 bg-green-50">
                    <button
                      onClick={handleShortlistAll}
                      disabled={shortlistingAll || eligibleStudents.length === 0}
                      className="w-full flex items-center justify-center gap-2 bg-gradient-to-r from-green-600 to-emerald-600 text-white py-3 rounded-lg font-semibold hover:from-green-700 hover:to-emerald-700 disabled:opacity-50 disabled:cursor-not-allowed transition-all"
                    >
                      <FiPlay className="text-lg" />
                      {shortlistingAll ? `Processing... ${shortlistAllProgress}%` : "Shortlist All"}
                    </button>
                    {shortlistingAll && (
                      <div className="mt-3 w-full bg-gray-200 rounded-full h-2">
                        <div
                          className="bg-green-600 h-2 rounded-full transition-all duration-300"
                          style={{ width: `${shortlistAllProgress}%` }}
                        />
                      </div>
                    )}
                  </div>
                )}

                <div className="space-y-2 p-4 max-h-[600px] overflow-y-auto">
                  {eligibleStudents.length > 0 ? (
                    eligibleStudents.map((result) => (
                      <div
                        key={result._id}
                        className="border-2 border-green-200 bg-white hover:bg-green-50 rounded-lg p-4 transition-all duration-200"
                      >
                        <div className="flex justify-between items-start mb-3">
                          <div className="flex-1">
                            <p className="font-bold text-gray-900">{result.student.name}</p>
                            <p className="text-xs text-gray-500 mt-0.5">{result.student.email}</p>
                          </div>
                          <span className="bg-green-100 text-green-800 text-xs font-semibold px-2 py-1 rounded">
                            Eligible
                          </span>
                        </div>
                        <div className="grid grid-cols-2 gap-2">
                          <button
                            onClick={() => handleShortlist(result, result.application)}
                            disabled={processedApplications.has(result.application)}
                            className="flex items-center justify-center gap-1 bg-green-600 text-white py-2 rounded font-semibold text-sm hover:bg-green-700 disabled:bg-gray-400 disabled:cursor-not-allowed transition"
                          >
                            <FiCheckCircle />
                            {processedApplications.has(result.application) ? "Done" : "Shortlist"}
                          </button>
                          <button
                            onClick={() => handleReject(result, result.application)}
                            disabled={processedApplications.has(result.application)}
                            className="flex items-center justify-center gap-1 bg-red-600 text-white py-2 rounded font-semibold text-sm hover:bg-red-700 disabled:bg-gray-400 disabled:cursor-not-allowed transition"
                          >
                            <FiXCircle />
                            {processedApplications.has(result.application) ? "Done" : "Reject"}
                          </button>
                        </div>
                      </div>
                    ))
                  ) : (
                    <p className="text-center text-gray-500 py-8">No eligible candidates</p>
                  )}
                </div>
              </div>

              {/* Shortlisted Students */}
              <div className="lg:col-span-1 bg-white rounded-xl shadow-md overflow-hidden">
                <div className="bg-gradient-to-r from-blue-50 to-indigo-50 p-5 border-b border-blue-200">
                  <h3 className="font-bold text-lg text-blue-900 flex items-center gap-2">
                    ⭐ Shortlisted ({shortlistedStudents.length})
                  </h3>
                </div>

                {shortlistedStudents.length > 0 && (
                  <div className="p-4 border-b border-blue-100 bg-blue-50">
                    <button
                      onClick={handleDownloadShortlist}
                      className="w-full flex items-center justify-center gap-2 bg-blue-600 text-white py-2 rounded-lg font-semibold hover:bg-blue-700 transition"
                    >
                      <FiDownload />
                      Download CSV
                    </button>
                  </div>
                )}

                <div className="space-y-2 p-4 max-h-[600px] overflow-y-auto">
                  {shortlistedStudents.length > 0 ? (
                    shortlistedStudents.map((student) => (
                      <div
                        key={student._id}
                        className="border-2 border-blue-200 bg-blue-50 rounded-lg p-3 hover:shadow-md transition-all"
                      >
                        <p className="font-semibold text-gray-900 text-sm">{student.student.name}</p>
                        <p className="text-xs text-gray-600 mt-0.5">{student.student.email}</p>
                        <span className="inline-block mt-2 bg-blue-600 text-white px-3 py-1 rounded text-xs font-semibold">
                          ✓ Shortlisted
                        </span>
                      </div>
                    ))
                  ) : (
                    <p className="text-center text-gray-500 py-8">No shortlisted candidates</p>
                  )}
                </div>
              </div>

              {/* Ineligible Students */}
              <div className="lg:col-span-1 bg-white rounded-xl shadow-md overflow-hidden">
                <div className="bg-gradient-to-r from-red-50 to-orange-50 p-5 border-b border-red-200">
                  <h3 className="font-bold text-lg text-red-900 flex items-center gap-2">
                    <FiXCircle className="text-red-600" />
                    Ineligible ({ineligibleStudents.length})
                  </h3>
                </div>

                <div className="space-y-2 p-4 max-h-[600px] overflow-y-auto">
                  {ineligibleStudents.length > 0 ? (
                    ineligibleStudents.map((result) => (
                      <div
                        key={result._id}
                        className="border-2 border-red-200 bg-red-50 rounded-lg p-3 hover:shadow-md transition-all"
                      >
                        <p className="font-semibold text-gray-900 text-sm">{result.student.name}</p>
                        <p className="text-xs text-gray-600 mt-0.5">{result.student.email}</p>
                        <p className="text-red-700 text-xs mt-2 flex items-center gap-1">
                          <FiAlertCircle className="text-sm" />
                          {result.failureReasons?.[0] || "Not eligible"}
                        </p>
                      </div>
                    ))
                  ) : (
                    <p className="text-center text-gray-500 py-8">No ineligible candidates</p>
                  )}
                </div>
              </div>
            </>
          ) : (
            <div className="lg:col-span-4 bg-white rounded-xl shadow-md p-12 text-center flex flex-col items-center justify-center min-h-96">
              <FiBriefcase className="text-6xl text-gray-300 mb-4" />
              <p className="text-gray-600 text-lg font-semibold">Select a job to manage shortlisting</p>
              <p className="text-gray-500 text-sm mt-2">Choose from the jobs list on the left</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default ShortlistManagement;
