package fun.xiabiqing.service.impl;
import fun.xiabiqing.common.ErrorCode;
import fun.xiabiqing.constant.AIConstant;
import fun.xiabiqing.constant.KafkaConstant;
import fun.xiabiqing.constant.MinioConstant;
import fun.xiabiqing.entity.dto.AICompleteArticle;
import fun.xiabiqing.entity.dto.ExperienceExtract;
import fun.xiabiqing.entity.param.ArticleAddParam;
import fun.xiabiqing.entity.po.Article;
import fun.xiabiqing.exception.BusinessException;
import fun.xiabiqing.mapper.ArticleMapper;
import fun.xiabiqing.service.IArticleService;
import com.baomidou.mybatisplus.extension.service.impl.ServiceImpl;
import io.minio.MinioClient;
import io.minio.PutObjectArgs;
import lombok.extern.slf4j.Slf4j;
import net.sourceforge.tess4j.Tesseract;
import net.sourceforge.tess4j.TesseractException;
import org.apache.commons.io.IOUtils;
import org.springframework.ai.chat.model.ChatModel;
import org.springframework.ai.chat.prompt.Prompt;
import org.springframework.ai.chat.prompt.PromptTemplate;
import org.springframework.ai.converter.BeanOutputConverter;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.kafka.core.KafkaTemplate;
import org.springframework.stereotype.Service;
import org.springframework.util.StringUtils;
import org.springframework.web.multipart.MultipartFile;
import org.apache.pdfbox.Loader;
import org.apache.pdfbox.pdmodel.PDDocument;
import org.apache.pdfbox.text.PDFTextStripper;
import javax.imageio.ImageIO;
import java.awt.image.BufferedImage;
import java.io.File;
import java.io.IOException;
import java.io.InputStream;
import java.net.URL;
import java.nio.charset.StandardCharsets;
import java.util.UUID;
/**
 * <p>
 * 文章表 服务实现类
 * </p>
 *
 * @author xiabiqing
 * @since 2026-05-23
 */
@Slf4j
@Service
public class ArticleServiceImpl extends ServiceImpl<ArticleMapper, Article> implements IArticleService {
    @Autowired
    private MinioClient minioClient;
    @Autowired
    private ChatModel chatModel;
    @Autowired
    private KafkaTemplate<String, Object> kafkaTemplate;
    @Override
    public Boolean createArticle(ArticleAddParam param) {
        Article article = new Article();
        article.setTitle(param.getTitle());
        article.setSourceFilePath(param.getSourceFilePath());
        article.setDescription(param.getDescription());
        article.setExperience(param.getExperience());
        this.save(article);
        if(StringUtils.hasText(param.getExperience())){
            ExperienceExtract extract = new ExperienceExtract(article.getId(), param.getExperience());
            kafkaTemplate.send(KafkaConstant.EXPERIENCE_COMPACT_TOPIC,extract);
            log.info("经验压缩已经入消息队列,articleId:{}",article.getId());
        }
        return true;
    }
    @Override
    public String uploadFile(MultipartFile file) {
        if (file.isEmpty()) {
            throw new BusinessException(ErrorCode.PARAM_NULL, "空文件不能上传");
        }
        String originalFilename = file.getOriginalFilename();
        String suffix = originalFilename.substring(originalFilename.lastIndexOf("."));
        String objectName = MinioConstant.MINIO_UPLOAD_FILE + UUID.randomUUID().toString() + suffix;
        try (InputStream inputStream = file.getInputStream()) {
            PutObjectArgs putObjectArgs = PutObjectArgs.builder()
                    .bucket(MinioConstant.MINIO_BUCKET)
                    .object(objectName)
                    .stream(inputStream, inputStream.available(), -1)
                    .contentType(file.getContentType())
                    .build();
            minioClient.putObject(putObjectArgs);
            String url = MinioConstant.MINIO_PUBLIC_BASE + "/" + MinioConstant.MINIO_BUCKET + "/" + objectName;
            return url;
        } catch (Exception e) {
            e.printStackTrace();
            throw new BusinessException(ErrorCode.SYSTEM_ERROR, "文件上传失败",e.getMessage());
        }
    }

    @Override
    public AICompleteArticle completeArticle(String URL) {
        String fileContent;
        String lowerUrl = URL.toLowerCase();
        if (lowerUrl.endsWith(".png") || lowerUrl.endsWith(".jpg") || lowerUrl.endsWith(".jpeg")) {
            fileContent = extractTextFromImage(URL);
        } else if (lowerUrl.endsWith(".pdf")) {
            fileContent = extractTextFromPdf(URL);
        } else {
            try {
                URL url = new URL(URL);
                fileContent = IOUtils.toString(url, StandardCharsets.UTF_8);
            } catch (IOException e) {
                throw new BusinessException(ErrorCode.SYSTEM_ERROR, "获取纯文本内容失败");
            }
        }
        BeanOutputConverter<AICompleteArticle> converter = new BeanOutputConverter<>(AICompleteArticle.class);
        PromptTemplate template = new PromptTemplate(AIConstant.AI_ARTICLE_PROMPT);
        template.add("content", fileContent);
        template.add("format", converter.getFormat());
        Prompt prompt = template.create();
        String response = chatModel.call(prompt).getResult().getOutput().getText();
        log.info(response);
        return converter.convert(response);
    }



    public String extractTextFromImage(String imageUrl) {
        try {
            URL url = new URL(imageUrl);
            BufferedImage bufferedImage = ImageIO.read(url);
            if (bufferedImage == null) {
                throw new BusinessException(ErrorCode.PARAM_NULL, "解析图片失败");
            }
            Tesseract tesseract = new Tesseract();
            File tessDataFolder = new File("tessdata");
            tesseract.setDatapath(tessDataFolder.getAbsolutePath());
            tesseract.setLanguage("chi_sim+eng");
            return tesseract.doOCR(bufferedImage);
        } catch (IOException | TesseractException e) {
            throw new BusinessException(ErrorCode.SYSTEM_ERROR, "解析图片失败");
        }
    }

    public String extractTextFromPdf(String pdfUrl) {
        try {
            URL url = new URL(pdfUrl);
            try (InputStream in = url.openStream();
                 PDDocument document = Loader.loadPDF(in.readAllBytes())) {
                PDFTextStripper stripper = new PDFTextStripper();
                stripper.setSortByPosition(true);
                String text = stripper.getText(document);
                if (!StringUtils.hasText(text)) {
                    throw new BusinessException(ErrorCode.PARAM_NULL, "PDF 中未提取到文字内容");
                }
                return text;
            }
        } catch (IOException e) {
            log.error("PDF 解析失败", e);
            throw new BusinessException(ErrorCode.SYSTEM_ERROR, "PDF 解析失败");
        }
    }


}
