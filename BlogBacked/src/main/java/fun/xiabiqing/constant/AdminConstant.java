package fun.xiabiqing.constant;

public class AdminConstant {
    public static final String ADMIN_USERNAME = System.getenv().getOrDefault("ADMIN_USERNAME", "admin");
    public static final String ADMIN_PASSWORD = System.getenv().getOrDefault("ADMIN_PASSWORD", "change_me");
}
