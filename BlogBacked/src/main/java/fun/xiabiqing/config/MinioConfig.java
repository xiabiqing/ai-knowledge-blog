package fun.xiabiqing.config;

import io.minio.MinioClient;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;

@Configuration
public class MinioConfig {
    @Value("${minio.endpoint:localhost}")
    private String endpoint;
    @Value("${minio.port:9000}")
    private int port;
    @Value("${minio.access-key:minioadmin}")
    private String accessKey;
    @Value("${minio.secret-key:minioadmin}")
    private String secretKey;

    @Bean
    public MinioClient minioClient() {
        return MinioClient.builder()
                .credentials(accessKey, secretKey)
                .endpoint(endpoint, port, false)
                .build();
    }
}
