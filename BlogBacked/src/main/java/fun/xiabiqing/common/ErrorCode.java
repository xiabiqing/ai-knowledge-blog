package fun.xiabiqing.common;
import lombok.Getter;


@Getter
public enum ErrorCode {
    PARAM_ERROR(400000,"请求参数错误",""),
    PARAM_NULL(400001,"请求参数为空",""),
    NO_LOGIN(400002,"用户未登录",""),
    NO_AUTH(400003,"无权限",""),
    SYSTEM_ERROR(400004,"系统内部错误",""),
    WEBSOCKET_CLOSE(400041,"WebSocket关闭失败","");
    ;
    private final int CODE;
    private final String MSG;
    private final String DESCRIPTION;

    ErrorCode(int CODE, String MSG, String DESCRIPTION) {
        this.CODE = CODE;
        this.MSG = MSG;
        this.DESCRIPTION = DESCRIPTION;
    }
}
