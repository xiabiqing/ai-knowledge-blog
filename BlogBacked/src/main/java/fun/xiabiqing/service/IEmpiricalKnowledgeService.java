package fun.xiabiqing.service;

import com.baomidou.mybatisplus.extension.plugins.pagination.Page;
import fun.xiabiqing.entity.po.EmpiricalKnowledge;
import com.baomidou.mybatisplus.extension.service.IService;
import fun.xiabiqing.entity.vo.EmpiricalKnowledgeCard;
import jakarta.validation.constraints.NotBlank;

/**
 * <p>
 * 学习精华表 服务类
 * </p>
 *
 * @author xiabiqing
 * @since 2026-05-30
 */
public interface IEmpiricalKnowledgeService extends IService<EmpiricalKnowledge> {

    Page<EmpiricalKnowledgeCard> searchEmpirical(@NotBlank(message = "搜索不能为空") String query, Integer current, Integer size);
}
