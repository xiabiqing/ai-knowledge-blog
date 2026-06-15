package fun.xiabiqing.mapper;

import fun.xiabiqing.entity.po.ConversationMessage;
import com.baomidou.mybatisplus.core.mapper.BaseMapper;
import org.apache.ibatis.annotations.Mapper;

/**
 * <p>
 * 会话消息表 Mapper 接口
 * </p>
 *
 * @author xiabiqing
 * @since 2026-06-08
 */
@Mapper
public interface ConversationMessageMapper extends BaseMapper<ConversationMessage> {

}
