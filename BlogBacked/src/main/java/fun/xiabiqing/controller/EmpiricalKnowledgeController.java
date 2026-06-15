package fun.xiabiqing.controller;


import co.elastic.clients.elasticsearch.ElasticsearchClient;
import co.elastic.clients.elasticsearch._types.SortOrder;
import co.elastic.clients.elasticsearch.core.SearchRequest;
import co.elastic.clients.elasticsearch.core.SearchResponse;
import co.elastic.clients.elasticsearch.core.search.CompletionSuggestOption;
import co.elastic.clients.elasticsearch.core.search.Suggestion;
import com.baomidou.mybatisplus.core.conditions.update.LambdaUpdateWrapper;
import com.baomidou.mybatisplus.core.metadata.IPage;
import com.baomidou.mybatisplus.extension.plugins.pagination.Page;
import fun.xiabiqing.common.BaseResponse;
import fun.xiabiqing.common.ErrorCode;
import fun.xiabiqing.common.ResultUtils;
import fun.xiabiqing.config.EsClientConfig;
import fun.xiabiqing.constant.EsConstant;
import fun.xiabiqing.entity.param.UserChatMessage;
import fun.xiabiqing.entity.po.Article;
import fun.xiabiqing.entity.po.EmpiricalKnowledge;
import fun.xiabiqing.entity.vo.EmpiricalKnowledgeCard;
import fun.xiabiqing.service.IEmpiricalKnowledgeService;
import fun.xiabiqing.utils.ToolsChatAgent;
import jakarta.validation.Valid;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import lombok.extern.slf4j.Slf4j;
import org.springframework.ai.chat.memory.ChatMemory;
import org.springframework.ai.chat.model.ChatModel;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.kafka.core.KafkaTemplate;
import org.springframework.validation.annotation.Validated;
import org.springframework.web.bind.annotation.*;

import java.io.IOException;
import java.util.ArrayList;
import java.util.Collections;
import java.util.List;
import java.util.Set;
import java.util.stream.Collectors;

/**
 * <p>
 * 学习精华表 前端控制器
 * </p>
 *
 * @author xiabiqing
 * @since 2026-05-30
 */
@Slf4j
@RestController
@RequestMapping("/empirical-knowledge")
@Validated
@CrossOrigin(origins = "http://localhost:3000", allowCredentials = "true")
public class EmpiricalKnowledgeController {
    @Autowired
    private IEmpiricalKnowledgeService empiricalKnowledgeService;
    @Autowired
    private ElasticsearchClient EsClient;
    @Autowired
    private ToolsChatAgent toolsChatAgent;

    @GetMapping("/listAll")
    BaseResponse<IPage<EmpiricalKnowledgeCard>> getAllEmpiricalKnowledge(@RequestParam(value = "current",defaultValue = "1") Integer current,@RequestParam(value = "size",defaultValue = "10") Integer size) {
        Page<EmpiricalKnowledge> empiricalKnowledgePage = new Page<>(current,size);
        Page<EmpiricalKnowledge> page = empiricalKnowledgeService.lambdaQuery().orderByDesc(EmpiricalKnowledge::getUpdatetime).page(empiricalKnowledgePage);
        IPage<EmpiricalKnowledgeCard> result = page.convert(p -> {
            EmpiricalKnowledgeCard empiricalKnowledgeCard = new EmpiricalKnowledgeCard();
            empiricalKnowledgeCard.setArticleIdEmp(p.getArticleIdEmp());
            empiricalKnowledgeCard.setId(p.getId());
            empiricalKnowledgeCard.setType(p.getType());
            empiricalKnowledgeCard.setTitle(p.getTitle());
            empiricalKnowledgeCard.setScore(p.getScore());
            empiricalKnowledgeCard.setFrequency(p.getFrequency());
            empiricalKnowledgeCard.setUpdateTime(p.getUpdatetime());
            return empiricalKnowledgeCard;
        });
    return ResultUtils.success(result);
    }
    @GetMapping("/getEmpiricalKnowledge")
    BaseResponse<String> getEmpiricalKnowledge(@NotNull(message = "查询学习精华出错") @RequestParam(value = "id") Integer id) {
        EmpiricalKnowledge result = empiricalKnowledgeService.getById(id);
        empiricalKnowledgeService.update(null,new LambdaUpdateWrapper<EmpiricalKnowledge>().setSql("frequency=frequency+1").eq(EmpiricalKnowledge::getId, id));
        return ResultUtils.success(result.getContent());
    }
    @GetMapping("/search")
    BaseResponse<Page<EmpiricalKnowledgeCard>> searchEmpirical(@NotBlank(message = "搜索不能为空") @RequestParam("query")String query,@RequestParam(value = "current",defaultValue = "1") Integer current,@RequestParam(value = "size",defaultValue = "10") Integer size) {
        Page<EmpiricalKnowledgeCard> cardPage = empiricalKnowledgeService.searchEmpirical(query, current, size);
        return ResultUtils.success(cardPage);
    }
    @GetMapping("/suggest")
    BaseResponse<List<String>> suggest(@RequestParam("prefix") String prefix) {
        SearchRequest request = SearchRequest.of(builder -> builder.index(EsConstant.INDEX_NAME_EMPIRICAL)
                .suggest(suggest -> suggest.suggesters(EsConstant.EMPIRICAL_SUGGEST, s -> s
                        .prefix(prefix)
                        .completion(c -> c.field("suggestions")
                                .skipDuplicates(true)
                                .size(10)))));
        try {
            SearchResponse<EmpiricalKnowledge> search = EsClient.search(request, EmpiricalKnowledge.class);
            List<Suggestion<EmpiricalKnowledge>> suggestionList = search.suggest().get(EsConstant.EMPIRICAL_SUGGEST);
            if(suggestionList.isEmpty()) {
                return ResultUtils.success(Collections.emptyList());
            }
            List<String> result = suggestionList.get(0).completion().options().stream()
                    .map(CompletionSuggestOption::text)
                    .distinct()
                    .toList();
            return ResultUtils.success(result);
        } catch (IOException e) {
            return ResultUtils.error(500020,"补全服务暂时不可用",e.getMessage());
        }
    }
    @PostMapping("/AI/chat/Agent")
    public BaseResponse<String> AiSmartSearch(@Valid @RequestBody UserChatMessage userChatMessage) {
        String reply = toolsChatAgent.userAgentChat(userChatMessage);
        return ResultUtils.success(reply);
    }


}
