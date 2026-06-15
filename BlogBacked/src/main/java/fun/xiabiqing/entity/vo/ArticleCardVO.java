package fun.xiabiqing.entity.vo;

import lombok.Data;

import java.time.LocalDateTime;
@Data
public class ArticleCardVO {
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
     * 更新时间
     */
    private LocalDateTime updatetime;
}
