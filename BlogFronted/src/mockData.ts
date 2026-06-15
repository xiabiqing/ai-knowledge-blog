import { Article, EmpiricalKnowledge } from './types';

// ========== 30 篇假数据文章 ==========
export const mockArticles: Article[] = [
  { id: 1, title: "如何在生产环境中部署大模型Agent", sourceFilePath: "/uploads/docs/deploy_agent.md", description: "记录了上周在部署企业级Agent时遇到的并发和内存泄漏问题，并对系统架构进行了调优。", experience: "使用池化技术管理LLM客户端连接；在Prompt构建层增加缓存机制以减少重复计算；必须配置严格的超时打断机制。", createtime: "2026-06-01T10:00:00Z", updatetime: "2026-06-08T14:20:00Z" },
  { id: 2, title: "Vite + Vue3 性能优化实践", sourceFilePath: "/uploads/docs/vite_vue_perf.pdf", description: "关于构建时长过长以及首屏加载慢的排查与优化过程记录。", experience: "通过分包(SplitChunks)按路由拆分代码；引入CDN加载基础库；利用Vite的预构建缓存特性加速本地开发。", createtime: "2026-06-02T09:30:00Z", updatetime: "2026-06-07T16:45:00Z" },
  { id: 3, title: "ElasticSearch 深度分页崩溃解决", sourceFilePath: "", description: "处理海量日志数据时，使用from+size进行深度分页导致OOM。", experience: "弃用from+size，改用search_after游标方式进行深翻页查询；优化索引分片数量与硬件资源的配比。", createtime: "2026-06-03T08:15:00Z", updatetime: "2026-06-08T10:00:00Z" },
  { id: 4, title: "Kubernetes Pod 调度策略深度剖析", sourceFilePath: "/uploads/docs/k8s_schedule.pdf", description: "线上集群频繁出现Pod资源争抢，部分节点负载过高而其他节点空闲，排查发现调度策略配置不当。", experience: "通过nodeSelector、nodeAffinity和podAntiAffinity组合实现精准调度；引入拓扑分布约束(topologySpreadConstraints)平衡跨Zone负载。", createtime: "2026-06-04T07:00:00Z", updatetime: "2026-06-09T08:30:00Z" },
  { id: 5, title: "Go语言协程泄漏排查全记录", sourceFilePath: "", description: "生产服务运行48小时后内存持续上涨，pprof发现goroutine数量已超过10万，最终定位到channel未关闭导致阻塞。", experience: "使用pprof的goroutine profile快速定位泄漏点；所有channel必须有明确的close和退出信号；引入context.WithTimeout作为兜底超时控制。", createtime: "2026-06-05T11:20:00Z", updatetime: "2026-06-08T19:10:00Z" },
  { id: 6, title: "MySQL 慢查询优化实战：从8s到80ms", sourceFilePath: "/uploads/docs/mysql_slow.pdf", description: "订单列表接口响应时间持续恶化，通过EXPLAIN分析发现全表扫描+文件排序，索引设计存在严重缺陷。", experience: "联合索引遵循最左前缀原则；覆盖索引避免回表查询；使用force index临时救急但要同步修复SQL写法；定期分析slow_query_log。", createtime: "2026-05-28T14:00:00Z", updatetime: "2026-06-07T12:15:00Z" },
  { id: 7, title: "React 18 并发特性在表单场景的实践", sourceFilePath: "/uploads/docs/react18_form.md", description: "复杂表单页面存在卡顿问题，使用startTransition和useDeferredValue优化输入响应体验。", experience: "将非紧急更新包裹在startTransition中；使用useDeferredValue延迟高频变化的状态；配合React.memo减少子树重渲染。", createtime: "2026-06-06T16:45:00Z", updatetime: "2026-06-09T07:00:00Z" },
  { id: 8, title: "Redis 缓存雪崩事故复盘", sourceFilePath: "", description: "大促期间缓存集中失效，请求直接穿透到数据库，导致数据库CPU飙升触发告警。", experience: "缓存过期时间加随机值避免集中失效；使用互斥锁防止缓存击穿；核心数据启用多级缓存（本地Caffeine+远程Redis）；提前预热热点key。", createtime: "2026-05-25T10:30:00Z", updatetime: "2026-06-05T15:40:00Z" },
  { id: 9, title: "Spring Boot 3 升级到 3.5 的迁移记录", sourceFilePath: "/uploads/docs/spring35_migrate.md", description: "从Spring Boot 3.2升级到3.5，遇到Jakarta EE命名空间变更、虚拟线程配置调整、以及部分自动配置类的Breaking Changes。", experience: "升级前仔细阅读Changelog；使用spring-boot-properties-migrator扫描废弃配置；虚拟线程在IO密集型场景下CPU利用率提升约30%；分批灰度发布降低风险。", createtime: "2026-06-07T08:00:00Z", updatetime: "2026-06-09T09:20:00Z" },
  { id: 10, title: "TypeScript 类型体操：泛型工具链实战", sourceFilePath: "/uploads/docs/ts_generics.md", description: "封装通用请求库时，为了让返回值类型自动推导，深入使用了TypeScript的泛型、条件类型和模板字面量类型。", experience: "使用extends约束泛型边界；条件类型配合infer实现类型提取；模板字面量类型可用于构建类型安全的字符串拼接；善用ts-toolbelt等工具库避免重复造轮子。", createtime: "2026-05-30T13:00:00Z", updatetime: "2026-06-06T17:30:00Z" },
  { id: 11, title: "Nginx 反向代理 WebSocket 断开问题", sourceFilePath: "/uploads/docs/nginx_ws.pdf", description: "使用Nginx代理WebSocket连接时，客户端每隔60秒自动断开，排查发现是proxy_read_timeout默认值导致。", experience: "WebSocket代理必须增加proxy_read_timeout（建议1h以上）；显式设置proxy_http_version 1.1和Upgrade/Connection头；使用map指令根据Upgrade头动态切换协议。", createtime: "2026-05-22T09:15:00Z", updatetime: "2026-06-04T11:00:00Z" },
  { id: 12, title: "Docker 镜像体积从1.2G压缩到120M", sourceFilePath: "/uploads/docs/docker_slim.md", description: "CI/CD流水线中镜像拉取耗时过长，通过多阶段构建和Alpine基础镜像大幅缩减体积。", experience: "使用多阶段构建分离编译和运行环境；Alpine镜像使用apk add --no-cache；.dockerignore过滤无用文件；利用dive工具分析镜像层；CICD中开启BuildKit缓存加速。", createtime: "2026-06-08T10:00:00Z", updatetime: "2026-06-09T06:15:00Z" },
  { id: 13, title: "JVM 堆外内存泄漏排查与修复", sourceFilePath: "", description: "服务内存使用量持续增长但堆内GC正常，通过NMT(Native Memory Tracking)发现DirectByteBuffer未释放。", experience: "开启-XX:NativeMemoryTracking=detail监控堆外内存；Netty的PooledByteBufAllocator需要正确释放引用计数；使用jcmd定期dump NMT差异分析内存增长趋势；考虑堆外内存用-XX:MaxDirectMemorySize限制上限。", createtime: "2026-05-18T15:30:00Z", updatetime: "2026-06-03T08:45:00Z" },
  { id: 14, title: "微服务间分布式事务的最终一致性方案", sourceFilePath: "/uploads/docs/saga_pattern.pdf", description: "订单服务、库存服务和支付服务之间的数据一致性难以保证，传统2PC性能太差，最终选用Saga编排模式。", experience: "Saga编排模式通过状态机定义补偿回滚流程；使用Kafka作为事件总线解耦服务间依赖；幂等性设计是基础——每条消息带唯一业务ID；监控Saga执行链路上的异常并自动重试。", createtime: "2026-05-15T10:00:00Z", updatetime: "2026-06-02T14:30:00Z" },
  { id: 15, title: "CSS Grid 替代 Flexbox 实现复杂仪表盘布局", sourceFilePath: "/uploads/docs/css_grid_dashboard.md", description: "管理后台仪表盘需要同时支持固定宽度侧边栏+自适应内容区+可拖拽调整的卡片网格，Flexbox嵌套层级太深难以维护。", experience: "Grid的grid-template-areas命名区域直观易读；fr单位配合minmax实现弹性+约束；配合container query实现组件级响应式；subgrid可对齐嵌套网格的轨道线。", createtime: "2026-06-01T08:00:00Z", updatetime: "2026-06-08T20:10:00Z" },
  { id: 16, title: "Kafka 消费者组 Rebalance 风暴处理", sourceFilePath: "/uploads/docs/kafka_rebalance.md", description: "消费者频繁加入/离组导致整个消费组停止消费，延迟飙升至分钟级，业务大量超时告警。", experience: "合理设置session.timeout.ms和max.poll.interval.ms；增大group.initial.rebalance.delay.ms避开滚动重启时的重平衡；使用静态组成员(Static Group Membership)减少不必要的rejoin；消息处理逻辑异步化避免poll超时。", createtime: "2026-05-20T07:45:00Z", updatetime: "2026-06-07T22:30:00Z" },
  { id: 17, title: "前端国际化i18n方案选型与落地", sourceFilePath: "/uploads/docs/i18n_setup.md", description: "产品要求支持中英日三种语言，技术选型时对比了react-intl、react-i18next和自研方案，最终选用react-i18next配合远程加载词条。", experience: "使用i18next的namespace按模块拆分词条避免单文件过大；ICU MessageFormat语法处理复数/日期等复杂格式；词条提取用i18next-parser扫描代码自动生成；翻译流程接入Lokalise方便非研发人员协作。", createtime: "2026-06-03T11:00:00Z", updatetime: "2026-06-09T06:40:00Z" },
  { id: 18, title: "PostgreSQL 全文搜索替代Elasticsearch的轻量方案", sourceFilePath: "", description: "小规模项目引入ES运维成本过高，尝试使用PostgreSQL的tsvector+gin索引实现全文搜索，满足基本需求。", experience: "使用pg_trgm扩展实现模糊匹配；to_tsvector('jiebacfg', content)引入jieba分词中文友好；GIN索引在千万级数据下查询延迟<100ms；使用ts_rank_cd进行相关性排序；不足之处在于高并发下CPU压力大。", createtime: "2026-05-12T14:20:00Z", updatetime: "2026-06-01T10:15:00Z" },
  { id: 19, title: "Git 分支管理规范与Code Review最佳实践", sourceFilePath: "/uploads/docs/git_flow.md", description: "团队人数增长到15人后，分支混乱导致频繁合并冲突，上线事故增多，推行了Git Flow + 强制Code Review流程。", experience: "明确main/develop/feature/hotfix分支职责；feature分支生命周期不超过3天；MR规则：至少2位reviewer批准+CI通过才可合并；引入semantic commit规范便于生成CHANGELOG；使用Squash Merge保持主干历史干净。", createtime: "2026-05-08T09:00:00Z", updatetime: "2026-06-05T18:00:00Z" },
  { id: 20, title: "Node.js 内存快照分析指南", sourceFilePath: "/uploads/docs/node_memory.pdf", description: "Express服务在压测时RSS内存达到2GB触发容器OOMKilled，通过heapdump+Chrome DevTools定位到未释放的Buffer对象。", experience: "使用process.memoryUsage()监控堆/外部内存比例；heapdump生成快照后用Chrome Memory面板的Comparison视图对比差异；关注ArrayBuffer和Buffer的显式释放；考虑使用WeakRef管理缓存对象。", createtime: "2026-06-05T10:30:00Z", updatetime: "2026-06-09T01:00:00Z" },
  { id: 21, title: "NestJS 拦截器与中间件的执行顺序与适用场景", sourceFilePath: "/uploads/docs/nestjs_middleware.md", description: "在实现全局限流和请求日志时，对拦截器和中间件的选择产生困惑，深入研究了两者的执行模型差异。", experience: "中间件在路由解析前执行，适合全局性任务（CORS、BodyParser）；拦截器在路由解析后执行，能获取Controller上下文适合AOP切面；管道用于参数验证/转换；过滤器用于异常捕获。执行顺序：Middleware→Guard→Interceptor(pre)→Pipe→Controller→Interceptor(post)→ExceptionFilter。", createtime: "2026-05-26T16:00:00Z", updatetime: "2026-06-08T05:30:00Z" },
  { id: 22, title: "CI/CD 流水线从20分钟优化到3分钟", sourceFilePath: "/uploads/docs/cicd_fast.pdf", description: "每次提交后CI耗时20分钟严重影响开发效率，从依赖缓存、并行化、增量测试三个方向进行优化。", experience: "使用actions/cache缓存node_modules和Maven依赖；将无依赖的Job拆分为并行matrix执行；Jest开启--onlyChanged只跑变更相关测试；使用cron只在夜间执行E2E全量回归；优化Docker layer顺序利用缓存。", createtime: "2026-06-02T06:30:00Z", updatetime: "2026-06-08T15:00:00Z" },
  { id: 23, title: "Web Worker 实现前端大文件分片上传", sourceFilePath: "/uploads/docs/worker_upload.md", description: "用户上传500MB视频文件时页面卡死，将文件切片+MD5计算移入Web Worker线程避免阻塞主线程。", experience: "使用SparkMD5在Worker中异步计算文件hash实现秒传校验；File.slice()分片后并发上传（控制并发数6）；每片上传成功后postMessage通知主线程更新进度；利用IndexedDB持久化上传进度实现断点续传。", createtime: "2026-05-29T13:15:00Z", updatetime: "2026-06-06T21:00:00Z" },
  { id: 24, title: "MyBatis-Plus 分页插件在大数据量下的性能陷阱", sourceFilePath: "", description: "千万级数据表使用Page插件分页，当页码较大时查询越来越慢，发现是COUNT(*)全表扫描和limit offset的固有缺陷。", experience: "COUNT查询可以走索引但深分页offset需要跳过大量数据；改用游标分页（基于主键ID范围）；业务层面限制最大翻页数（如100页）；考虑使用ClickHouse或ES接管大数据量分页查询场景。", createtime: "2026-05-10T08:00:00Z", updatetime: "2026-06-04T09:45:00Z" },
  { id: 25, title: "Tailwind CSS 在大型项目中的组织与封装策略", sourceFilePath: "/uploads/docs/tailwind_scale.pdf", description: "项目组件超过200个后，className冗长难以阅读，重复的样式组合散落各处，需要一套复用和封装策略。", experience: "使用@apply在CSS层抽取高频重复组合（如card-base、btn-primary）；组件化是第一优先级——Button/Input等基础组件封装样式，外部只需传variant；tailwind-merge解决className合并冲突；设计tokens映射到tailwind.config统一管理设计语言。", createtime: "2026-06-04T09:00:00Z", updatetime: "2026-06-09T03:20:00Z" },
  { id: 26, title: "Linux 服务器被挖矿病毒入侵的应急响应", sourceFilePath: "/uploads/docs/mining_virus.pdf", description: "凌晨3点收到CPU使用率99%告警，登录发现redis端口暴露公网且无密码，被植入了挖矿脚本和定时任务。", experience: "第一时间隔离网络而非直接kill进程（保留取证）；检查crontab/系统服务/启动脚本；使用auditd审计文件变更；Redis必须bind内网IP+requirepass；公网服务器定期弱口令扫描；使用seccomp和AppArmor做进程级别限制。", createtime: "2026-05-05T03:30:00Z", updatetime: "2026-06-02T07:00:00Z" },
  { id: 27, title: "gRPC vs REST：在我们业务中的实战对比", sourceFilePath: "/uploads/docs/grpc_vs_rest.pdf", description: "内部微服务间通信改用gRPC后，序列化性能提升明显，但调试和网关集成遇到了一些问题。", experience: "Protobuf序列化比JSON快3-5倍且体积更小；gRPC的流式传输适合实时推送场景；调试时使用grpcurl替代curl；通过grpc-gateway自动生成REST接口兼容外部调用；注意HTTP/2的长连接管理及负载均衡策略差异。", createtime: "2026-05-17T11:00:00Z", updatetime: "2026-06-03T13:30:00Z" },
  { id: 28, title: "React Query 替代 Redux 管理服务端状态的实践", sourceFilePath: "/uploads/docs/react_query.md", description: "Redux中大量样板代码用于管理API数据的加载/错误/缓存状态，引入React Query后代码量减少70%。", experience: "服务端状态和客户端状态分离管理——React Query负责异步缓存，Zustand负责UI状态；staleTime和gcTime合理搭配减少不必要的refetch；useMutation配合queryClient.invalidateQueries实现乐观更新；使用useInfiniteQuery替代传统分页实现无限滚动。", createtime: "2026-06-07T14:00:00Z", updatetime: "2026-06-09T08:00:00Z" },
  { id: 29, title: "HTTPS证书自动化续期与监控方案", sourceFilePath: "/uploads/docs/ssl_auto.pdf", description: "线上证书过期导致用户无法访问的线上事故，痛定思痛搭建了acme.sh + Prometheus的全自动续期+监控体系。", experience: "使用acme.sh的dnsapi模式支持泛域名证书；续期后自动reload nginx；Prometheus黑盒监控证书过期时间并设置15天/7天/3天三级告警；多台服务器通过NFS共享证书目录避免重复签发达到速率限制。", createtime: "2026-06-01T05:00:00Z", updatetime: "2026-06-08T12:00:00Z" },
  { id: 30, title: "2026上半年技术回顾与下半年规划", sourceFilePath: "", description: "整理了上半年接手的重要技术事项，包括基础设施迁移、性能优化、团队工具链建设等方面的工作总结。", experience: "基础设施：完成K8s集群从1.27升级到1.32，引入Istio服务网格；性能：核心接口P99延迟从2s降到200ms；工具链：统一了团队的CI模板和Git Hook；团队：推行Tech Lead轮值制度提升整体Owner意识。下半年的重点是AI能力落地和观测体系升级。", createtime: "2026-06-08T16:00:00Z", updatetime: "2026-06-09T10:00:00Z" },
];

