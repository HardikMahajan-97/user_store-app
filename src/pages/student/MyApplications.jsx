import React, { useState, useEffect } from "react";
import { applicationAPI, eligibilityAPI } from "../../api/placement.api.js";
import { deduplicateByEmail } from "../../utils/deduplication.js";
import toast from "react-hot-toast";
import { FiCheckCircle, FiXCircle, FiClock, FiBriefcase, FiAlertCircle } from "react-icons/fi";

const MyApplications = () => {
  const [applications, setApplications] = useState([]);
  const [selectedApp, setSelectedApp] = useState(null);
  const [eligibilityResult, setEligibilityResult] = useState(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    fetchApplications();
  }, []);

  const fetchApplications = async () => {
    try {
      setLoading(true);
      const response = await applicationAPI.getMyApplications();
      const deduped = deduplicateByEmail(response.data.applications || []);
      setApplications(deduped);
    } catch (error) {
      toast.error("Failed to fetch applications");
    } finally {
      setLoading(false);
    }
  };

  const handleViewDetails = async (application) => {
    setSelectedApp(application);
    try {
      const response = await eligibilityAPI.getResult(application._id);
      setEligibilityResult(response.data.eligibilityResult);
    } catch (error) {
      setEligibilityResult(null);
    }
  };

  const getStatusColor = (status) => {
    switch (status) {
      case "shortlisted":
        return "bg-green-100 text-green-800 border-green-300";
      case "rejected":
        return "bg-red-100 text-red-800 border-red-300";
      case "selected":
        return "bg-blue-100 text-blue-800 border-blue-300";
      default:
        return "bg-yellow-100 text-yellow-800 border-yellow-300";
    }
  };

  const getStatusIcon = (status) => {
    switch (status) {
      case "shortlisted":
      case "selected":
        return <FiCheckCircle className="text-green-600" />;
      case "rejected":
        return <FiXCircle className="text-red-600" />;
      default:
        return <FiClock className="text-yellow-600" />;
    }
  };

  const getStatusLabel = (status) => {
    const labels = {
      applied: "Applied",
      shortlisted: "Shortlisted",
      rejected: "Rejected",
      selected: "Selected",
    };
    return labels[status] || status;
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 p-6">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center gap-3 mb-2">
            <FiBriefcase className="text-3xl text-blue-600" />
            <h1 className="text-4xl font-bold text-gray-900">My Applications</h1>
          </div>
          <p className="text-gray-600">Track the status of your job applications</p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Applications List */}
          <div className="lg:col-span-1">
            <div className="bg-white rounded-xl shadow-md overflow-hidden sticky top-6">
              <div className="bg-gradient-to-r from-blue-50 to-indigo-50 p-5 border-b">
                <h2 className="text-lg font-bold text-gray-900">Applications</h2>
                <p className="text-xs text-gray-600 mt-1">{applications.length} total</p>
              </div>

              {loading ? (
                <div className="text-center py-12 text-gray-500">
                  <div className="animate-spin text-2xl mb-2">⏳</div>
                  Loading...
                </div>
              ) : applications.length === 0 ? (
                <div className="text-center py-12 text-gray-500">
                  <FiBriefcase className="text-4xl text-gray-300 mx-auto mb-3" />
                  <p className="text-sm font-semibold">No applications yet</p>
                </div>
              ) : (
                <div className="space-y-1 p-2 max-h-[600px] overflow-y-auto">
                  {applications.map((app) => (
                    <button
                      key={app._id}
                      onClick={() => handleViewDetails(app)}
                      className={`w-full text-left p-4 rounded-lg border-2 transition-all duration-200 hover:shadow-md ${
                        selectedApp?._id === app._id
                          ? "border-blue-600 bg-blue-50 shadow-md"
                          : "border-gray-200 hover:border-blue-300 hover:bg-gray-50"
                      }`}
                    >
                      <p className="font-bold text-sm text-gray-900 truncate">{app.job.jobRole}</p>
                      <p className="text-xs text-gray-600 mt-0.5 truncate">{app.company.name}</p>
                      <div className="flex items-center gap-2 mt-2">
                        {getStatusIcon(app.status)}
                        <span
                          className={`text-xs px-2 py-0.5 rounded font-semibold border ${getStatusColor(
                            app.status
                          )}`}
                        >
                          {getStatusLabel(app.status)}
                        </span>
                      </div>
                    </button>
                  ))}
                </div>
              )}
            </div>
          </div>

          {/* Application Details */}
          <div className="lg:col-span-2">
            {selectedApp ? (
              <div className="bg-white rounded-xl shadow-md overflow-hidden">
                {/* Header */}
                <div className="bg-gradient-to-r from-blue-600 to-indigo-600 p-8 text-white">
                  <h2 className="text-3xl font-bold mb-2">{selectedApp.job.jobRole}</h2>
                  <p className="text-blue-100 text-lg">{selectedApp.company.name}</p>
                </div>

                {/* Status and Timeline */}
                <div className="p-6 bg-gray-50 border-b">
                  <div className="flex items-center justify-between gap-4 flex-wrap">
                    <div>
                      <p className="text-sm text-gray-600">Application Status</p>
                      <div className="flex items-center gap-2 mt-1">
                        {getStatusIcon(selectedApp.status)}
                        <span className={`px-4 py-2 rounded-lg font-bold border ${getStatusColor(
                          selectedApp.status
                        )}`}>
                          {getStatusLabel(selectedApp.status)}
                        </span>
                      </div>
                    </div>
                    <div className="text-right">
                      <p className="text-sm text-gray-600">Applied on</p>
                      <p className="font-bold text-gray-900 mt-1">
                        {new Date(selectedApp.appliedAt).toLocaleDateString("en-US", {
                          year: "numeric",
                          month: "long",
                          day: "numeric",
                        })}
                      </p>
                    </div>
                  </div>
                </div>

                {/* Content */}
                <div className="p-6 space-y-6 max-h-[600px] overflow-y-auto">
                  {/* Eligibility Status */}
                  <div className={`p-4 rounded-lg border-l-4 ${
                    selectedApp.eligibilityStatus === "eligible"
                      ? "bg-green-50 border-green-500"
                      : "bg-red-50 border-red-500"
                  }`}>
                    <div className="flex items-start gap-3">
                      {selectedApp.eligibilityStatus === "eligible" ? (
                        <FiCheckCircle className="text-green-600 text-lg mt-0.5" />
                      ) : (
                        <FiXCircle className="text-red-600 text-lg mt-0.5" />
                      )}
                      <div>
                        <p className="font-bold text-gray-900">
                          Eligibility: {selectedApp.eligibilityStatus === "eligible" ? "✓ Eligible" : "✗ Not Eligible"}
                        </p>
                        {selectedApp.eligibilityReason && (
                          <p className="text-sm text-gray-700 mt-1">{selectedApp.eligibilityReason}</p>
                        )}
                      </div>
                    </div>
                  </div>

                  {/* Eligibility Details */}
                  {eligibilityResult && (
                    <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                      <h3 className="font-bold text-gray-900 mb-3 flex items-center gap-2">
                        <FiCheckCircle className="text-blue-600" />
                        Eligibility Details
                      </h3>
                      <div className="space-y-2 text-sm">
                        {eligibilityResult.criteriaMatched.tenthPercentage && (
                          <p className="text-green-700 font-medium">
                            ✓ 10th Percentage: {eligibilityResult.scores.tenthPercentage}%
                          </p>
                        )}
                        {eligibilityResult.criteriaMatched.twelthPercentage && (
                          <p className="text-green-700 font-medium">
                            ✓ 12th Percentage: {eligibilityResult.scores.twelthPercentage}%
                          </p>
                        )}
                        {eligibilityResult.criteriaMatched.aggregateCgpa && (
                          <p className="text-green-700 font-medium">
                            ✓ Aggregate CGPA: {eligibilityResult.scores.aggregateCgpa}
                          </p>
                        )}
                        {eligibilityResult.criteriaMatched.compositeScore && (
                          <p className="text-green-700 font-medium">
                            ✓ Composite Score: {eligibilityResult.scores.compositeScore}
                          </p>
                        )}
                        {eligibilityResult.failureReasons.length > 0 && (
                          <div className="mt-3 pt-3 border-t border-blue-200">
                            <p className="font-bold text-red-700 flex items-center gap-2 mb-2">
                              <FiAlertCircle className="text-lg" />
                              Reasons for ineligibility:
                            </p>
                            <ul className="space-y-1">
                              {eligibilityResult.failureReasons.map((reason, idx) => (
                                <li key={idx} className="text-red-700 ml-6">
                                  • {reason}
                                </li>
                              ))}
                            </ul>
                          </div>
                        )}
                      </div>
                    </div>
                  )}

                  {/* Job Details */}
                  <div className="bg-gray-50 rounded-lg p-4">
                    <h3 className="font-bold text-gray-900 mb-3">Job Details</h3>
                    <div className="grid grid-cols-2 gap-4 text-sm">
                      <div>
                        <p className="text-gray-600">Monthly Stipend</p>
                        <p className="font-bold text-green-600 text-lg mt-1">₹{selectedApp.job.stipend}</p>
                      </div>
                      {selectedApp.job.postPpoCTC && (
                        <div>
                          <p className="text-gray-600">PPO CTC</p>
                          <p className="font-bold text-green-600 text-lg mt-1">₹{selectedApp.job.postPpoCTC}</p>
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            ) : (
              <div className="bg-white rounded-xl shadow-md p-12 text-center flex flex-col items-center justify-center min-h-96">
                <FiBriefcase className="text-6xl text-gray-300 mb-4" />
                <p className="text-gray-600 text-lg font-semibold">Select an application to view details</p>
                <p className="text-gray-500 text-sm mt-2">Choose from the list on the left</p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default MyApplications;
