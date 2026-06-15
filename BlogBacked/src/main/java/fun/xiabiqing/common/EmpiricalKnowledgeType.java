package fun.xiabiqing.common;
import lombok.Getter;
import java.util.Arrays;
import java.util.stream.Collectors;

@Getter
public enum EmpiricalKnowledgeType {
    FRONT_END("前端开发"),
    BACK_END("后端开发"),
    DATABASE_CACHE("数据库与缓存"),  // 扩充了缓存概念（Redis等通常和DB放一起）
    DEVOPS_CLOUD("DevOps与云原生"), // 现代化表达，涵盖 Docker/K8s/CI/CD
    ARCHITECTURE("架构设计"),
    TROUBLESHOOTING("排错与踩坑"),  // 比纯粹的“BUG”更宽泛，包含性能调优、诡异报错
    AI_LLM("AI与大模型");           // 现代技术博客必备，方便记录你折腾 Spring AI 的经验

    private final String desc;

    EmpiricalKnowledgeType(String desc) {
        this.desc = desc;
    }

    /**
     * 💡 高级技巧：提供一个方法，动态拼接出所有分类的中文名称。
     * 比如返回："[前端开发, 后端开发, 数据库与缓存, DevOps与云原生, 架构设计, 排错与踩坑, AI与大模型]"
     */
    public static String getSupportedTypesForPrompt() {
        return Arrays.stream(values())
                .map(EmpiricalKnowledgeType::getDesc)
                .collect(Collectors.joining(", ", "[", "]"));
    }
}