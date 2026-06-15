package fun.xiabiqing.kafka;
import co.elastic.clients.elasticsearch.ElasticsearchClient;
import co.elastic.clients.elasticsearch.core.IndexRequest;
import co.elastic.clients.elasticsearch.core.IndexResponse;
import com.fasterxml.jackson.databind.ObjectMapper; // 💡 引入原生的 ObjectMapper
import fun.xiabiqing.common.EmpiricalKnowledgeType;
import fun.xiabiqing.constant.AIConstant;
import fun.xiabiqing.constant.EsConstant;
import fun.xiabiqing.constant.KafkaConstant;
import fun.xiabiqing.entity.dto.ExperienceCompact;
import fun.xiabiqing.entity.dto.ExperienceExtract;
import fun.xiabiqing.entity.po.EmpiricalKnowledge;
import fun.xiabiqing.service.IEmpiricalKnowledgeService;
import lombok.extern.slf4j.Slf4j;
import org.springframework.ai.chat.model.ChatModel;
import org.springframework.ai.chat.prompt.Prompt;
import org.springframework.ai.chat.prompt.PromptTemplate;
import org.springframework.ai.converter.BeanOutputConverter;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.kafka.annotation.KafkaListener;
import org.springframework.stereotype.Component;

import java.io.IOException;
import java.util.Map;

@Component
@Slf4j
public class ExperienceKafkaListener {
    @Autowired
    private ChatModel chatModel;
    @Autowired
    private ElasticsearchClient EsClient;
    @Autowired
    private IEmpiricalKnowledgeService empiricalKnowledgeService;
    @Autowired
    private ObjectMapper objectMapper;
    @KafkaListener(topics = KafkaConstant.EXPERIENCE_COMPACT_TOPIC, groupId = "blog-knowledge-group")
    public void experienceCompact(ExperienceExtract extract) {
        log.info("【Kafka】消费者收到消息，articleId:{}", extract.getId());
        try {
            BeanOutputConverter<ExperienceCompact> converter = new BeanOutputConverter<>(ExperienceCompact.class);
            PromptTemplate template = new PromptTemplate(AIConstant.AI_EXPERIENCE_COMPACT);
            Prompt prompt = template.create(Map.of(
                    "experience", extract.getExperience(),
                    "format", converter.getFormat(),
                    "types", EmpiricalKnowledgeType.getSupportedTypesForPrompt()
            ));
            // 1. 呼叫大模型
            String response = chatModel.call(prompt).getResult().getOutput().getText();
            log.info("AI生成的内容为：{}", response);
            // 2. 💡 工业级脱壳：手撕 Markdown 语法，提取纯净 JSON
            String cleanJson = cleanMarkdownJson(response);
            // 3. 使用全局最稳定的 ObjectMapper 进行反序列化
            ExperienceCompact convert = objectMapper.readValue(cleanJson, ExperienceCompact.class);
            // 4. 落库 MySQL
            EmpiricalKnowledge empiricalKnowledge = new EmpiricalKnowledge();
            empiricalKnowledge.setArticleIdEmp(extract.getId());
            empiricalKnowledge.setType(convert.getType());
            empiricalKnowledge.setTitle(convert.getTitle());
            empiricalKnowledge.setContent(convert.getContent());
            empiricalKnowledge.setScore(convert.getScore());
            empiricalKnowledgeService.save(empiricalKnowledge);
            log.info("AI生成目标内容保存数据库成功,关联的文章id:{}", extract.getId());
            IndexRequest<Object> request = IndexRequest.of(builder -> builder
                    .index(EsConstant.INDEX_NAME_EMPIRICAL)
                    .id(empiricalKnowledge.getId().toString())
                    .document(empiricalKnowledge));
            try {
                IndexResponse EsResponse = EsClient.index(request);
                log.info("Es中保存成功：{}", EsResponse);
            } catch (IOException e) {
                log.error("Es中保存失败:{}", e.getMessage());
            }

        } catch (Exception e) {
            log.error("【系统灾备】处理大模型消息时发生崩溃，已强制跳过该消息！articleId: {}", extract.getId(), e);
        }
    }

    private String cleanMarkdownJson(String rawText) {
        if (rawText == null) return "{}";
        String clean = rawText.trim();
        if (clean.startsWith("```")) {
            clean = clean.replaceAll("(?s)^```json\\s*", "");
            clean = clean.replaceAll("(?s)^```\\s*", "");
            clean = clean.replaceAll("(?s)\\s*```$", "");
        }
        return clean.trim();
    }
}