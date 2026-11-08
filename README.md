# T93 智慧农业大棚

校赛 Demo 使用同一仓库中的两个独立进程。前端负责页面与交互，后端提供 REST API 并访问 SQLite。

```text
t93-greenhouse/
├── frontend/
│   ├── public/            # 原生 HTML、CSS、JavaScript
│   └── dev-server.mjs     # 本地静态文件服务和 /api 转发
├── backend/
│   ├── pom.xml            # Java 与 Maven 依赖版本
│   ├── src/main/          # Spring Boot、REST API、SQLite 配置
│   └── src/test/          # 后端 HTTP 与 SQLite 验收测试
└── README.md
```

| 组件 | 团队版本 |
| --- | --- |
| Eclipse Temurin JDK | 17.0.21+9 |
| Apache Maven | 3.9.16 |
| Spring Boot | 3.5.16 |
| Xerial SQLite JDBC | 3.53.4.0（SQLite 3.53.4） |
| Node.js | 24.20.0，仅用于启动前端本地服务 |

Node.js 从 [官方固定版本下载页](https://nodejs.org/dist/v24.20.0/) 获取，Windows x64 选择 MSI。前端源码是原生 HTML、CSS 和 JavaScript，开发服务没有第三方依赖，安装 Node.js 后直接启动即可。安装完成后重开终端，用 `node -v`、`java -version` 和 `mvn -v` 核对版本。

## 获取项目

接受私有仓库邀请后，在存放项目的父目录执行。已经克隆过的组员直接进入项目目录，确认工作区干净后用 `git switch main` 和 `git pull --ff-only origin main` 更新。

```powershell
git clone https://github.com/2309749005-collab/t93-greenhouse.git
cd t93-greenhouse
```

## 开两个 PowerShell，同时运行前后端

**终端 1。从仓库根目录启动后端。** 第一次运行 Maven 需要联网下载依赖。等待日志显示服务已启动，并保持终端打开。

```powershell
cd backend
mvn test
mvn spring-boot:run
```

**终端 2。从仓库根目录启动前端。** 如果终端开在 `backend` 目录，先执行 `cd ..` 回到仓库根目录。

```powershell
cd frontend
node dev-server.mjs
```

**浏览器打开 [前端首页](http://127.0.0.1:5173/)**。首页出现「服务正常 · SQLite 3.53.4」表示链路正常。点击「重新检查」可以再次请求接口。要停止某一端，在对应终端按 `Ctrl+C`。

## 联调与排障

```text
浏览器 :5173 → 前端服务 /api/* → Java 后端 :8080 → SQLite
```

前端代码使用 `fetch('/api/health')` 这类相对地址。前端开发服务将 `/api` 请求转发到 `127.0.0.1:8080`，页面和 API 对浏览器是同源的。实际部署时由部署层保留同一条转发规则。两个本地服务都监听 `127.0.0.1`，队员在自己的电脑上分别启动。

在第三个 PowerShell 可以分别检查直连接口和经前端转发的接口：

```powershell
Invoke-RestMethod 'http://127.0.0.1:8080/api/health'
Invoke-RestMethod 'http://127.0.0.1:5173/api/health'
```

两条命令都应返回 `status: UP`、`service: t93-greenhouse` 和 `sqliteVersion: 3.53.4`。前端转发返回 `502` 时，先检查 Java 是否启动、端口是否一致。后端返回 `503` 时，查看 Java 日志中的 SQLite 错误。Java 端口的根地址返回 `404` 属于正常行为，首页由前端提供。

如果 8080 被占用，后端启动前在终端 1 设置 `$env:SERVER_PORT = '8081'`，前端启动前在终端 2 设置 `$env:BACKEND_PORT = '8081'`。如果 5173 被占用，在终端 2 设置 `$env:FRONTEND_PORT = '5174'`，改用 5174 打开页面。

SQLite 默认使用 `backend/data/local/t93-demo.db`，在第一次打开数据库连接时生成。若旧版根目录的 `data/local/t93-demo.db` 有数据，启动后端前可在终端 1 设置 `$env:T93_DATABASE_PATH = '../data/local/t93-demo.db'`，继续使用原文件。测试独立使用临时 SQLite 文件。

## 日常开发

开工前在仓库根目录执行 `git status`，确认没有未提交改动，再同步主分支并创建任务分支。例如：

```powershell
git switch main
git pull --ff-only origin main
git switch -c feat/wangyue-monitor
```

页面改动放在 `frontend/public/`，接口、业务逻辑和数据访问放在 `backend/`。提交前运行 `backend` 下的 `mvn test`，并打开前端页面验证功能。使用 `git add -- 实际路径` 选择文件，检查 `git diff --cached`，然后提交并推送自己的分支。发 PR 时选择 `main` 为目标分支，由队长审核合并。数据库文件、密钥和构建产物保存在本机。
