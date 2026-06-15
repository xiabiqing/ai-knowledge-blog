package fun.xiabiqing.entity.po;

import com.baomidou.mybatisplus.annotation.TableName;
import com.baomidou.mybatisplus.annotation.IdType;
import java.time.LocalDateTime;
import com.baomidou.mybatisplus.annotation.TableId;
import java.io.Serializable;
import lombok.Data;
import lombok.EqualsAndHashCode;
import lombok.experimental.Accessors;

/**
 * <p>
 * 会话消息表
 * </p>
 *
 * @author xiabiqing
 * @since 2026-06-08
 */
@Data
@EqualsAndHashCode(callSuper = false)
@Accessors(chain = true)
@TableName("conversation_message")
public class ConversationMessage implements Serializable {

    private static final long serialVersionUID = 1L;

    @TableId(value = "id", type = IdType.AUTO)
    private Long id;

    private String conversationId;

    /**
     * 角色
     */
    private String role;

    /**
     * 内容
     */
    private String content;

    private LocalDateTime createtime;

    private LocalDateTime updatetime;


}
