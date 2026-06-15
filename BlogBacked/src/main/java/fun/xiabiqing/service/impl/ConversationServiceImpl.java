package fun.xiabiqing.service.impl;

import fun.xiabiqing.entity.po.Conversation;
import fun.xiabiqing.mapper.ConversationMapper;
import fun.xiabiqing.service.IConversationService;
import com.baomidou.mybatisplus.extension.service.impl.ServiceImpl;
import org.springframework.stereotype.Service;

/**
 * <p>
 * 会话表 服务实现类
 * </p>
 *
 * @author xiabiqing
 * @since 2026-06-08
 */
@Service
public class ConversationServiceImpl extends ServiceImpl<ConversationMapper, Conversation> implements IConversationService {

}
