import React, { useState, useEffect } from "react";
import { jobAPI, companyAPI, notificationAPI } from "../../api/placement.api.js";
import toast from "react-hot-toast";

const JobPosting = () => {
  const [companies, setCompanies] = useState([]);
  const [loading, setLoading] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  const [formData, setFormData] = useState({
    company: "",
    jobRole: "",
    jobDescription: "",
    responsibilities: "",
    requirements: "",
    requiredSkills: "",
    softSkills: "",
    stipend: "",
    postPpoCTC: "",
    criteria: {
      tenthPercentage: 0,
      twelthPercentage: 0,
      aggregateCgpa: 0,
      compositeScoreThreshold: 0,
    },
  });

  useEffect(() => {
    fetchCompanies();
  }, []);

  const fetchCompanies = async () => {
    try {
      setLoading(true);
      const response = await companyAPI.getAll();
      setCompanies(response.data.companies || []);
    } catch (error) {
      toast.error("Failed to fetch companies");
    } finally {
      setLoading(false);
    }
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData({ ...formData, [name]: value });
  };

  const handleCriteriaChange = (e) => {
    const { name, value } = e.target;
    setFormData({
      ...formData,
      criteria: { ...formData.criteria, [name]: parseFloat(value) || 0 },
    });
  };

  const handleArrayFieldChange = (fieldName, value) => {
    setFormData((prev) => ({
      ...prev,
      [fieldName]: value,
    }));
  };

  const textToArray = (text) => {
    return text
        .replace(/\r/g, "")
        .split(/\n|•|- |\d+\.\s+|\.\s+/)
        .map((item) => item.trim())
        .filter(Boolean);
  };

  const commaSeparatedToArray = (text) => {
    return text
        .split(",")
        .map((item) => item.trim())
        .filter(Boolean);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (
      !formData.company ||
      !formData.jobRole ||
      !formData.jobDescription ||
      !formData.stipend
    ) {
      toast.error("Please fill all required fields");
      return;
    }

    try {
      setSubmitting(true);

      const payload = {
        ...formData,

        responsibilities: textToArray(formData.responsibilities),

        requirements: textToArray(formData.requirements),

        requiredSkills: commaSeparatedToArray(formData.requiredSkills),

        softSkills: commaSeparatedToArray(formData.softSkills),

        stipend: parseFloat(formData.stipend),

        postPpoCTC: formData.postPpoCTC
            ? parseFloat(formData.postPpoCTC)
            : null,
      };

      const response = await jobAPI.create(payload);
      toast.success("Job posted successfully!");

      // Broadcast notification to all students
      await notificationAPI.broadcast({
        jobId: response.data.job._id,
        recipientRole: "student",
      });

      setFormData({
        company: "",
        jobRole: "",
        jobDescription: "",
        responsibilities: "",
        requirements: "",
        requiredSkills: "",
        softSkills: "",
        stipend: "",
        postPpoCTC: "",
        criteria: {
          tenthPercentage: 0,
          twelthPercentage: 0,
          aggregateCgpa: 0,
          compositeScoreThreshold: 0,
        },
      });
    } catch (error) {
      toast.error(
        error.response?.data?.message || "Failed to post job"
      );
      console.error(error);
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="p-6 max-w-4xl mx-auto">
      <h1 className="text-3xl font-bold mb-6">Post New Job</h1>

      {loading ? (
        <div className="text-center py-8">Loading companies...</div>
      ) : (
        <form onSubmit={handleSubmit} className="bg-white rounded-lg shadow p-6 space-y-6">
          {/* Basic Info */}
          <div>
            <h2 className="text-xl font-semibold mb-4">Basic Information</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium mb-1">
                  Company *
                </label>
                <select
                  name="company"
                  value={formData.company}
                  onChange={handleInputChange}
                  className="w-full border border-gray-300 rounded px-3 py-2"
                  required
                >
                  <option value="">Select Company</option>
                  {companies.map((company) => (
                    <option key={company._id} value={company._id}>
                      {company.name}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium mb-1">
                  Job Role *
                </label>
                <input
                  type="text"
                  name="jobRole"
                  value={formData.jobRole}
                  onChange={handleInputChange}
                  placeholder="e.g., Software Engineer"
                  className="w-full border border-gray-300 rounded px-3 py-2"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium mb-1">
                  Stipend (₹) *
                </label>
                <input
                  type="number"
                  name="stipend"
                  value={formData.stipend}
                  onChange={handleInputChange}
                  placeholder="e.g., 50000"
                  className="w-full border border-gray-300 rounded px-3 py-2"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium mb-1">
                  Post PPO CTC (₹)
                </label>
                <input
                  type="number"
                  name="postPpoCTC"
                  value={formData.postPpoCTC}
                  onChange={handleInputChange}
                  placeholder="e.g., 1200000"
                  className="w-full border border-gray-300 rounded px-3 py-2"
                />
              </div>
            </div>
          </div>

          {/* Description */}
          <div>
            <h2 className="text-xl font-semibold mb-4">Job Details</h2>
            <div>
              <label className="block text-sm font-medium mb-1">
                Job Description *
              </label>
              <textarea
                name="jobDescription"
                value={formData.jobDescription}
                onChange={handleInputChange}
                placeholder="Describe the job role..."
                className="w-full border border-gray-300 rounded px-3 py-2"
                rows="4"
                required
              />
            </div>
          </div>

          {/* Responsibilities & Requirements */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium mb-1">
                Responsibilities
              </label>
              <textarea
                  value={formData.responsibilities}
                onChange={(e) =>
                  handleArrayFieldChange("responsibilities", e.target.value)
                }
                placeholder="e.g., Code review, Team collaboration"
                className="w-full border border-gray-300 rounded px-3 py-2"
                rows="3"
              />
            </div>

            <div>
              <label className="block text-sm font-medium mb-1">
                Requirements
              </label>
              <textarea
                value={formData.requirements}
                onChange={(e) =>
                  handleArrayFieldChange("requirements", e.target.value)
                }
                placeholder="e.g., 3+ years experience, B.Tech"
                className="w-full border border-gray-300 rounded px-3 py-2"
                rows="3"
              />
            </div>
          </div>

          {/* Skills */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium mb-1">
                Required Skills (comma-separated)
              </label>
              <textarea
                value={formData.requiredSkills}
                onChange={(e) =>
                  handleArrayFieldChange("requiredSkills", e.target.value)
                }
                placeholder="e.g., Python, React, Node.js"
                className="w-full border border-gray-300 rounded px-3 py-2"
                rows="3"
              />
            </div>

            <div>
              <label className="block text-sm font-medium mb-1">
                Soft Skills (comma-separated)
              </label>
              <textarea
                value={formData.softSkills}
                onChange={(e) =>
                  handleArrayFieldChange("softSkills", e.target.value)
                }
                placeholder="e.g., Communication, Problem-solving"
                className="w-full border border-gray-300 rounded px-3 py-2"
                rows="3"
              />
            </div>
          </div>

          {/* Eligibility Criteria */}
          <div>
            <h2 className="text-xl font-semibold mb-4">Eligibility Criteria</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium mb-1">
                  10th Grade Percentage (%)
                </label>
                <input
                  type="number"
                  name="tenthPercentage"
                  value={formData.criteria.tenthPercentage}
                  onChange={handleCriteriaChange}
                  min="0"
                  max="100"
                  step="0.1"
                  className="w-full border border-gray-300 rounded px-3 py-2"
                />
              </div>

              <div>
                <label className="block text-sm font-medium mb-1">
                  12th Grade Percentage (%)
                </label>
                <input
                  type="number"
                  name="twelthPercentage"
                  value={formData.criteria.twelthPercentage}
                  onChange={handleCriteriaChange}
                  min="0"
                  max="100"
                  step="0.1"
                  className="w-full border border-gray-300 rounded px-3 py-2"
                />
              </div>

              <div>
                <label className="block text-sm font-medium mb-1">
                  Minimum Aggregate CGPA
                </label>
                <input
                  type="number"
                  name="aggregateCgpa"
                  value={formData.criteria.aggregateCgpa}
                  onChange={handleCriteriaChange}
                  min="0"
                  max="10"
                  step="0.1"
                  className="w-full border border-gray-300 rounded px-3 py-2"
                />
              </div>

              <div>
                <label className="block text-sm font-medium mb-1">
                  Composite Score Threshold
                </label>
                <input
                  type="number"
                  name="compositeScoreThreshold"
                  value={formData.criteria.compositeScoreThreshold}
                  onChange={handleCriteriaChange}
                  min="0"
                  className="w-full border border-gray-300 rounded px-3 py-2"
                />
              </div>
            </div>
          </div>

          <div className="flex gap-2">
            <button
              type="submit"
              disabled={submitting || loading}
              className="bg-blue-600 text-white px-6 py-2 rounded hover:bg-blue-700 disabled:bg-gray-400"
            >
              {submitting ? "Posting..." : "Post Job"}
            </button>
          </div>
        </form>
      )}
    </div>
  );
};

export default JobPosting;
