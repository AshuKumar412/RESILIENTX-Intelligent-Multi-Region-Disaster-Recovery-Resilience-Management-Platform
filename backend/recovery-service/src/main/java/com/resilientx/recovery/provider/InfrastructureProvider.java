package com.resilientx.recovery.provider;

import java.util.Map;

/**
 * Clean architectural abstraction for infrastructure interactions.
 * In the current phase, LocalDatabaseInfrastructureProvider operates on PostgreSQL.
 * In a future phase, AwsInfrastructureProvider connects to real AWS SDKs without frontend changes.
 */
public interface InfrastructureProvider {

    String getProviderName();

    boolean isConnected();

    String getStatusMessage();

    Map<String, Object> getRegionHealth(String regionId);

    Map<String, Object> getComputeStatus(String regionId);

    Map<String, Object> getApplicationHealth(String appId, String regionId);

    Map<String, Object> getTrafficStatus(String regionId);

    Map<String, Object> getReplicationStatus(String appId, String sourceRegion, String targetRegion);

    void activateRecoveryCompute(String regionId, int desiredTasks) throws Exception;

    boolean validateApplication(String appId, String regionId) throws Exception;

    void switchTraffic(String fromRegion, String toRegion) throws Exception;

    void failback(String appId, String primaryRegion, String recoveryRegion) throws Exception;
}
