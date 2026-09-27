# =============================================================================
# ResilientX Control Plane - Service Launcher
# Loads .env from the project root, then starts all 10 microservices.
# REQUIREMENT: Set DB_USERNAME, DB_PASSWORD, JWT_SECRET in ../.env (or env)
# =============================================================================

$ErrorActionPreference = "Stop"
$BackendDir = Split-Path -Parent $MyInvocation.MyCommand.Path
$EnvFile = Join-Path $BackendDir ".." ".env"

# Load .env file if it exists
if (Test-Path $EnvFile) {
    Write-Output "Loading environment from $EnvFile ..."
    Get-Content $EnvFile | ForEach-Object {
        $line = $_.Trim()
        if ($line -and -not $line.StartsWith("#") -and $line -match "^([^=]+)=(.*)$") {
            $key = $matches[1].Trim()
            $val = $matches[2].Trim()
            [System.Environment]::SetEnvironmentVariable($key, $val, "Process")
        }
    }
} else {
    Write-Warning ".env file not found at $EnvFile — relying on pre-set environment variables."
}

# Verify critical environment variables are set
$required = @("DB_USERNAME", "DB_PASSWORD", "JWT_SECRET")
foreach ($var in $required) {
    $val = [System.Environment]::GetEnvironmentVariable($var, "Process")
    if (-not $val) {
        Write-Error "FATAL: Required environment variable '$var' is not set. Copy .env.example to .env and fill in values."
        exit 1
    }
}

Write-Output "Environment loaded. Starting all 10 ResilientX services..."

$javaArgs = @(
    "DB_HOST=$($env:DB_HOST)",
    "DB_PORT=$($env:DB_PORT)",
    "DB_NAME=$($env:DB_NAME)",
    "DB_USERNAME=$($env:DB_USERNAME)",
    "DB_PASSWORD=$($env:DB_PASSWORD)",
    "JWT_SECRET=$($env:JWT_SECRET)",
    "MAIL_USERNAME=$($env:MAIL_USERNAME)",
    "MAIL_PASSWORD=$($env:MAIL_PASSWORD)",
    "MAIL_FROM=$($env:MAIL_FROM)",
    "AWS_ENABLED=$($env:AWS_ENABLED)",
    "AWS_DEFAULT_REGION=$($env:AWS_DEFAULT_REGION)"
)

function StartService($name, $jar, $port) {
    Write-Output "Starting $name (:$port)..."
    $envArgs = $javaArgs | ForEach-Object { "-D$_" }
    $allArgs = @("-jar", $jar) + $envArgs
    Start-Process -FilePath "java" -ArgumentList $allArgs -PassThru -NoNewWindow | Out-Null
}

# 1. Eureka Server (must start first)
StartService "eureka-server" "$BackendDir\eureka-server\target\eureka-server-1.0.0.jar" 8761
Write-Output "Waiting 10s for Eureka to initialize..."
Start-Sleep -Seconds 10

# 2. API Gateway
StartService "api-gateway" "$BackendDir\api-gateway\target\api-gateway-1.0.0.jar" 8080
Start-Sleep -Seconds 3

# 3. Identity Service
StartService "identity-service" "$BackendDir\identity-service\target\identity-service-1.0.0.jar" 8081
Start-Sleep -Seconds 3

# 4. Organization Service
StartService "organization-service" "$BackendDir\organization-service\target\organization-service-1.0.0.jar" 8082
Start-Sleep -Seconds 2

# 5. Region Service
StartService "region-service" "$BackendDir\region-service\target\region-service-1.0.0.jar" 8083
Start-Sleep -Seconds 2

# 6. Resilience Policy Service
StartService "resilience-policy-service" "$BackendDir\resilience-policy-service\target\resilience-policy-service-1.0.0.jar" 8084
Start-Sleep -Seconds 2

# 7. Monitoring Service
StartService "monitoring-service" "$BackendDir\monitoring-service\target\monitoring-service-1.0.0.jar" 8085
Start-Sleep -Seconds 2

# 8. Recovery Service
StartService "recovery-service" "$BackendDir\recovery-service\target\recovery-service-1.0.0.jar" 8086
Start-Sleep -Seconds 2

# 9. Data Continuity Service
StartService "data-continuity-service" "$BackendDir\data-continuity-service\target\data-continuity-service-1.0.0.jar" 8087
Start-Sleep -Seconds 2

# 10. Audit Service
StartService "audit-service" "$BackendDir\audit-service\target\audit-service-1.0.0.jar" 8088

Write-Output ""
Write-Output "All 10 ResilientX services launched."
Write-Output "  Eureka Dashboard   : http://localhost:8761"
Write-Output "  API Gateway        : http://localhost:8080"
Write-Output "  Identity Service   : http://localhost:8081"
Write-Output "  Organization Svc   : http://localhost:8082"
Write-Output "  Region Service     : http://localhost:8083"
Write-Output "  Policy Service     : http://localhost:8084"
Write-Output "  Monitoring Service : http://localhost:8085"
Write-Output "  Recovery Service   : http://localhost:8086"
Write-Output "  Data Continuity    : http://localhost:8087"
Write-Output "  Audit Service      : http://localhost:8088"
