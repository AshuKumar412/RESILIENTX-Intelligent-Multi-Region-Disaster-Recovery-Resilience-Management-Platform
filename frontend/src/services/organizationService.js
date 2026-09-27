import apiClient from './apiClient';

export const organizationService = {
  getOrganizations: () => apiClient.get('/organizations').then(r => r.data),
  getEnvironments: (orgId) => apiClient.get('/environments', { params: { organizationId: orgId } }).then(r => r.data),
  createOrganization: (org) => apiClient.post('/organizations', org).then(r => r.data),
};

export default organizationService;
