package com.resilientx.gateway;

import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;
import org.springframework.cloud.client.discovery.EnableDiscoveryClient;
import org.springframework.cloud.gateway.filter.GlobalFilter;
import org.springframework.context.annotation.Bean;
import org.springframework.http.server.reactive.ServerHttpRequest;
import reactor.core.publisher.Mono;

import java.util.UUID;

@SpringBootApplication
@EnableDiscoveryClient
public class ApiGatewayApplication {

    public static final String CORRELATION_ID_HEADER = "X-Correlation-ID";

    public static void main(String[] args) {
        SpringApplication.run(ApiGatewayApplication.class, args);
    }

    @Bean
    public GlobalFilter correlationIdFilter() {
        return (exchange, chain) -> {
            ServerHttpRequest request = exchange.getRequest();
            String correlationId = request.getHeaders().getFirst(CORRELATION_ID_HEADER);
            if (correlationId == null || correlationId.isBlank()) {
                correlationId = "RX-" + UUID.randomUUID().toString().substring(0, 8).toUpperCase();
            }

            ServerHttpRequest modifiedRequest = request.mutate()
                    .header(CORRELATION_ID_HEADER, correlationId)
                    .build();

            String finalCorrelationId = correlationId;
            exchange.getResponse().beforeCommit(() -> {
                if (!exchange.getResponse().getHeaders().containsKey(CORRELATION_ID_HEADER)) {
                    exchange.getResponse().getHeaders().add(CORRELATION_ID_HEADER, finalCorrelationId);
                }
                return Mono.empty();
            });

            return chain.filter(exchange.mutate().request(modifiedRequest).build());
        };
    }
}
