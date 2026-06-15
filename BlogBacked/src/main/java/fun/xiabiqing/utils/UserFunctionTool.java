package fun.xiabiqing.utils;

import com.baomidou.mybatisplus.extension.plugins.pagination.Page;
import fun.xiabiqing.entity.vo.EmpiricalKnowledgeCard;
import fun.xiabiqing.service.IEmpiricalKnowledgeService;
import io.minio.errors.*;
import org.springframework.ai.tool.annotation.Tool;
import org.springframework.ai.tool.annotation.ToolParam;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Component;

import java.io.IOException;
import java.security.InvalidKeyException;
import java.security.NoSuchAlgorithmException;
@Component
public class UserFunctionTool {
    @Autowired
    private IEmpiricalKnowledgeService empiricalKnowledgeService;
    @Tool(name = "searchEmpirical", description = "搜索内部经验知识库。当用户遇到技术问题、报错、或者询问相关经验时，必须调用此工具提取核心关键词进行搜索")
    public String searchEmpirical(
            @ToolParam(description = "提取出的核心搜索关键词，多个关键词可用空格隔开")String query
    ) throws ServerException, InsufficientDataException, ErrorResponseException, IOException, NoSuchAlgorithmException, InvalidKeyException, InvalidResponseException, XmlParserException, InternalException {
        Page<EmpiricalKnowledgeCard> cardPage = empiricalKnowledgeService.searchEmpirical(query, 1, 3);
        if(cardPage==null||cardPage.getRecords()==null|| cardPage.getRecords().isEmpty()){
            return "知识库中未找到与【" + query + "】相关的经验，请基于你的通用基础知识为用户解答。";
        }
        StringBuilder sb = new StringBuilder();
        sb.append("以下是为您检索到的相关内部经验参考资料：\\n\\n");
        for (EmpiricalKnowledgeCard card : cardPage.getRecords()) {
            sb.append("【标题】：").append(card.getTitle()).append("\n");
            String content = card.getContent();
            if(content.length()>150){
                content = content.substring(0,150)+"...";
            }
            sb.append("【核心内容】：").append(content).append("\n");
            sb.append("----------\n");
        }
        return sb.toString();
    }
}
