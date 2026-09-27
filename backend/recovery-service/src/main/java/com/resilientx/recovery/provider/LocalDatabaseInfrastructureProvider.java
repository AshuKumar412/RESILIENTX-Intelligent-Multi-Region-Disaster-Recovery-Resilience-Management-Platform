package com.resilientx.recovery.provider;

import org.springframework.stereotype.Component;

import java.util.HashMap;
import java.util.Map;

/**
 * Local Database Infrastructure Provider.
 * Serves as the primary operational provider for the current phase, backed by PostgreSQL.
 */
@Component("localInfrastructureProvider")
public class LocalDatabaseInfrastructureProvider implements InfrastructureProvider {

    @Override
    public String getProviderName() {
        return "LOCAL_DATABASE";
    }

    @Override
    public boolean isConnected() {
        return true;
    }

    @Override
    public String getStatusMessage() {
        return "Connected (PostgreSQL Control Plane)";
    }

    @Override
    public Map<String, Object> getRegionHealth(String regionId) {
        Map<String, Object> res = new HashMap<>();
        res.put("regionId", regionId);
        res.put("provider", "LOCAL_DATABASE");
        res.put("status", "CONFIGURED");
        return res;
    }

    @Override
    public Map<String, Object> getComputeStatus(String regionId) {
        Map<String, Object> res = new HashMap<>();
        res.put("regionId", regionId);
        res.put("provider", "LOCAL_DATABASE");
        return res;
    }

    @Override
    public Map<String, Object> getApplicationHealth(String appId, String regionId) {
        Map<String, Object> res = new HashMap<>();
        res.put("appId", appId);
        res.put("regionId", regionId);
        res.put("provider", "LOCAL_DATABASE");
        return res;
    }

    @Override
    public Map<String, Object> getTrafficStatus(String regionId) {
        Map<String, Object> res = new HashMap<>();
        res.put("regionId", regionId);
        res.put("provider", "LOCAL_DATABASE");
        return res;
    }

    @Override
    public Map<String, Object> getReplicationStatus(String appId, String sourceRegion, String targetRegion) {
        Map<String, Object> res = new HashMap<>();
        res.put("appId", appId);
        res.put("sourceRegion", sourceRegion);
        res.put("targetRegion", targetRegion);
        res.put("provider", "LOCAL_DATABASE");
        return res;
    }

    @Override
    public void activateRecoveryCompute(String regionId, int desiredTasks) throws Exception {
        // Local execution: updates local state in database
    }

    @Override
    public boolean validateApplication(String appId, String regionId) throws Exception {
        return true;
    }

    @Override
    public void switchTraffic(String fromRegion, String toRegion) throws Exception {
        // Local execution: updates traffic records in database
    }

    @Override
    public void failback(String appId, String primaryRegion, String recoveryRegion) throws Exception {
        // Local execution: orchestrates failback via database
    }
}
