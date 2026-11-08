package cn.t93.greenhouse;

import java.nio.file.Path;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.io.TempDir;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.boot.test.web.client.TestRestTemplate;
import org.springframework.http.HttpStatus;
import org.springframework.test.context.DynamicPropertyRegistry;
import org.springframework.test.context.DynamicPropertySource;
import com.fasterxml.jackson.databind.JsonNode;

import static org.assertj.core.api.Assertions.assertThat;

@SpringBootTest(webEnvironment = SpringBootTest.WebEnvironment.RANDOM_PORT)
class GreenhouseSmokeTest {
    @TempDir
    static Path databaseDirectory;

    @Autowired
    private TestRestTemplate http;

    @DynamicPropertySource
    static void database(DynamicPropertyRegistry registry) {
        registry.add("t93.database.path", () -> databaseDirectory.resolve("smoke.db").toString());
    }

    @Test
    void backendDoesNotServeTheFrontendHomepage() {
        assertThat(http.getForEntity("/", String.class).getStatusCode()).isEqualTo(HttpStatus.NOT_FOUND);
    }

    @Test
    void healthQueriesThePinnedSqliteEngine() {
        var response = http.getForEntity("/api/health", JsonNode.class);
        assertThat(response.getStatusCode()).isEqualTo(HttpStatus.OK);
        assertThat(response.getBody().path("status").asText()).isEqualTo("UP");
        assertThat(response.getBody().path("sqliteVersion").asText()).isEqualTo("3.53.4");
        assertThat(databaseDirectory.resolve("smoke.db")).exists();
    }
}
