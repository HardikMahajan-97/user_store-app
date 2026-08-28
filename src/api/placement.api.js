import api from "./axios.js";

// Company APIs
export const companyAPI = {
  create: (data) => api.post(`/api/companies`, data),
  getAll: () => api.get(`/api/companies`),
  getById: (id) => api.get(`/api/companies/${id}`),
  update: (id, data) => api.put(`/api/companies/${id}`, data),
  delete: (id) => api.delete(`/api/companies/${id}`),
};

// Job APIs
export const jobAPI = {
  create: (data) => api.post(`/api/jobs`, data),
  getAll: (params) => api.get(`/api/jobs`, { params }),
  getById: (id) => api.get(`/api/jobs/${id}`),
  update: (id, data) => api.put(`/api/jobs/${id}`, data),
  close: (id) => api.patch(`/api/jobs/${id}/close`),
};

// Application APIs
export const applicationAPI = {
  apply: (jobId) =>
    api.post(`/api/applications/apply`, { jobId }),
  getMyApplications: () =>
    api.get(`/api/applications/student/my-applications`),
  getJobApplications: (jobId) =>
    api.get(`/api/applications/job/${jobId}`),
  getCompanyApplications: (companyId) =>
    api.get(`/api/applications/company/${companyId}`),
  updateStatus: (applicationId, data) =>
    api.patch(`/api/applications/${applicationId}/status`, data),
};

// Eligibility APIs
export const eligibilityAPI = {
  check: (applicationId) =>
    api.post(`/api/eligibility/${applicationId}`),
  checkAll: (jobId) =>
    api.post(`/api/eligibility/job/${jobId}/check-all`),
  getResult: (applicationId) =>
      api.get(`/api/eligibility/${applicationId}`),
  getJobResults: (jobId, isEligible) =>
      api.get(`/api/eligibility/job/${jobId}/results`, {
      params: { isEligible },
    }),
};

// Notification APIs
export const notificationAPI = {
  create: (data) => api.post(`/api/notifications`, data),
  getAll: (params) =>
      api.get(`/api/notifications`, { params }),
  markAsRead: (notificationId) =>
      api.patch(`/api/notifications/${notificationId}/read`),
  markAllAsRead: () =>
      api.patch(`/api/notifications/mark-all-read`),
  getUnreadCount: () =>
      api.get(`/api/notifications/unread-count`),
  broadcast: (data) =>
      api.post(`/api/notifications/broadcast/job`, data),
  delete: (notificationId) =>
      api.delete(`/api/notifications/${notificationId}`),
};
