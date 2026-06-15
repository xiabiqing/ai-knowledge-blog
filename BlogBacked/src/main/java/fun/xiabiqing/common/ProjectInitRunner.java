package fun.xiabiqing.common;
import co.elastic.clients.elasticsearch.ElasticsearchClient;
import co.elastic.clients.elasticsearch.indices.CreateIndexRequest;
import co.elastic.clients.elasticsearch.indices.CreateIndexResponse;
import fun.xiabiqing.constant.EsConstant;
import fun.xiabiqing.constant.MysqlConstant;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.CommandLineRunner;
import org.springframework.dao.DataAccessException;
import org.springframework.jdbc.core.JdbcTemplate;
import org.springframework.stereotype.Component;
import lombok.extern.slf4j.Slf4j;

import java.io.ByteArrayInputStream;
import java.io.IOException;

@Slf4j
@Component
public class ProjectInitRunner implements CommandLineRunner {
    @Autowired
    private ElasticsearchClient EsClient;
    @Autowired
    private JdbcTemplate jdbcTemplate;
    @Override
    public void run(String... args) throws Exception {
        log.info("【系统初始化】开始执行一次性任务...");
        log.info("初始化Mysql数据库服务");
        try {
            jdbcTemplate.execute(MysqlConstant.INIT_ENVIRONMENT);
        } catch (DataAccessException e) {
            log.error("数据库初始化失败：{}",e.getMessage());
        }
        log.info("初始化Mysql数据库服务结束");
        log.info("初始化Es的索引服务");
        try(ByteArrayInputStream inputStream = new ByteArrayInputStream(EsConstant.CREATE_INDEX_EMPIRICAL_KNOWLEDGE.getBytes())) {
            CreateIndexRequest request = CreateIndexRequest.of(builder -> builder.index(EsConstant.INDEX_NAME_EMPIRICAL)
                    .withJson(inputStream));
            CreateIndexResponse response = EsClient.indices().create(request);
            log.info("创建成功：{}",response.acknowledged());
        } catch (IOException e) {
            log.error("创建失败：{}",e.getMessage());
        }
        log.info("初始化Es索引任务成功");
        log.info("【系统初始化】一次性任务执行完毕！");
    }
}