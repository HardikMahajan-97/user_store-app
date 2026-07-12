import React, { useState, useEffect } from "react";
import { applicationAPI, eligibilityAPI } from "../../api/placement.api.js";
import toast from "react-hot-toast";
import { FiCheckCircle, FiXCircle, FiClock } from "react-icons/fi";

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
      setApplications(response.data.applications || []);
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
        return "bg-green-100 text-green-800";
      case "rejected":
        return "bg-red-100 text-red-800";
      case "selected":
        return "bg-blue-100 text-blue-800";
      default:
        return "bg-yellow-100 text-yellow-800";
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

  return (
    <div className="p-6">
      <h1 className="text-3xl font-bold mb-6">My Applications</h1>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Applications List */}
        <div className="lg:col-span-1">
          {loading ? (
            <div className="text-center py-8">Loading applications...</div>
          ) : applications.length === 0 ? (
            <div className="text-center py-8 text-gray-600">
              No applications yet
            </div>
          ) : (
            <div className="space-y-2">
              {applications.map((app) => (
                <button
                  key={app._id}
                  onClick={() => handleViewDetails(app)}
                  className={`w-full text-left p-3 rounded border-2 transition ${
                    selectedApp?._id === app._id
                      ? "border-blue-600 bg-blue-50"
                      : "border-gray-200 hover:border-gray-300"
                  }`}
                >
                  <p className="font-semibold">{app.job.jobRole}</p>
                  <p className="text-sm text-gray-600">{app.company.name}</p>
                  <div className="flex items-center gap-2 mt-2">
                    {getStatusIcon(app.status)}
                    <span
                      className={`text-xs px-2 py-1 rounded ${getStatusColor(
                        app.status
                      )}`}
                    >
                      {app.status.charAt(0).toUpperCase() +
                        app.status.slice(1)}
                    </span>
                  </div>
                </button>
              ))}
            </div>
          )}
        </div>

        {/* Application Details */}
        <div className="lg:col-span-2">
          {selectedApp ? (
            <div className="bg-white rounded-lg shadow p-6 space-y-6">
              <div>
                <h2 className="text-2xl font-bold mb-2">
                  {selectedApp.job.jobRole}
                </h2>
                <p className="text-gray-600 text-lg">
                  {selectedApp.company.name}
                </p>
                <p className="text-sm text-gray-500 mt-2">
                  Applied on:{" "}
                  {new Date(selectedApp.appliedAt).toLocaleDateString()}
                </p>
              </div>

              <div className="bg-gray-50 p-4 rounded">
                <div className="flex items-center gap-3 mb-2">
                  {getStatusIcon(selectedApp.status)}
                  <span className={`font-semibold ${getStatusColor(
                    selectedApp.status
                  )}`}>
                    Status: {selectedApp.status.toUpperCase()}
                  </span>
                </div>
                <p className="text-sm text-gray-600">
                  Eligibility:{" "}
                  {selectedApp.eligibilityStatus === "eligible"
                    ? "✓ Eligible"
                    : "✗ Not Eligible"}
                </p>
              </div>

              {selectedApp.eligibilityReason && (
                <div className="bg-red-50 p-4 rounded">
                  <h3 className="font-semibold text-red-900 mb-2">
                    Why not eligible?
                  </h3>
                  <p className="text-sm text-red-800">
                    {selectedApp.eligibilityReason}
                  </p>
                </div>
              )}

              {eligibilityResult && (
                <div className="bg-blue-50 p-4 rounded">
                  <h3 className="font-semibold text-blue-900 mb-3">
                    Eligibility Details
                  </h3>
                  <div className="space-y-2 text-sm">
                    {eligibilityResult.criteriaMatched.tenthPercentage && (
                      <p className="text-green-700">
                        ✓ 10th Percentage: {eligibilityResult.scores.tenthPercentage}%
                      </p>
                    )}
                    {eligibilityResult.criteriaMatched.twelthPercentage && (
                      <p className="text-green-700">
                        ✓ 12th Percentage: {eligibilityResult.scores.twelthPercentage}%
                      </p>
                    )}
                    {eligibilityResult.criteriaMatched.aggregateCgpa && (
                      <p className="text-green-700">
                        ✓ Aggregate CGPA: {eligibilityResult.scores.aggregateCgpa}
                      </p>
                    )}
                    {eligibilityResult.criteriaMatched.compositeScore && (
                      <p className="text-green-700">
                        ✓ Composite Score: {eligibilityResult.scores.compositeScore}
                      </p>
                    )}
                    {eligibilityResult.failureReasons.length > 0 && (
                      <>
                        <p className="font-semibold text-red-700 mt-3">
                          Reasons for ineligibility:
                        </p>
                        {eligibilityResult.failureReasons.map((reason, idx) => (
                          <p key={idx} className="text-red-700 ml-3">
                            • {reason}
                          </p>
                        ))}
                      </>
                    )}
                  </div>
                </div>
              )}

              <div className="bg-gray-50 p-4 rounded">
                <h3 className="font-semibold mb-2">Job Details</h3>
                <p className="text-sm text-gray-700 mb-2">
                  <strong>Stipend:</strong> ₹{selectedApp.job.stipend}
                </p>
                {selectedApp.job.postPpoCTC && (
                  <p className="text-sm text-gray-700">
                    <strong>PPO CTC:</strong> ₹{selectedApp.job.postPpoCTC}
                  </p>
                )}
              </div>
            </div>
          ) : (
            <div className="bg-gray-50 rounded-lg p-12 text-center">
              <p className="text-gray-600">Select an application to view details</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default MyApplications;
