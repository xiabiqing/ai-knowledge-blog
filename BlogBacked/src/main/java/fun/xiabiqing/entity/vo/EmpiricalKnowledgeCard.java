package fun.xiabiqing.entity.vo;

import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;
@Data
@NoArgsConstructor
public class EmpiricalKnowledgeCard {
    private Integer id;
    private Integer articleIdEmp;
    /**
     * 标题
     */
    private String title;
    /**
     * 类型
     */
    private String type;
    /**
     * 内容
     */
    private String content;
    /**
     * AI打分
     */
    private Integer score;
    /**
     * 点击频率
     */
    private Integer frequency;
    /**
     * 更新时间
     */
    private LocalDateTime updateTime;
}
