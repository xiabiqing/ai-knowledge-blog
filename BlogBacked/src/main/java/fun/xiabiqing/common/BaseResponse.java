package fun.xiabiqing.common;

import lombok.Data;

@Data
public class BaseResponse<T> {
    private int code;
    private T data;
    private String msg;
    private String description;
    /*
    成功
     */
    public BaseResponse( T data, String msg) {
        this.code = 200;
        this.data = data;
        this.msg = msg;
    }
    public BaseResponse( T data) {
        this.code = 200;
        this.data = data;
    }
    /*
    失败
     */
    public BaseResponse(int code, String msg) {
        this.code = code;
        this.msg = msg;
    }
    public BaseResponse(int code, String msg, String description) {
        this.code = code;
        this.msg = msg;
        this.description = description;
    }


}
