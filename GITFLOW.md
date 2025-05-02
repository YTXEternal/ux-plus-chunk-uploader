**把项目（clone）下载到本地**



## 初始化工作流

```cmd
git flow init
```




## master

不要直接在这个分支进行修改，也不要直接推送这个master分支

当你需要修改BUG的时候可以基于这个分支创建新的HOTFIX/*分支进行BUG的修改




## develop

**基于master分支创建。**

如果本地已有develop分支在编码前拉取合并一下最新的develop分支
```cmd
确保当前是在develop分支
git checkout develop
拉取githu进行更新
git pull origin develop
```

如果没有则自己创建一个develop分支
```cmd
git checkout -b develop
```
注：这个分支不要直接进行修改当你需要增加新功能时可以基于这个develop分支创建新的feature/*分支来进行开发




## feature/*
***代表一个任意的名字要符合你开发或者修改的相关内容**

基于develop分支创建

这个分支用来进行开发新功能

比如我要开发一个getData函数那就创建一个feature/getData分支在这个分支上进行开发就好了

```cmd
这个命令会创建  feature/getData分支
git flow feature start getData


...

当你的功能完成后并且进行了实际的测试以及单元测试后就可以进行提交了
pnpm commit
把你的feature分支推送到github中 等待我的审批就好了，当你的提交审核通过后就可以继续下面的操作了
git push origin feature/getData 
（审核通过后继续操作）
git flow feature finish getData  // 这个操作会直接合并到develop分支这个功能分支
```



## hotfix/*

***版本号 如v3.0.2**

基于master分支创建

这个分支用来修改bug

```cmd
git flow hotfix start v3.0.2  // 这个命令会创建  hotfix/v3.0.2分支 

...

修复完毕后
pnpm commit
把这个分支推送到github中(在这之前记得做实际的测试以及单元测试)
git push origin hotfix/v3.0.2

等待我审核通过你的提交后在继续下面的操作
合并回 master 和 develop 分支，并打上版本标签
git flow hotfix finish v3.0.2
git push origin v3.0.2
```



## release/*

***版本号 如v3.0.0**

基于develop分支创建

这个分支用来发布新的版本

develop分支开发完毕后如果需要发布新版本可以创建一个新的release分支比如v3.0.0

```cmd
git flow release start v3.0.0  // 这个命令会创建  release/v3.0.0分支 

...

开发完毕
git push origin release/v3.0.0

// 等待审核通过后继续操作
git flow release finish v3.0.0
git push origin v3.0.0
```



## chore/*

***代表一个任意的名字要符合你开发或者修改的相关内容**

基于develop分支进行创建

这个分支用来增加文档或者纠正文档或者删除多余依赖等等杂物

```cmd
创建
git checkout -b chore/*

...

这个分支完成后: 
提交一下更新的内容（注意根据提示来书写内容）
pnpm commit  
把分支推送到github由我来审核如果通过则继续以下操作
git push origin chore/*

通过后继续操作
git checkout develop
先拉取一遍以保证是最新的代码
git pull origin develop
git merge chore/*
```
