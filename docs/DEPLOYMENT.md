# 公开演示部署说明

在线地址：<https://chloegao7376.github.io/mercury-five-lenses-workbench/>

仓库地址：<https://github.com/chloegao7376/mercury-five-lenses-workbench>

## GitHub Pages

仓库保持public。Pages使用GitHub Actions发布，Settings → Pages → Source为GitHub Actions。

每次推送main分支，工作流执行构建和测试，只将`dist/pages/`作为网站发布。这个目录包含内联应用的index.html、同内容的404.html和.nojekyll，不包含Worker、密钥或工作区数据。

公开模式由HTML中的`mercury-runtime=static-public`标记明确选择，不探测/api或连接旧站点。它不要求登录，不调用付费模型，业务状态保存在浏览器localStorage。

## 报告分享

可以直接转发演示网址。收件人首次打开看到独立的初始演示空间，不会看到发送人的笔记、上传内容、报告和操作记录。报告请导出HTML或Markdown文件另行分享。公开版不提供云端报告编号或跨浏览器同步。

## 后续需要实时模型时

GitHub Pages只托管静态网页。仓库保留可选服务端代码，但尚未配置独立的公开后端。不能通过把API key写进浏览器来启用模型。应先为独立后端配置身份、额度、密钥管理、数据边界和存储，再修改前端连接策略并验证。

当前模型接入代码和MCP接口可在本机运行。原托管平台的身份请求头只在可信认证网关后才有效，不能在新的公网部署中直接信任客户端发送的同名请求头。企业身份、团队权限和正式OA审批仍需另外建设。
