package fun.xiabiqing.controller;
import fun.xiabiqing.common.BaseResponse;
import fun.xiabiqing.common.ResultUtils;
import fun.xiabiqing.constant.AdminConstant;
import fun.xiabiqing.utils.JwtUtils;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/admin")
@CrossOrigin(origins = "http://localhost:3000", allowCredentials = "true")
public class AdminController {
    @PostMapping("/login")
    BaseResponse<String> login(@RequestParam("username") String username,@RequestParam("password") String password) {
        if (username.isBlank() || password.isBlank()) {
            return ResultUtils.error(500090,"你如果真需要管理员账号，可以联系我,没必要在这里做无意义工作");
        }
        if (username.equals(AdminConstant.ADMIN_USERNAME) && password.equals(AdminConstant.ADMIN_PASSWORD)) {
            String token = JwtUtils.generateToken(username);
            return ResultUtils.success(token);
        }
        return ResultUtils.error(400090,"请重新登录");
    }

}
