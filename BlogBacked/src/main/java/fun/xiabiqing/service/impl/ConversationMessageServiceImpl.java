package fun.xiabiqing.service.impl;

import fun.xiabiqing.entity.po.ConversationMessage;
import fun.xiabiqing.mapper.ConversationMessageMapper;
import fun.xiabiqing.service.IConversationMessageService;
import com.baomidou.mybatisplus.extension.service.impl.ServiceImpl;
import org.springframework.stereotype.Service;

/**
 * <p>
 * 会话消息表 服务实现类
 * </p>
 *
 * @author xiabiqing
 * @since 2026-06-08
 */
@Service
public class ConversationMessageServiceImpl extends ServiceImpl<ConversationMessageMapper, ConversationMessage> implements IConversationMessageService {

}
