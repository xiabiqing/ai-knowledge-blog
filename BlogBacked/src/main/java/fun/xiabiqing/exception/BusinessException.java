package fun.xiabiqing.exception;

import fun.xiabiqing.common.ErrorCode;
import lombok.Getter;

@Getter
public class BusinessException extends RuntimeException {
    private final int code;
    private final String description;

    public BusinessException(final int code, String msg, final String description) {
        super(msg);
        this.code = code;
        this.description = description;
    }

    public BusinessException(final int code, String msg) {
        super(msg);
        this.code = code;
        this.description = null;
    }
    public BusinessException(final ErrorCode errorCode){
        super(errorCode.getMSG());
        this.code = errorCode.getCODE();
        this.description = errorCode.getDESCRIPTION();
    }
    public BusinessException(final ErrorCode errorCode,String message){
        super(message);
        this.code = errorCode.getCODE();
        this.description = errorCode.getDESCRIPTION();
    }
    public BusinessException(final ErrorCode errorCode,String message,String description){
        super(message);
        this.code = errorCode.getCODE();
        this.description = description;
    }

}
