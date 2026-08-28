import React, { useState, useEffect } from "react";
import { companyAPI, jobAPI } from "../../api/placement.api.js";
import toast from "react-hot-toast";
import { FiEdit2, FiTrash2 } from "react-icons/fi";

const CompanyManagement = () => {
  const [companies, setCompanies] = useState([]);
  const [showForm, setShowForm] = useState(false);
  const [loading, setLoading] = useState(false);
  const [editingId, setEditingId] = useState(null);

  const [formData, setFormData] = useState({
    name: "",
    email: "",
    contactPerson: "",
    phone: "",
    website: "",
    description: "",
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
      toast.error(error.response?.data?.message || "Failed to fetch companies");
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (
      !formData.name ||
      !formData.email ||
      !formData.contactPerson ||
      !formData.phone
    ) {
      toast.error("Please fill all required fields");
      return;
    }

    try {
      setLoading(true);

      if (editingId) {
        await companyAPI.update(editingId, formData);
        toast.success("Company updated successfully");
      } else {
        await companyAPI.create(formData);
        toast.success("Company created successfully");
      }

      setFormData({
        name: "",
        email: "",
        contactPerson: "",
        phone: "",
        website: "",
        description: "",
      });
      setShowForm(false);
      setEditingId(null);
      fetchCompanies();
    } catch (error) {
      toast.error(error.response?.data?.message || "Failed to save company");
    } finally {
      setLoading(false);
    }
  };

  const handleEdit = (company) => {
    setFormData({
      name: company.name,
      email: company.email,
      contactPerson: company.contactPerson,
      phone: company.phone,
      website: company.website || "",
      description: company.description || "",
    });
    setEditingId(company._id);
    setShowForm(true);
  };

  const handleDelete = async (id) => {
    if (window.confirm("Are you sure you want to delete this company?")) {
      try {
        setLoading(true);
        await companyAPI.delete(id);
        toast.success("Company deleted successfully");
        fetchCompanies();
      } catch (error) {
        toast.error(error.response?.data?.message || "Failed to delete company");
      } finally {
        setLoading(false);
      }
    }
  };

  return (
    <div className="p-6">
      <div className="mb-6 flex justify-between items-center">
        <h1 className="text-3xl font-bold">Company Management</h1>
        {!showForm && (
          <button
            onClick={() => setShowForm(true)}
            className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700"
          >
            Add Company
          </button>
        )}
      </div>

      {showForm && (
        <div className="bg-white rounded-lg shadow p-6 mb-6">
          <h2 className="text-xl font-semibold mb-4">
            {editingId ? "Edit Company" : "Add New Company"}
          </h2>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <input
                type="text"
                placeholder="Company Name"
                value={formData.name}
                onChange={(e) =>
                  setFormData({ ...formData, name: e.target.value })
                }
                className="border border-gray-300 rounded px-3 py-2"
                required
              />
              <input
                type="email"
                placeholder="Email"
                value={formData.email}
                onChange={(e) =>
                  setFormData({ ...formData, email: e.target.value })
                }
                className="border border-gray-300 rounded px-3 py-2"
                required
              />
              <input
                type="text"
                placeholder="Contact Person"
                value={formData.contactPerson}
                onChange={(e) =>
                  setFormData({ ...formData, contactPerson: e.target.value })
                }
                className="border border-gray-300 rounded px-3 py-2"
                required
              />
              <input
                type="tel"
                placeholder="Phone"
                value={formData.phone}
                onChange={(e) =>
                  setFormData({ ...formData, phone: e.target.value })
                }
                className="border border-gray-300 rounded px-3 py-2"
                required
              />
              <input
                type="url"
                placeholder="Website"
                value={formData.website}
                onChange={(e) =>
                  setFormData({ ...formData, website: e.target.value })
                }
                className="border border-gray-300 rounded px-3 py-2"
              />
            </div>
            <textarea
              placeholder="Description"
              value={formData.description}
              onChange={(e) =>
                setFormData({ ...formData, description: e.target.value })
              }
              className="border border-gray-300 rounded px-3 py-2 w-full"
              rows="3"
            />
            <div className="flex gap-2">
              <button
                type="submit"
                disabled={loading}
                className="bg-green-600 text-white px-4 py-2 rounded hover:bg-green-700 disabled:bg-gray-400"
              >
                {loading ? "Saving..." : "Save"}
              </button>
              <button
                type="button"
                onClick={() => {
                  setShowForm(false);
                  setEditingId(null);
                  setFormData({
                    name: "",
                    email: "",
                    contactPerson: "",
                    phone: "",
                    website: "",
                    description: "",
                  });
                }}
                className="bg-gray-600 text-white px-4 py-2 rounded hover:bg-gray-700"
              >
                Cancel
              </button>
            </div>
          </form>
        </div>
      )}

      {loading && !showForm ? (
        <div className="text-center py-8">Loading companies...</div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {companies.map((company) => (
            <div key={company._id} className="bg-white rounded-lg shadow p-4">
              <h3 className="font-bold text-lg mb-2">{company.name}</h3>
              <p className="text-sm text-gray-600 mb-1">
                <strong>Email:</strong> {company.email}
              </p>
              <p className="text-sm text-gray-600 mb-1">
                <strong>Contact:</strong> {company.contactPerson}
              </p>
              <p className="text-sm text-gray-600 mb-3">
                <strong>Phone:</strong> {company.phone}
              </p>
              <div className="flex gap-2">
                <button
                  onClick={() => handleEdit(company)}
                  className="flex items-center gap-1 bg-blue-500 text-white px-3 py-1 rounded text-sm hover:bg-blue-600"
                >
                  <FiEdit2 size={14} /> Edit
                </button>
                <button
                  onClick={() => handleDelete(company._id)}
                  className="flex items-center gap-1 bg-red-500 text-white px-3 py-1 rounded text-sm hover:bg-red-600"
                >
                  <FiTrash2 size={14} /> Delete
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default CompanyManagement;
