package fun.xiabiqing.entity.param;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Size;
import lombok.Data;

import java.io.Serializable;

/**
 * <p>
 * 文章表
 * </p>
 *
 * @author xiabiqing
 * @since 2026-05-23
 */
@Data
public class ArticleUpdateParam implements Serializable {
    @NotNull
    private Integer id;
    /**
     * 标题
     */
    @NotBlank
    @Size(max = 100,message = "文章标题不能超过100个字")
    private String title;

    private String sourceFilePath;

    /**
     * 问题描述
     */
    @NotBlank
    @Size(max = 1000,message = "文章描述不能超过1000个字")
    private String description;

    /**
     * 学习精华
     */
    @NotBlank
    @Size(max = 1000,message = "学习精华总结不能超过1000个字")
    private String experience;


}
