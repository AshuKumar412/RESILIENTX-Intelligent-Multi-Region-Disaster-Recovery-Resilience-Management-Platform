# ResilientX Background Microservices Launcher
Set-Location "c:\Users\HP\Documents\AWS Updated\backend"

Write-Output "1/10 Starting eureka-server (:8761)..."
Start-Process "javaw" -ArgumentList "-jar eureka-server\target\eureka-server-1.0.0.jar"
Start-Sleep -Seconds 6

Write-Output "2/10 Starting api-gateway (:8080)..."
Start-Process "javaw" -ArgumentList "-jar api-gateway\target\api-gateway-1.0.0.jar"
Start-Sleep -Seconds 3

Write-Output "3/10 Starting identity-service (:8081)..."
Start-Process "javaw" -ArgumentList "-jar identity-service\target\identity-service-1.0.0.jar"
Start-Sleep -Seconds 3

Write-Output "4/10 Starting organization-service (:8082)..."
Start-Process "javaw" -ArgumentList "-jar organization-service\target\organization-service-1.0.0.jar"
Start-Sleep -Seconds 2

Write-Output "5/10 Starting region-service (:8083)..."
Start-Process "javaw" -ArgumentList "-jar region-service\target\region-service-1.0.0.jar"
Start-Sleep -Seconds 2

Write-Output "6/10 Starting resilience-policy-service (:8084)..."
Start-Process "javaw" -ArgumentList "-jar resilience-policy-service\target\resilience-policy-service-1.0.0.jar"
Start-Sleep -Seconds 2

Write-Output "7/10 Starting monitoring-service (:8085)..."
Start-Process "javaw" -ArgumentList "-jar monitoring-service\target\monitoring-service-1.0.0.jar"
Start-Sleep -Seconds 2

Write-Output "8/10 Starting recovery-service (:8086)..."
Start-Process "javaw" -ArgumentList "-jar recovery-service\target\recovery-service-1.0.0.jar"
Start-Sleep -Seconds 2

Write-Output "9/10 Starting data-continuity-service (:8087)..."
Start-Process "javaw" -ArgumentList "-jar data-continuity-service\target\data-continuity-service-1.0.0.jar"
Start-Sleep -Seconds 2

Write-Output "10/10 Starting audit-service (:8088)..."
Start-Process "javaw" -ArgumentList "-jar audit-service\target\audit-service-1.0.0.jar"

Write-Output "All 10 services triggered with javaw."
