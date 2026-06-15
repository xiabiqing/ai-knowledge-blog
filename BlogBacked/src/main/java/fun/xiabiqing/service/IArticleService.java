package fun.xiabiqing.service;
import fun.xiabiqing.entity.dto.AICompleteArticle;
import fun.xiabiqing.entity.param.ArticleAddParam;
import fun.xiabiqing.entity.param.UserChatMessage;
import fun.xiabiqing.entity.po.Article;
import com.baomidou.mybatisplus.extension.service.IService;
import io.minio.errors.*;
import org.springframework.web.multipart.MultipartFile;
import java.io.IOException;
import java.security.InvalidKeyException;
import java.security.NoSuchAlgorithmException;

/**
 * <p>
 * 文章表 服务类
 * </p>
 *
 * @author xiabiqing
 * @since 2026-05-23
 */
public interface IArticleService extends IService<Article> {
    Boolean createArticle(ArticleAddParam param) throws ServerException, InsufficientDataException, ErrorResponseException, IOException, NoSuchAlgorithmException, InvalidKeyException, InvalidResponseException, XmlParserException, InternalException;

    String uploadFile(MultipartFile file);
    AICompleteArticle completeArticle(String imageURL);
}
