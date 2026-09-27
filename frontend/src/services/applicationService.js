import apiClient from './apiClient';

export const applicationService = {
  getApplications: (orgId) => apiClient.get('/applications', { params: { organizationId: orgId } }).then(r => r.data),
  getApplicationById: (id) => apiClient.get(`/applications/${id}`).then(r => r.data),
  createApplication: (data) => apiClient.post('/applications', data).then(r => r.data),
  updateApplication: (id, data) => apiClient.put(`/applications/${id}`, data).then(r => r.data),
};

export default applicationService;
