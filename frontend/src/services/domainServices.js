import apiClient from './apiClient';

export const organizationService = {
  async getOrganizations() {
    const res = await apiClient.get('/organizations');
    return res.data;
  },

  async getEnvironments(orgId) {
    const res = await apiClient.get('/environments', { params: { organizationId: orgId } });
    return res.data;
  },

  async getApplications(orgId) {
    const res = await apiClient.get('/applications', { params: { organizationId: orgId } });
    return res.data;
  },

  async getApplicationById(id) {
    const res = await apiClient.get(`/applications/${id}`);
    return res.data;
  },

  async createApplication(data) {
    const res = await apiClient.post('/applications', data);
    return res.data;
  },

  async updateApplication(id, data) {
    const res = await apiClient.put(`/applications/${id}`, data);
    return res.data;
  }
};

export const regionService = {
  async getRegions() {
    const res = await apiClient.get('/regions');
    return res.data;
  },

  async getRegionById(id) {
    const res = await apiClient.get(`/regions/${id}`);
    return res.data;
  },

  async getTopology() {
    const res = await apiClient.get('/regions/topology');
    return res.data;
  },

  async updateRegion(id, data) {
    const res = await apiClient.put(`/regions/${id}`, data);
    return res.data;
  }
};

export const policyService = {
  async getPolicies() {
    const res = await apiClient.get('/policies');
    return res.data;
  },

  async getRecoveryPlans(appId) {
    const res = await apiClient.get('/recovery-plans', { params: { applicationId: appId } });
    return res.data;
  },

  async getRecoveryPlanById(id) {
    const res = await apiClient.get(`/recovery-plans/${id}`);
    return res.data;
  }
};

export const monitoringService = {
  async getOverallHealth() {
    const res = await apiClient.get('/monitoring/health');
    return res.data;
  },

  async getHealthEvents(appId) {
    const res = await apiClient.get('/monitoring/events', { params: { applicationId: appId } });
    return res.data;
  },

  async assessApplication(appId) {
    const res = await apiClient.get(`/monitoring/assess/${appId}`);
    return res.data;
  }
};

export const recoveryService = {
  async getRecoveries(appId) {
    const res = await apiClient.get('/recoveries', { params: { applicationId: appId } });
    return res.data;
  },

  async getRecoveryById(id) {
    const res = await apiClient.get(`/recoveries/${id}`);
    return res.data;
  },

  async getIncidents(appId) {
    const res = await apiClient.get('/incidents', { params: { applicationId: appId } });
    return res.data;
  },

  async initiateRecovery(data) {
    const res = await apiClient.post('/recoveries/initiate', data);
    return res.data;
  },

  async approveRecovery(id, approver, reason) {
    const res = await apiClient.post(`/recoveries/${id}/approve`, { approver, reason });
    return res.data;
  },

  async cancelRecovery(id, cancelledBy, reason) {
    const res = await apiClient.post(`/recoveries/${id}/cancel`, { cancelledBy, reason });
    return res.data;
  },

  async executeFailback(id, executedBy) {
    const res = await apiClient.post(`/recoveries/${id}/failback`, { executedBy });
    return res.data;
  },

  async runDrill(data) {
    const res = await apiClient.post('/recoveries/drill', data);
    return res.data;
  }
};

export const dataContinuityService = {
  async getReplicationStatus(appId) {
    const res = await apiClient.get(`/data/replication/${appId}`);
    return res.data;
  },

  async getCustomers() {
    const res = await apiClient.get('/ledger/customers');
    return res.data;
  },

  async createCustomer(customer) {
    const res = await apiClient.post('/ledger/customers', customer);
    return res.data;
  },

  async getTransactions() {
    const res = await apiClient.get('/ledger/transactions');
    return res.data;
  },

  async createTransaction(transaction) {
    const res = await apiClient.post('/ledger/transactions', transaction);
    return res.data;
  },

  async verifyDataContinuity() {
    const res = await apiClient.get('/ledger/continuity/verify');
    return res.data;
  }
};

export const auditService = {
  async getAuditEvents(correlationId, resourceId) {
    const res = await apiClient.get('/audit', { params: { correlationId, resourceId } });
    return res.data;
  }
};
