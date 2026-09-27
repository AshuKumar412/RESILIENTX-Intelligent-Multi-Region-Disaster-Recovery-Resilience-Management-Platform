# Multi-stage Dockerfile for ResilientX Microservices
FROM maven:3.9.6-eclipse-temurin-17-alpine AS build
WORKDIR /app
COPY pom.xml .
COPY eureka-server/pom.xml eureka-server/
COPY api-gateway/pom.xml api-gateway/
COPY identity-service/pom.xml identity-service/
COPY organization-service/pom.xml organization-service/
COPY region-service/pom.xml region-service/
COPY resilience-policy-service/pom.xml resilience-policy-service/
COPY monitoring-service/pom.xml monitoring-service/
COPY recovery-service/pom.xml recovery-service/
COPY data-continuity-service/pom.xml data-continuity-service/
COPY audit-service/pom.xml audit-service/

COPY . .
ARG SERVICE_NAME
RUN mvn clean package -pl ${SERVICE_NAME} -am -DskipTests

FROM eclipse-temurin:17-jre-alpine
WORKDIR /app
ARG SERVICE_NAME
COPY --from=build /app/${SERVICE_NAME}/target/*.jar app.jar
EXPOSE 8080 8761 8081 8082 8083 8084 8085 8086 8087 8088
ENTRYPOINT ["java", "-jar", "app.jar"]
