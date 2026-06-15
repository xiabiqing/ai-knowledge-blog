package fun.xiabiqing.entity.po;

import com.baomidou.mybatisplus.annotation.TableLogic;
import com.baomidou.mybatisplus.annotation.TableName;
import com.baomidou.mybatisplus.annotation.IdType;
import java.time.LocalDateTime;
import com.baomidou.mybatisplus.annotation.TableId;
import java.io.Serializable;
import lombok.Data;
import lombok.EqualsAndHashCode;
import lombok.Getter;
import lombok.experimental.Accessors;
import org.springframework.web.bind.annotation.GetMapping;

/**
 * <p>
 * 会话表
 * </p>
 *
 * @author xiabiqing
 * @since 2026-06-08
 */
@Data
@EqualsAndHashCode(callSuper = false)
@Accessors(chain = true)
@TableName("conversation")
public class Conversation implements Serializable {

    private static final long serialVersionUID = 1L;

    @TableId(value = "id")
    private String id;

    /**
     * 标题
     */
    private String title;

    /**
     * 消息数量
     */
    private Integer count;

    /**
     * 创建时间
     */
    private LocalDateTime createtime;

    private LocalDateTime updatetime;
    @TableLogic
    private Integer isDelete;



}
