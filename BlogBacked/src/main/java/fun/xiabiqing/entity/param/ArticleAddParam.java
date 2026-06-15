package fun.xiabiqing.entity.param;

import com.baomidou.mybatisplus.annotation.IdType;
import com.baomidou.mybatisplus.annotation.TableId;
import com.baomidou.mybatisplus.annotation.TableName;
import jakarta.validation.constraints.Max;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.EqualsAndHashCode;
import lombok.experimental.Accessors;

import java.io.Serializable;
import java.time.LocalDateTime;

/**
 * <p>
 * 文章表
 * </p>
 *
 * @author xiabiqing
 * @since 2026-05-23
 */
@Data
@AllArgsConstructor
public class ArticleAddParam implements Serializable {
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
