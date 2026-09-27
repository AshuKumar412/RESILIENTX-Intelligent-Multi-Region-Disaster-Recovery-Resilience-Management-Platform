import apiClient from './apiClient';

export const organizationService = {
  getOrganizations: () => apiClient.get('/organizations').then(r => r.data),
  getEnvironments: (orgId) => apiClient.get('/environments', { params: { organizationId: orgId } }).then(r => r.data),
  createOrganization: (org) => apiClient.post('/organizations', org).then(r => r.data),
  getApplications: (orgId) => apiClient.get('/applications', { params: { organizationId: orgId } }).then(r => r.data),
  getApplicationById: (id) => apiClient.get(`/applications/${id}`).then(r => r.data),
  createApplication: (data) => apiClient.post('/applications', data).then(r => r.data),
  updateApplication: (id, data) => apiClient.put(`/applications/${id}`, data).then(r => r.data),
};

export const applicationService = organizationService;

export const regionService = {
  getRegions: () => apiClient.get('/regions').then(r => r.data),
  getRegionById: (id) => apiClient.get(`/regions/${id}`).then(r => r.data),
  getTopology: () => apiClient.get('/regions/topology').then(r => r.data),
  updateRegion: (id, data) => apiClient.put(`/regions/${id}`, data).then(r => r.data),
};

export const policyService = {
  getPolicies: () => apiClient.get('/policies').then(r => r.data),
  getRecoveryPlans: (appId) => apiClient.get('/recovery-plans', { params: { applicationId: appId } }).then(r => r.data),
  getRecoveryPlanById: (id) => apiClient.get(`/recovery-plans/${id}`).then(r => r.data),
  getReadiness: () => apiClient.get('/readiness').then(r => r.data),
};

export const monitoringService = {
  getOverallHealth: () => apiClient.get('/monitoring/health').then(r => r.data),
  getHealthEvents: (appId) => apiClient.get('/monitoring/events', { params: { applicationId: appId } }).then(r => r.data),
  assessApplication: (appId) => apiClient.get(`/monitoring/assess/${appId}`).then(r => r.data),
};

export const recoveryService = {
  getRecoveries: (appId) => apiClient.get('/recoveries', { params: { applicationId: appId } }).then(r => r.data),
  getRecoveryById: (id) => apiClient.get(`/recoveries/${id}`).then(r => r.data),
  getIncidents: (appId) => apiClient.get('/incidents', { params: { applicationId: appId } }).then(r => r.data),
  getMetricsSummary: () => apiClient.get('/recoveries/metrics/summary').then(r => r.data),
  initiateRecovery: (data) => apiClient.post('/recoveries/initiate', data).then(r => r.data),
  approveRecovery: (id, approver, reason) => apiClient.post(`/recoveries/${id}/approve`, { approver, reason }).then(r => r.data),
  cancelRecovery: (id, cancelledBy, reason) => apiClient.post(`/recoveries/${id}/cancel`, { cancelledBy, reason }).then(r => r.data),
  executeFailback: (id, executedBy) => apiClient.post(`/recoveries/${id}/failback`, { executedBy }).then(r => r.data),
  runDrill: (data) => apiClient.post('/recoveries/drill', data).then(r => r.data),
};

export const dataContinuityService = {
  getReplicationStatus: (appId) => apiClient.get(`/data/replication/${appId}`).then(r => r.data),
  getCustomers: () => apiClient.get('/ledger/customers').then(r => r.data),
  createCustomer: (customer) => apiClient.post('/ledger/customers', customer).then(r => r.data),
  getTransactions: () => apiClient.get('/ledger/transactions').then(r => r.data),
  createTransaction: (txn) => apiClient.post('/ledger/transactions', txn).then(r => r.data),
  verifyDataContinuity: () => apiClient.get('/ledger/continuity/verify').then(r => r.data),
};

export const auditService = {
  getAuditEvents: (correlationId, resourceId) => apiClient.get('/audit', { params: { correlationId, resourceId } }).then(r => r.data),
  verifyChain: () => apiClient.get('/audit/verify-chain').then(r => r.data),
};
