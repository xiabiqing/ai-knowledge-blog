package fun.xiabiqing.controller;
import com.baomidou.mybatisplus.core.metadata.IPage;
import com.baomidou.mybatisplus.extension.plugins.pagination.Page;
import fun.xiabiqing.common.BaseResponse;
import fun.xiabiqing.common.ErrorCode;
import fun.xiabiqing.common.ResultUtils;
import fun.xiabiqing.entity.dto.AICompleteArticle;
import fun.xiabiqing.entity.param.ArticleAddParam;
import fun.xiabiqing.entity.param.ArticleUpdateParam;
import fun.xiabiqing.entity.param.UserChatMessage;
import fun.xiabiqing.entity.po.Article;
import fun.xiabiqing.entity.vo.ArticleCardVO;
import fun.xiabiqing.entity.vo.ArticleVO;
import fun.xiabiqing.exception.BusinessException;
import fun.xiabiqing.service.IArticleService;
import fun.xiabiqing.utils.ToolsChatAgent;
import io.minio.errors.*;
import jakarta.validation.Valid;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import org.springframework.beans.BeanUtils;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.validation.annotation.Validated;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;
import java.io.IOException;
import java.security.InvalidKeyException;
import java.security.NoSuchAlgorithmException;

/**
 * <p>
 * 文章表 前端控制器
 * </p>
 *
 * @author xiabiqing
 * @since 2026-05-23
 */
@RestController
@RequestMapping("/article")
@CrossOrigin(origins = "http://localhost:3000", allowCredentials = "true")
@Validated
public class ArticleController {
    @Autowired
    private IArticleService articleService;
    @Autowired
    private ToolsChatAgent toolsChatAgent;
    @PostMapping("/add")
    BaseResponse<Boolean> addArticle(@Valid @RequestBody ArticleAddParam param) throws ServerException, InsufficientDataException, ErrorResponseException, IOException, NoSuchAlgorithmException, InvalidKeyException, InvalidResponseException, XmlParserException, InternalException {
        return ResultUtils.success(articleService.createArticle(param));
    }
    @PostMapping("/upload/only")
    BaseResponse<String> uploadFile(@RequestParam("file") MultipartFile file) {
        return ResultUtils.success(articleService.uploadFile(file));
    }

    @DeleteMapping("/delete")
    BaseResponse<Boolean> deleteArticle(@NotNull(message = "删除文章异常") @RequestParam("articleId") Integer articleId) {
        boolean result = articleService.removeById(articleId);
        return ResultUtils.success(result);
    }
    @GetMapping("/get")
    BaseResponse<ArticleVO> getArticle(@NotNull(message = "查询文章异常") @RequestParam("articleId") Integer articleId) {
        Article article = articleService.getById(articleId);
        ArticleVO articleVO = new ArticleVO(article);
        return ResultUtils.success(articleVO);
    }
    @PostMapping("/update")
    BaseResponse<Boolean> updateArticle(@Valid @RequestBody ArticleUpdateParam param) {
        if (param.getId() == null) {
            throw new BusinessException(ErrorCode.PARAM_NULL);
        }
        Article article = new Article();
        article.setId(param.getId());
        article.setTitle(param.getTitle());
        article.setDescription(param.getDescription());
        article.setExperience(param.getExperience());
        boolean result = articleService.updateById(article);
        return ResultUtils.success(result);
    }
    @GetMapping("/list")
    BaseResponse<IPage<ArticleCardVO>> listArticle(@RequestParam(value = "current",defaultValue = "1")Long current,
                                            @RequestParam(value = "size",defaultValue = "10") Long size) {
        Page<Article> page = new Page<>(current, size);
        Page<Article> articlePage = articleService.lambdaQuery().orderByDesc(Article::getUpdatetime).page(page);
        IPage<ArticleCardVO> result = articlePage.convert(article -> {
            ArticleCardVO articleCardVO = new ArticleCardVO();
            BeanUtils.copyProperties(article, articleCardVO);
            return articleCardVO;
        });
        return ResultUtils.success(result);
    }
    @GetMapping("AI/complete/article")
    BaseResponse<AICompleteArticle> completeArticle(@NotBlank(message = "AI自动补全失败") @RequestParam("imageURL") String imageURL){
        return ResultUtils.success(articleService.completeArticle(imageURL));
    }
    @PostMapping("AI/chat/Agent")

    BaseResponse<String> AiChatAgent(@Valid @RequestBody UserChatMessage userChatMessage){
        String result = toolsChatAgent.adminAgentChat(userChatMessage);
        return ResultUtils.success(result);
    }
    @GetMapping("/empirical/getArticle")
    BaseResponse<ArticleVO> getByEmpiricalToArticle(@RequestParam("id") Integer id) {
        Article article = articleService.getById(id);
        ArticleVO articleVO = new ArticleVO(article);
        return ResultUtils.success(articleVO);
    }

}
