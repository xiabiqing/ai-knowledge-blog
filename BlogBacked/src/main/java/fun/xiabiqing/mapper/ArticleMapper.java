package fun.xiabiqing.mapper;

import fun.xiabiqing.entity.po.Article;
import com.baomidou.mybatisplus.core.mapper.BaseMapper;
import org.apache.ibatis.annotations.Mapper;

/**
 * <p>
 * 文章表 Mapper 接口
 * </p>
 *
 * @author xiabiqing
 * @since 2026-05-23
 */
@Mapper
public interface ArticleMapper extends BaseMapper<Article> {

}
