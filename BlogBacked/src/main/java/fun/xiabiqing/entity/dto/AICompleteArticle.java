package fun.xiabiqing.entity.dto;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@NoArgsConstructor
public class AICompleteArticle {
    /**
     * 标题
     */
    private String title;
    /**
     * 问题描述
     */
    private String description;

    /**
     * 学习精华
     */
    private String experience;

}
