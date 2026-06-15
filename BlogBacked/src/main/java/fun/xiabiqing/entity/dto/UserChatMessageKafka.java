package fun.xiabiqing.entity.dto;

import fun.xiabiqing.entity.param.UserChatMessage;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@AllArgsConstructor
@NoArgsConstructor
public class UserChatMessageKafka {
    private UserChatMessage userChatMessage;
    private String reply;
    private Boolean isOld;
}
