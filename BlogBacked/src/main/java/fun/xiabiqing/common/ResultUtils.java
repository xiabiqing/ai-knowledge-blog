package fun.xiabiqing.common;

public class ResultUtils {
    /*
    成功
     */
    public static <T>BaseResponse<T> success(T data) {
        return new BaseResponse<>(data);
    }
    public static <T>BaseResponse<T> success(T data,String msg) {
        return new BaseResponse<>(data,msg);
    }
    /*
    失败
     */
    public static <T>BaseResponse<T> error(int code,String msg) {
        return new BaseResponse<>(code,msg);
    }
    public static <T>BaseResponse<T> error(int code,String msg,String description) {
        return new BaseResponse<>(code,msg,description);
    }
    public static <T>BaseResponse<T> error(ErrorCode errorCode) {
        return new BaseResponse<>(errorCode.getCODE(),errorCode.getMSG());
    }
    public static <T>BaseResponse<T> error(ErrorCode errorCode,String description) {
        return new BaseResponse<>(errorCode.getCODE(),errorCode.getMSG(),description);
    }

}
