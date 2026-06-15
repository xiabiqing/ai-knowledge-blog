package fun.xiabiqing.utils;
import fun.xiabiqing.constant.AIConstant;
import fun.xiabiqing.constant.KafkaConstant;
import fun.xiabiqing.entity.dto.UserChatMessageKafka;
import fun.xiabiqing.entity.param.UserChatMessage;
import org.springframework.ai.chat.client.ChatClient;
import org.springframework.ai.chat.client.advisor.MessageChatMemoryAdvisor;
import org.springframework.ai.chat.memory.ChatMemory;
import org.springframework.ai.chat.model.ChatModel;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.kafka.core.KafkaTemplate;
import org.springframework.stereotype.Component;
import org.springframework.util.StringUtils;
import java.util.UUID;

@Component
public class ToolsChatAgent {
    @Autowired
    private KafkaTemplate<String,Object> kafkaTemplate;
    @Autowired
    private ChatModel chatModel;
    @Autowired
    private ChatMemory chatMemory;
    @Autowired
    private AdminFunctionTool adminFunctionTool;
    @Autowired
    private UserFunctionTool userFunctionTool;
    public String adminAgentChat(UserChatMessage userChatMessage) {
        String id = userChatMessage.getId();
        boolean isOld = StringUtils.hasText(id);
        if(!isOld){
            id=UUID.randomUUID().toString();
        }
        String reply = ChatClient.create(chatModel)
                .prompt()
                .system(AIConstant.AI_AGENT)
                .user(userChatMessage.getMessage())
                .tools(adminFunctionTool)
                .advisors(new MessageChatMemoryAdvisor(chatMemory,id, 10))
                .call()
                .content();
        userChatMessage.setId(id);
        kafkaTemplate.send(KafkaConstant.ARTICLE_SAVE_TOPIC,new UserChatMessageKafka(userChatMessage,reply,isOld));
        return id+"|||"+reply;
    }
    public String userAgentChat(UserChatMessage userChatMessage) {
        String id = userChatMessage.getId();
        boolean isOld = StringUtils.hasText(id);
        if(!isOld){
            id=UUID.randomUUID().toString();
        }
        String reply = ChatClient.create(chatModel)
                .prompt()
                .system(AIConstant.AI_SEARCH_AGENT)
                .user(userChatMessage.getMessage())
                .tools(userFunctionTool)
                .advisors(new MessageChatMemoryAdvisor(chatMemory,id, 10))
                .call()
                .content();
        userChatMessage.setId(id);
        kafkaTemplate.send(KafkaConstant.SEARCH_EMPIRICAL_TOPIC,new UserChatMessageKafka(userChatMessage,reply,isOld));
        return id+"|||"+reply;
    }


}
