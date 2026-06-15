package fun.xiabiqing.service.impl;

import co.elastic.clients.elasticsearch.ElasticsearchClient;
import co.elastic.clients.elasticsearch._types.SortOrder;
import co.elastic.clients.elasticsearch.core.SearchRequest;
import co.elastic.clients.elasticsearch.core.SearchResponse;
import com.baomidou.mybatisplus.extension.plugins.pagination.Page;
import fun.xiabiqing.common.ResultUtils;
import fun.xiabiqing.constant.EsConstant;
import fun.xiabiqing.entity.po.EmpiricalKnowledge;
import fun.xiabiqing.entity.vo.EmpiricalKnowledgeCard;
import fun.xiabiqing.mapper.EmpiricalKnowledgeMapper;
import fun.xiabiqing.service.IEmpiricalKnowledgeService;
import com.baomidou.mybatisplus.extension.service.impl.ServiceImpl;
import lombok.AllArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.io.IOException;
import java.util.List;
import java.util.stream.Collectors;

/**
 * <p>
 * 学习精华表 服务实现类
 * </p>
 *
 * @author xiabiqing
 * @since 2026-05-30
 */
@Service
@Slf4j
public class EmpiricalKnowledgeServiceImpl extends ServiceImpl<EmpiricalKnowledgeMapper, EmpiricalKnowledge> implements IEmpiricalKnowledgeService {
    @Autowired
    private ElasticsearchClient EsClient;
    @Override
    public Page<EmpiricalKnowledgeCard> searchEmpirical(String query, Integer current, Integer size) {
        try {
            SearchRequest request = SearchRequest.of(builder -> builder.index(EsConstant.INDEX_NAME_EMPIRICAL)
                    .from((current-1)*size)
                    .size(size)
                    .query(q -> q.multiMatch(mul -> mul.fields("title", "content")
                            .query(query.toString())))
                    .sort(s -> s.score(s1 -> s1.order(SortOrder.Desc))));

            SearchResponse<EmpiricalKnowledge> response = EsClient.search(request, EmpiricalKnowledge.class);
            List<EmpiricalKnowledgeCard> SearchCards = response.hits().hits().stream().map(rs -> {
                EmpiricalKnowledge source = rs.source();
                EmpiricalKnowledgeCard card = new EmpiricalKnowledgeCard();
                card.setId(source.getId());
                card.setTitle(source.getTitle());
                card.setType(source.getType());
                card.setContent(source.getContent());
                card.setScore(source.getScore());
                card.setFrequency(source.getFrequency());
                card.setUpdateTime(source.getUpdatetime());
                return card;
            }).collect(Collectors.toList());
            long total =response.hits().total()==null?0 : response.hits().total().value();
            Page<EmpiricalKnowledgeCard> cardPage = new Page<>(current, size, total);
            Page<EmpiricalKnowledgeCard> page = cardPage.setRecords(SearchCards);
            return page;
        } catch (IOException e) {
            log.info("搜索失败：{}",e.getMessage());
            throw new RuntimeException("搜索服务暂时不可用");
        }
    }
}
