package cn.t93.greenhouse;

import java.io.IOException;
import java.nio.file.Files;
import java.nio.file.Path;
import javax.sql.DataSource;
import org.sqlite.SQLiteConfig;
import org.sqlite.SQLiteDataSource;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;

@Configuration(proxyBeanMethods = false)
class DatabaseConfiguration {
    @Bean
    DataSource dataSource(@Value("${t93.database.path}") String databasePath) throws IOException {
        Path database = Path.of(databasePath).toAbsolutePath().normalize();
        Files.createDirectories(database.getParent());

        SQLiteConfig config = new SQLiteConfig();
        config.enforceForeignKeys(true);
        config.setBusyTimeout(3000);
        SQLiteDataSource source = new SQLiteDataSource(config);
        source.setUrl("jdbc:sqlite:" + database);
        return source;
    }
}
