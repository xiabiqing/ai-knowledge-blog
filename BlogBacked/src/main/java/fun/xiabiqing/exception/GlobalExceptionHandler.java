package fun.xiabiqing.exception;

import fun.xiabiqing.common.BaseResponse;
import fun.xiabiqing.common.ErrorCode;
import fun.xiabiqing.common.ResultUtils;
import io.swagger.v3.oas.annotations.Hidden;
import lombok.extern.slf4j.Slf4j;
import org.springframework.validation.FieldError;
import org.springframework.web.bind.MethodArgumentNotValidException;
import org.springframework.web.bind.annotation.ExceptionHandler;
import org.springframework.web.bind.annotation.RestControllerAdvice;

import java.util.Objects;

@Slf4j
@RestControllerAdvice
@Hidden
public class GlobalExceptionHandler {
    /**
     * 业务异常
     * @param e 异常类
     * @return 错误类
     */
    @ExceptionHandler(BusinessException.class)
    BaseResponse handleBusinessException(BusinessException e) {
        log.info(e.getDescription());
        return ResultUtils.error(e.getCode(), e.getMessage());
    }

    /**
     * 原生参数校验异常
     * @param e 异常类
     * @return 错误类
     */
    @ExceptionHandler(MethodArgumentNotValidException.class)
    BaseResponse handleMethodArgumentNotValidException(MethodArgumentNotValidException e) {
        FieldError fieldError = e.getBindingResult().getFieldError();
        String validMsg = Objects.requireNonNull(fieldError).getDefaultMessage();
        String errorField = fieldError.getField();
        int errorCode = ErrorCode.PARAM_ERROR.getCODE();
        String errorMsg = validMsg;
        log.info(errorMsg);
        return ResultUtils.error(errorCode, errorMsg);
    }
    @ExceptionHandler(jakarta.validation.ConstraintViolationException.class)
    public BaseResponse<?> constraintViolationExceptionHandler(jakarta.validation.ConstraintViolationException e) {
        log.error("ConstraintViolationException", e);
        // 提取具体的错误描述信息
        String message = e.getConstraintViolations().stream()
                .map(jakarta.validation.ConstraintViolation::getMessage)
                .collect(java.util.stream.Collectors.joining(", "));
        return ResultUtils.error(ErrorCode.PARAM_ERROR, message);
    }
}
