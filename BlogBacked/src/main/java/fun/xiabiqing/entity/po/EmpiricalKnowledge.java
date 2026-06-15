package fun.xiabiqing.entity.po;

import com.baomidou.mybatisplus.annotation.TableLogic;
import com.baomidou.mybatisplus.annotation.TableName;
import com.baomidou.mybatisplus.annotation.IdType;
import com.baomidou.mybatisplus.annotation.TableId;
import java.time.LocalDateTime;
import java.io.Serializable;

import fun.xiabiqing.entity.dto.ExperienceCompact;
import lombok.Builder;
import lombok.Data;
import lombok.EqualsAndHashCode;
import lombok.NoArgsConstructor;
import lombok.experimental.Accessors;

/**
 * <p>
 * 学习精华表
 * </p>
 *
 * @author xiabiqing
 * @since 2026-05-30
 */
@Data
@NoArgsConstructor
@EqualsAndHashCode(callSuper = false)
@Accessors(chain = true)
@TableName("empirical_knowledge")
public class EmpiricalKnowledge implements Serializable {

    private static final long serialVersionUID = 1L;

    @TableId(value = "id", type = IdType.AUTO)
    private Integer id;

    /**
     * 外键关联文章id
     */
    private Integer articleIdEmp;

    /**
     * 类型
     */
    private String type;

    private String title;

    private String content;

    /**
     * 频率
     */
    private Integer frequency;

    /**
     * AI价值评分
     */
    private Integer score;

    private LocalDateTime createtime;

    private LocalDateTime updatetime;
    @TableLogic
    private Integer isDelete;
    public EmpiricalKnowledge(ExperienceCompact experienceCompact) {
        this.type=experienceCompact.getType();
        this.title = experienceCompact.getTitle();
        this.content = experienceCompact.getContent();
        this.score = experienceCompact.getScore();
    }


}
