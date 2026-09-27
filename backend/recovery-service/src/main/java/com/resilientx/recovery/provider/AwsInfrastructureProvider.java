package com.resilientx.recovery.provider;

import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Component;
import software.amazon.awssdk.auth.credentials.DefaultCredentialsProvider;
import software.amazon.awssdk.ec2.Ec2Client;
import software.amazon.awssdk.ec2.model.DescribeInstancesRequest;
import software.amazon.awssdk.ec2.model.DescribeRegionsRequest;
import software.amazon.awssdk.regions.Region;
import software.amazon.awssdk.services.sts.StsClient;
import software.amazon.awssdk.services.sts.model.GetCallerIdentityRequest;

import java.util.HashMap;
import java.util.Map;

/**
 * AWS provider backed by the AWS SDK default credential chain.
 * AWS remains disabled unless explicitly enabled and successfully verified with STS.
 */
@Component("awsInfrastructureProvider")
public class AwsInfrastructureProvider implements InfrastructureProvider {

    @Value("${resilientx.aws.enabled:false}")
    private boolean awsEnabled;

    @Value("${resilientx.aws.region:}")
    private String awsRegion;

    @Override
    public String getProviderName() {
        return "AWS";
    }

    @Override
    public boolean isConnected() {
        return verifyIdentity() != null;
    }

    @Override
    public String getStatusMessage() {
        if (!awsEnabled) {
            return "AWS integration not connected.";
        }
        return verifyIdentity() != null ? "AWS integration connected." : "AWS credentials unavailable.";
    }

    @Override
    public Map<String, Object> getRegionHealth(String regionId) {
        Map<String, Object> res = new HashMap<>();
        res.put("regionId", regionId);
        res.put("provider", "AWS");
        if (!isConnected()) {
            return unavailable(res, "AWS infrastructure information is currently unavailable.");
        }
        try (Ec2Client ec2 = ec2Client(regionId)) {
            boolean available = ec2.describeRegions(DescribeRegionsRequest.builder().allRegions(false).build())
                    .regions().stream().anyMatch(region -> region.regionName().equals(regionId));
            res.put("status", available ? "AVAILABLE" : "NOT_CONFIGURED");
            res.put("message", available ? "Region verified through AWS." : "Region is not available to this account.");
            return res;
        } catch (Exception ex) {
            return unavailable(res, "Regional infrastructure information is unavailable.");
        }
    }

    @Override
    public Map<String, Object> getComputeStatus(String regionId) {
        Map<String, Object> res = new HashMap<>();
        res.put("regionId", regionId);
        res.put("provider", "AWS");
        if (!isConnected()) return unavailable(res, "Compute infrastructure is currently unavailable.");
        try (Ec2Client ec2 = ec2Client(regionId)) {
            long instanceCount = ec2.describeInstances(DescribeInstancesRequest.builder().build())
                    .reservations().stream().mapToLong(r -> r.instances().size()).sum();
            res.put("status", "AVAILABLE");
            res.put("resourceCount", instanceCount);
            return res;
        } catch (Exception ex) {
            return unavailable(res, "Compute infrastructure information is unavailable.");
        }
    }

    @Override
    public Map<String, Object> getApplicationHealth(String appId, String regionId) {
        Map<String, Object> res = new HashMap<>();
        res.put("appId", appId);
        res.put("regionId", regionId);
        res.put("provider", "AWS");
        return isConnected() ? unavailable(res, "Application readiness is not configured for AWS.")
            : unavailable(res, "Application infrastructure information is unavailable.");
    }

    @Override
    public Map<String, Object> getTrafficStatus(String regionId) {
        Map<String, Object> res = new HashMap<>();
        res.put("regionId", regionId);
        res.put("provider", "AWS");
        return unavailable(res, "Traffic recovery is not configured.");
    }

    @Override
    public Map<String, Object> getReplicationStatus(String appId, String sourceRegion, String targetRegion) {
        Map<String, Object> res = new HashMap<>();
        res.put("appId", appId);
        res.put("sourceRegion", sourceRegion);
        res.put("targetRegion", targetRegion);
        res.put("provider", "AWS");
        return unavailable(res, "Replication information is not configured.");
    }

    @Override
    public void activateRecoveryCompute(String regionId, int desiredTasks) throws Exception {
        requireConnected();
        throw new IllegalStateException("AWS compute activation is not configured for this deployment.");
    }

    @Override
    public boolean validateApplication(String appId, String regionId) throws Exception {
        requireConnected();
        throw new IllegalStateException("AWS application validation is not configured for this deployment.");
    }

    @Override
    public void switchTraffic(String fromRegion, String toRegion) throws Exception {
        requireConnected();
        throw new IllegalStateException("Traffic recovery is not configured.");
    }

    @Override
    public void failback(String appId, String primaryRegion, String recoveryRegion) throws Exception {
        requireConnected();
        throw new IllegalStateException("AWS failback is not configured for this deployment.");
    }

    private void requireConnected() {
        if (!isConnected()) throw new IllegalStateException("AWS integration is not connected.");
    }

    private String verifyIdentity() {
        if (!awsEnabled || awsRegion == null || awsRegion.isBlank()) return null;
        try (StsClient sts = StsClient.builder()
                .region(Region.of(awsRegion))
                .credentialsProvider(DefaultCredentialsProvider.create())
                .build()) {
            return sts.getCallerIdentity(GetCallerIdentityRequest.builder().build()).arn();
        } catch (Exception ex) {
            return null;
        }
    }

    private Ec2Client ec2Client(String regionId) {
        return Ec2Client.builder()
                .region(Region.of(regionId))
                .credentialsProvider(DefaultCredentialsProvider.create())
                .build();
    }

    private Map<String, Object> unavailable(Map<String, Object> response, String message) {
        response.put("status", "UNAVAILABLE");
        response.put("message", message);
        return response;
    }
}
