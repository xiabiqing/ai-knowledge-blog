package fun.xiabiqing.kafka;

import com.baomidou.mybatisplus.core.conditions.update.LambdaUpdateWrapper;
import fun.xiabiqing.constant.AIConstant;
import fun.xiabiqing.constant.KafkaConstant;
import fun.xiabiqing.entity.dto.UserChatMessageKafka;
import fun.xiabiqing.entity.param.UserChatMessage;
import fun.xiabiqing.entity.po.Conversation;
import fun.xiabiqing.entity.po.ConversationMessage;
import fun.xiabiqing.service.IConversationMessageService;
import fun.xiabiqing.service.IConversationService;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.kafka.annotation.KafkaListener;
import org.springframework.stereotype.Component;

@Slf4j
@Component
public class EmpiricalSearchKafkaListener {
    @Autowired
    private IConversationService conversationService;
    @Autowired
    private IConversationMessageService conversationMessageService;
    @KafkaListener(topics = KafkaConstant.SEARCH_EMPIRICAL_TOPIC,groupId = "blog-knowledge-group")
    public void ArticleSave(UserChatMessageKafka messageKafka) {
        UserChatMessage userChatMessage = messageKafka.getUserChatMessage();
        String reply = messageKafka.getReply();
        String message=userChatMessage.getMessage();
        String conservationId = userChatMessage.getId();
        Boolean isOld = messageKafka.getIsOld();
        try {
            if(isOld){
                conversationService.update(null,new LambdaUpdateWrapper<Conversation>()
                        .setSql("count=count+2")
                        .eq(Conversation::getId,conservationId));
            }
            if(!isOld){
                String title=message;
                if(message.length()>=20){
                    title=message.substring(0,20)+"...";
                }
                Conversation conversation = new Conversation();
                conversation.setId(conservationId);
                conversation.setTitle(title);
                conversation.setCount(2);
                conversationService.save(conversation);
            }
            ConversationMessage conversationMessageUser = new ConversationMessage();
            conversationMessageUser.setConversationId(conservationId);
            conversationMessageUser.setRole(AIConstant.USER_ROLE);
            conversationMessageUser.setContent(message);
            conversationMessageService.save(conversationMessageUser);
            ConversationMessage conversationMessageSystem = new ConversationMessage();
            conversationMessageSystem.setConversationId(conservationId);
            conversationMessageSystem.setRole(AIConstant.SYSTEM_ROLE);
            conversationMessageSystem.setContent(reply);
            conversationMessageService.save(conversationMessageSystem);
        } catch (Exception e) {
           log.error("会话数据库失败，会话id:{}",conservationId,e);
        }
    }
}
