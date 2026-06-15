package fun.xiabiqing.interceptor;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.context.annotation.Configuration;
import org.springframework.web.servlet.config.annotation.InterceptorRegistry;
import org.springframework.web.servlet.config.annotation.WebMvcConfigurer;
@Configuration
public class WebMvcConfig implements WebMvcConfigurer {
    @Autowired
    private LoginInterceptor loginInterceptor;
    @Override
    public void addInterceptors(InterceptorRegistry registry) {
        registry.addInterceptor(loginInterceptor)
                .addPathPatterns("/**")
                .excludePathPatterns("/admin/login","/article/get","/article/list","/article/empirical/getArticle",
                        "/empirical-knowledge/listAll","/empirical-knowledge/getEmpiricalKnowledge","/empirical-knowledge/search",
                        "/empirical-knowledge/suggest","/admin/login","/empirical-knowledge/AI/chat/Agent");
    }
}
