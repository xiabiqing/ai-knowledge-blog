<div align="center">

<img src="BlogFronted/public/微信图片_20260609100857_297_12.jpg" width="80" height="80" style="border-radius: 50%;" />

# 静思录 · AI 驱动的博客知识管理平台

<p>
  <img src="https://img.shields.io/badge/Spring%20Boot-3.5.14-brightgreen?logo=springboot" alt="Spring Boot" />
  <img src="https://img.shields.io/badge/React-19-blue?logo=react" alt="React" />
  <img src="https://img.shields.io/badge/Java-17-orange?logo=openjdk" alt="Java 17" />
  <img src="https://img.shields.io/badge/TypeScript-5.8-blue?logo=typescript" alt="TypeScript" />
  <img src="https://img.shields.io/badge/DeepSeek-V4-536DFE?logo=openai" alt="DeepSeek" />
  <img src="https://img.shields.io/badge/license-MIT-green" alt="License" />
</p>

**写作 × AI × 知识沉淀 —— 让每一次技术踩坑都变成可检索的经验资产**

</div>

---

## ✨ 为什么做这个项目？

程序员每天都在解决问题，但这些宝贵的经验往往散落在脑子里、聊天记录里、临时笔记里，**用的时候找不到，不用的时候想不起来**。

静思录解决了这个问题：**上传你的笔记 / 截图 / PDF → AI 自动提炼标题、问题描述、经验总结 → 存入知识库并自动打分排序 → 相似经验自动去重**。

更有一个 **Agent 智能体**，通过对话式引导帮你把零散的想法变成高质量的技术文章。

---

## 🧩 核心功能

### 📝 文章管理
- 文章增删改查，支持分页列表展示
- **多格式文件上传解析**：PNG、HTML、Markdown、PDF 等
- **AI 自动补全**：上传文件后，调用 DeepSeek 大模型自动生成标题、问题描述、经验总结

### 🧠 经验知识库
- AI 对所有经验自动 **归类、打分**（价值评分）
- 按 **打开频率 + AI 评分** 智能排序
- **ElasticSearch 全文搜索**，快速检索经验
- **相似度去重**：相似度过高的经验自动拦截，不进入知识库
- Kafka 异步处理经验入库，保证系统响应速度

### 🤖 Agent 智能体发布
- 对话式交互，Agent 引导你系统性描述问题
- 从对话中自动提炼结构化信息
- 一键生成高质量技术文章
- Function Calling 能力（管理端 & 用户端双工具集）

---

## 🏗️ 技术架构

```
┌──────────────────────┐      ┌──────────────────────────────────┐
│   Frontend           │      │          Backend                 │
│   Vite + React 19    │◄────►│   Spring Boot 3.5               │
│   Tailwind CSS 4     │      │   Spring AI (DeepSeek)          │
│   TypeScript         │      │   MyBatis Plus                  │
│   Motion (动画)       │      │   Knife4j (API 文档)            │
└──────────────────────┘      │                                  │
                              │  ┌──────────┐  ┌──────────────┐ │
                              │  │  MySQL   │  │ ElasticSearch│ │
                              │  └──────────┘  └──────────────┘ │
                              │  ┌──────────┐  ┌──────────────┐ │
                              │  │  Kafka   │  │    Minio     │ │
                              │  └──────────┘  └──────────────┘ │
                              └──────────────────────────────────┘
```

| 层级 | 技术 | 说明 |
|------|------|------|
| **前端** | React 19 + Vite + Tailwind CSS 4 | 响应式设计，日式自然色系 |
| **后端** | Spring Boot 3.5 + Java 17 | RESTful API，全局异常处理 |
| **AI** | Spring AI + DeepSeek V4 | 文章自动补全 + Agent 对话 |
| **数据库** | MySQL 8.0 + MyBatis Plus | 文章、知识库持久化存储 |
| **搜索引擎** | ElasticSearch | 知识库全文检索 |
| **消息队列** | Kafka | 异步经验提取入库 |
| **对象存储** | Minio | 上传文件存储 |
| **文档** | Knife4j | 自动生成 API 文档 |

---

## 🚀 快速开始

### 环境要求

- **JDK 17+**
- **Node.js 18+**
- **MySQL 8.0+**
- **ElasticSearch 7.x+**
- **Kafka 3.x+**
- **Minio**（可选，用于文件上传）

### 1. 克隆项目

```bash
git clone https://github.com/xiabiqing/Blog.git
cd Blog
```

### 2. 启动后端

```bash
cd BlogBacked

# 初始化数据库（执行 src/main/java/fun/xiabiqing/sql/Initialization.sql）
# 配置环境变量
export MYSQL_USERNAME=root
export MYSQL_PASSWORD=your_password
export DEEPSEEK_API_KEY=sk-your-deepseek-api-key

# 启动
./mvnw spring-boot:run
```

后端启动后访问：
- API 服务：http://localhost:8080
- Knife4j 文档：http://localhost:8080/doc.html

### 3. 启动前端

```bash
cd BlogFronted

# 安装依赖
npm install

# 启动开发服务器
npm run dev
```

浏览器打开 http://localhost:3000

> 💡 **Tip**：连续点击左上角 Logo 3 次可唤出管理员登录面板。

### 4. 环境变量

| 变量 | 说明 | 默认值 |
|------|------|--------|
| `MYSQL_USERNAME` | MySQL 用户名 | `root` |
| `MYSQL_PASSWORD` | MySQL 密码 | - |
| `DEEPSEEK_API_KEY` | DeepSeek API Key | - |
| `GEMINI_API_KEY` | Gemini API Key（前端） | - |

---

## 📸 功能预览

| 功能 | 截图 |
|------|------|
| **文章列表** | 分页浏览所有文章，按更新时间排序 |
| **文章管理** | 上传文件 → AI 自动生成标题/描述/经验 |
| **知识库** | 按类型/频率/评分检索，支持 ES 全文搜索 |
| **Agent 发布** | 对话式引导，自动生成结构化文章 |

---

## 📂 项目结构

```
Blog/
├── BlogBacked/                 # Spring Boot 后端
│   ├── src/main/java/fun/xiabiqing/
│   │   ├── controller/         # REST 控制器
│   │   ├── service/            # 业务逻辑层
│   │   ├── mapper/             # MyBatis 数据访问
│   │   ├── entity/             # PO/DTO/VO 实体
│   │   ├── config/             # Spring 配置
│   │   ├── constant/           # 常量定义
│   │   ├── kafka/              # Kafka 消费者
│   │   ├── interceptor/        # 登录拦截器
│   │   ├── utils/              # 工具类（AI Agent）
│   │   └── sql/                # 数据库初始化脚本
│   └── pom.xml                 # Maven 依赖
│
├── BlogFronted/                # React 前端
│   ├── src/
│   │   ├── pages/              # 页面组件
│   │   │   ├── Articles.tsx    # 文章列表页
│   │   │   ├── KnowledgeBase.tsx # 知识库页
│   │   │   └── AgentPublish.tsx  # Agent 智能发布页
│   │   ├── components/         # 通用组件
│   │   ├── contexts/           # React Context (Auth)
│   │   └── api.ts              # API 请求封装
│   ├── package.json
│   └── vite.config.ts
│
└── README.md
```

---

## 🤝 贡献

欢迎提 Issue 和 PR！如果你觉得这个项目有用，请点个 ⭐ Star。

## 📄 License

MIT © [xiabiqing](https://github.com/xiabiqing)

---

<div align="center">
  <sub>Built with ❤️ by xiabiqing · Powered by DeepSeek & Spring AI</sub>
</div>
