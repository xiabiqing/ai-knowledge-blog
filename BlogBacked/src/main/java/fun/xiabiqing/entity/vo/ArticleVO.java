package fun.xiabiqing.entity.vo;

import fun.xiabiqing.entity.po.Article;
import lombok.AllArgsConstructor;
import lombok.Data;

import java.time.LocalDateTime;
@Data
@AllArgsConstructor
public class ArticleVO {
    private Integer id;
    /**
     * 标题
     */
    private String title;

    /**
     * 源文件路径
     */
    private String sourceFilePath;

    /**
     * 问题描述
     */
    private String description;

    /**
     * 学习精华
     */
    private String experience;
    /**
     * 更新时间
     */
    private LocalDateTime updatetime;
    public ArticleVO(Article article) {
        this.id = article.getId();
        this.title = article.getTitle();
        this.sourceFilePath = article.getSourceFilePath();
        this.description = article.getDescription();
        this.experience = article.getExperience();
        this.updatetime = article.getUpdatetime();
    }
}
