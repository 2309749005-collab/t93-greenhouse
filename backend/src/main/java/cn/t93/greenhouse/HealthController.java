package cn.t93.greenhouse;

import java.util.Map;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.dao.DataAccessException;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.jdbc.core.JdbcTemplate;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
class HealthController {
    private static final Logger log = LoggerFactory.getLogger(HealthController.class);
    private final JdbcTemplate database;

    HealthController(JdbcTemplate database) {
        this.database = database;
    }

    @GetMapping("/api/health")
    ResponseEntity<Map<String, String>> health() {
        try {
            String version = database.queryForObject("SELECT sqlite_version()", String.class);
            return ResponseEntity.ok(Map.of("status", "UP", "service", "t93-greenhouse", "sqliteVersion", version));
        } catch (DataAccessException exception) {
            log.warn("SQLite health check failed", exception);
            return ResponseEntity.status(HttpStatus.SERVICE_UNAVAILABLE)
                    .body(Map.of("status", "DOWN", "service", "t93-greenhouse", "error", "DATABASE_UNAVAILABLE"));
        }
    }
}
