package fun.xiabiqing.entity.param;

import jakarta.validation.constraints.NotBlank;
import lombok.Data;

@Data
public class UserChatMessage {
    private String Id;
    /**
     * 用户提问的消息
     */
    @NotBlank
    private String message;
    /**
     * AI生成的消息
     */
    private String content;
}
