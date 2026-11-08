# T93 智慧农业大棚

前端和后端分别维护在 `frontend/` 与 `backend/`，由一个 Spring Boot 应用统一启动。Maven 构建时将 `frontend/public/` 打包为静态资源，网页用相对路径调用 `/api`，与 API 共用本机 8080 端口。

```text
t93-greenhouse/
├── frontend/public/     # 原生 HTML、CSS、JavaScript
├── backend/
│   ├── pom.xml          # Maven 依赖及前端资源打包配置
│   ├── src/main/        # Spring Boot、REST API、SQLite
│   └── src/test/        # 首页、静态资源和健康接口测试
└── README.md
```

| 组件 | 团队版本 |
| --- | --- |
| Eclipse Temurin JDK | 17.0.21+9 |
| Apache Maven | 3.9.16 |
| Spring Boot | 3.5.16 |
| Xerial SQLite JDBC | 3.53.4.0（SQLite 3.53.4） |

## 获取与统一启动

接受私有仓库邀请后，在存放项目的父目录运行：

```powershell
git clone https://github.com/2309749005-collab/t93-greenhouse.git
cd t93-greenhouse\backend
mvn test
mvn spring-boot:run
```

已经克隆过的同学，先在仓库根目录确认工作区干净，再切到 `main` 并执行 `git pull --ff-only origin main`。随后进入 `backend` 启动。第一次运行 Maven 时需要联网下载依赖。启动只需要 Java 和 Maven，旧版的 5173 前端服务可以关闭。

使用 IntelliJ IDEA 时，导入 `backend/pom.xml` 为 Maven 项目，选择 Java 17。执行 Maven 的 `spring-boot:run`，或在 Maven 资源已同步后运行 `cn.t93.greenhouse.GreenhouseApplication`。运行配置的工作目录使用 `backend`。

## 查看结果与联调

- [首页](http://127.0.0.1:8080/) 应显示「服务正常 · SQLite 3.53.4」。
- [健康接口](http://127.0.0.1:8080/api/health) 应返回 `status: UP`。HTTP 503 时查看后端日志中的数据库错误。
- 修改 `frontend/public/` 后，重新执行 `mvn spring-boot:run`，让 Maven 更新静态资源。停止应用请在启动终端按 `Ctrl+C`。
- 8080 被占用时，启动前可执行 `$env:SERVER_PORT = '8081'`。网页与 API 都改用 8081。

SQLite 默认使用 `backend/data/local/t93-demo.db`，首次打开数据库连接时生成。旧版根目录数据库如有数据，可在 `backend` 中启动前设置 `$env:T93_DATABASE_PATH = '../data/local/t93-demo.db'`，继续使用原文件。测试使用独立的临时数据库。

如需打包，在 `backend` 中执行 `mvn clean package`，随后运行 `java -jar target/t93-greenhouse-0.1.0-SNAPSHOT.jar`。JAR 已包含前端静态资源。

## 日常开发

开工前在仓库根目录执行 `git status`，确认工作区干净，再更新主分支并创建任务分支：

```powershell
git switch main
git pull --ff-only origin main
git switch -c feat/wangyue-monitor
```

页面改动放在 `frontend/public/`，接口、业务逻辑和数据访问放在 `backend/`。提交前在 `backend` 执行 `mvn test` 并打开首页验证。检查 `git diff --cached` 后提交并推送自己的分支，发 PR 交由队长审核合并。数据库文件、密钥和构建产物保存在本机。
