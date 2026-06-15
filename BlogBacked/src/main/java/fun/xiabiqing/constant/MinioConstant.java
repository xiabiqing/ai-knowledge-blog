package fun.xiabiqing.constant;

public class MinioConstant {
    public static final String MINIO_BUCKET = "test";
    public static final String MINIO_UPLOAD_FILE = "uploads/";
    /** 前端访问 MinIO 的公网地址 */
    public static final String MINIO_PUBLIC_BASE =
            System.getenv().getOrDefault("MINIO_PUBLIC_URL", "http://your-server-ip:9000");
}
