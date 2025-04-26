## 项目文件解释

### build

项目构建配置

common.ts 公共配置

dev.ts	   开发配置

lib.ts	     生产配置

test.ts           测试配置



### server

本地实际测试api接口（在项目开发时需要启动这个服务）

npm install

运行

npm run dev



### src/packages

项目源文件



### src/main.ts,src/upload.ts

项目开发时的调试文件



### examples

在打包dist后进行生产测试使用pnpm link连接dist打包后的产物导入项目中使用



### tests

基于vitest进行单元测试



## 启动项目

基于项目根目录下

前端

```
pnpm install
pnpm dev
```



后端服务

```
cd server
npm install
```



注：该项目基于commitizen进行规范化提交代码请严格按照提示进行提交以及 gitflow工作流来进行开发，谢谢