// ========== 30 条假数据学习精华 ==========
const knowledgeTypes = ["架构设计", "前端工程化", "数据库/中间件", "性能优化", "运维部署", "安全防护", "开发工具", "团队管理", "AI/LLM", "测试策略"];
const knowledgeTitles: Record<string, string[]> = {
  "架构设计": ["LLM Agent 并发连接池化技术", "微服务 Saga 编排状态机设计", "事件驱动架构在电商系统的落地", "CQRS 读写分离的实践边界", "六边形架构在Spring Boot中的应用"],
  "前端工程化": ["Vite 路由分包策略", "React Server Components 数据流设计", "微前端 Qiankun 样式隔离方案", "Monorepo 下 Turborepo 的构建加速", "前端监控 Sentry 错误追踪体系搭建"],
  "数据库/中间件": ["ES search_after 翻页方案", "MySQL 分库分表后跨分片查询优化", "Redis Stream 实现可靠消息队列", "使用 pg_partman 实现 PostgreSQL 自动分区", "Canal + Kafka 实现 MySQL 实时数据同步"],
  "性能优化": ["JVM 启动参数调优：从15秒到3秒", "Nginx 反向代理连接池配置优化", "前端首屏性能优化：LCP 从 4s 降到 1.5s", "Go 程序内存分配优化——逃逸分析实战", "数据库连接池 HikariCP 最佳配置"],
  "运维部署": ["K8s HPA 基于自定义指标的弹性伸缩", "GitOps ArgoCD 实现多环境自动同步", "容器镜像安全扫描流水线搭建", "Terraform 管理云资源的 IaC 实践", "Prometheus + Grafana 全栈可观测性方案"],
  "安全防护": ["OAuth2.0 授权码流程的安全实现", "Web 应用 CSRF 和 XSS 防护策略", "API 接口的幂等性设计与防重放攻击"],
  "开发工具": ["VS Code 自定义 Snippet 提升编码效率", "使用 Storybook 构建组件文档库", "Prettier + ESLint 统一代码风格配置"],
  "团队管理": ["技术债务量化评估与偿还策略", "如何做好技术方案评审"],
  "AI/LLM": ["RAG 检索增强生成的文档问答系统", "Prompt Engineering 在企业场景的最佳实践"],
  "测试策略": ["契约测试在微服务架构中的应用"],
};

function generateKnowledge(): EmpiricalKnowledge[] {
  const result: EmpiricalKnowledge[] = [];
  let id = 101;
  const usedTitles = new Set<string>();

  for (const [type, titles] of Object.entries(knowledgeTitles)) {
    for (const title of titles) {
      if (usedTitles.has(title)) continue;
      usedTitles.add(title);
      const dayOffset = Math.floor(Math.random() * 60);
      const date = new Date(2026, 5, 9);
      date.setDate(date.getDate() - dayOffset);
      result.push({
        id: id++,
        articleIdEmp: (id % 30) + 1,
        type,
        title,
        content: `关于「${title}」的详细学习精华内容。在实际项目中经过反复验证，总结了可复用的方法论和避坑指南，适合团队内部知识沉淀和新人Onboarding参考。`,
        frequency: Math.floor(Math.random() * 30) + 3,
        score: Math.floor(Math.random() * 30) + 70,
        createtime: date.toISOString(),
        updatetime: new Date(date.getTime() + Math.random() * 86400000 * 5).toISOString(),
      });
    }
  }
  return result;
}

export const mockKnowledge: EmpiricalKnowledge[] = generateKnowledge();
