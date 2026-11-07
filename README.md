# T93 智慧农业大棚

校赛 Demo 的第一版工程。一个 Spring Boot 进程同时提供原生网页和 JSON 接口。首页显示实际服务状态，`GET /api/health` 通过 JDBC 查询 SQLite。监测、告警、工单和农技问答由各模块负责人继续实现。

| 组件 | 团队版本 |
| --- | --- |
| Eclipse Temurin JDK | 17.0.21+9 |
| Apache Maven | 3.9.16 |
| Spring Boot | 3.5.16 |
| Xerial SQLite JDBC | 3.53.4.0（SQLite 3.53.4） |
| 前端 | HTML、CSS、JavaScript，通过 Spring Boot 同源提供 |

## 运行与验收

1. 打开 PowerShell，进入包含 `pom.xml` 的目录。
2. 执行 `java -version`、`javac -version`、`mvn -v`，核对上面的版本。Maven 输出里的 Java 也应为 17.0.21。
3. 逐条运行下列命令。第一次构建需要联网下载 Maven 依赖。看到测试成功后再运行第二条。

```powershell
mvn test
mvn spring-boot:run
```

浏览器访问 `http://127.0.0.1:8080/`，首页应显示「服务正常」和 SQLite 版本。也可以保持服务终端运行，另开一个 PowerShell 检查：

```powershell
Invoke-RestMethod 'http://127.0.0.1:8080/api/health'
```

成功时返回 HTTP 200，响应示例：

```json
{"status":"UP","service":"t93-greenhouse","sqliteVersion":"3.53.4"}
```

数据库查询失败时返回 HTTP 503，`status` 为 `DOWN`。本机数据库默认位于 `data/local/t93-demo.db`，服务自动创建父目录，SQLite 在打开连接时创建文件。测试使用临时文件，不依赖或修改这份数据库。无需单独启动数据库服务。首次打开可以调用健康接口生成数据库，关闭服务在原终端按 `Ctrl+C`。

如果 8080 已被占用，可在启动前设置 `$env:SERVER_PORT = '8081'`，然后使用 8081 访问。需要临时使用另一份数据库时，可在启动终端设置 `$env:T93_DATABASE_PATH = 'data/local/t93-practice.db'`。两个变量只影响该终端及从它启动的进程。

## 文件位置

| 路径 | 内容 |
| --- | --- |
| `pom.xml` | Java 编译版本、Spring Boot 与 SQLite JDBC 依赖 |
| `src/main/java/cn/t93/greenhouse/` | Java 入口、数据库连接和健康接口 |
| `src/main/resources/application.properties` | 本机监听地址、端口和数据库路径 |
| `src/main/resources/static/` | 首页、CSS 和原生 JavaScript |
| `src/test/` | 用真实 HTTP 和临时 SQLite 文件进行验收 |

前端调用 `/api/health` 等相对路径。从 Java 服务地址打开网页，直接双击 `index.html` 无法联调接口。

## 首次推送到 GitHub

如果 GitHub 上还没有仓库，创建名为 `t93-greenhouse` 的私有空仓库，跳过在线 README、许可证和忽略规则初始化。然后在本目录执行下列命令。首次使用 Git 的同学先配置 `user.name` 和 `user.email`。

```powershell
git init -b main
git add -- pom.xml README.md .gitignore src
git diff --cached --stat
git commit -m "chore: initialize T93 greenhouse demo"
$repoUrl = Read-Host 'Paste the GitHub HTTPS clone URL'
git remote add origin $repoUrl
git push -u origin main
```

如果已在 GitHub 勾选 README 并创建了 `main`，先克隆该仓库到另一个目录。将本骨架的 `pom.xml`、`src/`、`.gitignore` 和 `README.md` 复制进克隆目录，再在那里提交并推送。保留克隆目录原有的 `.git`，从现有 `main` 历史继续。

## 组员日常协作

接受邀请后，在存放项目的父目录打开 PowerShell，首次执行：

```powershell
$repoUrl = Read-Host 'Paste the team HTTPS clone URL'
git clone $repoUrl
cd t93-greenhouse
mvn test
```

开始新任务前先确认工作区干净，更新 `main` 后创建自己的分支。以下以监测页为例：

```powershell
git status
git switch main
git pull --ff-only origin main
git switch -c feat/wangyue-monitor
```

改动、自测后，使用 `git add -- 实际改动路径` 选择文件，检查 `git diff --cached`，再提交和推送。首次推送使用 `git push -u origin feat/wangyue-monitor`。到 GitHub 发 PR，目标分支为 `main`，由队长审核合并。保留密钥、本机数据库和构建结果在本地。
