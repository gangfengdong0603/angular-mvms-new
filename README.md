#### 项目安装方法：

***


- 安装`nodejs`
- 使用npm安装全局的`bower`和`component`这两个包管理器: 

```
  npm install -g bower  
  npm install -g component
```

- 执行`npm install`，安装开发环境所依赖的模块
- 执行:

```
  component install && component build
  bower install
```

以上两个安装的前端项目依赖的模块

***

#### 项目介绍 && 使用方法

***



这个项目基于`angularJS`，开发环境是`nodejs`，项目自动化构建用的`make`

这个是个单页面应用，页面放在`views`文件夹，开发环境所有页面都是基于`jade`模板开发，开发时不要直接修改`html`文件，也不要提交`html`文件

`css` 、`javascript`以及相关模板片段（jade）全部放在`public`目录下:

- `stylesheets`目录放置css，开发时基于`stylus`，请不要直接修改和提交`css`文件
- `images`放置图片
- `partials`目录放置页面用到的模板，全部基于`jade`开发
- `template`目录放置的是框架的弹层插件所用到的模板片段, 弹层用的是`angular-ui`这个插件
- `javascripts`放置的是前端所有js的逻辑代码:
  - app.js 是前端router的定义
  - controller.js 是页面直接对应的逻辑层代码
  - directive.js 定义一些声明式事件：比如拖拽等
  - sevice.js 定义和服务端交互的抽象层js代码，以及一些通用服务
  - ui-bootstrap-custom-0.6.0.js 是从`angular-ui`里提取的弹层服务, 目前使用比较稳定，不需要更新
- `support`目录放置的是处理静态文件的一些逻辑代码，运行在nodejs环境
- `datas`放的是测试时用的一些测试数据，可以删除


***

#### 关于Makefile

***

make命令执行前端工程的自动化构建：压缩js、压缩css、合并文件以及调用support里的脚本来处理静态文件的路径等问题，最后调用`tools/send`脚本用于像服务端同步本地前端项目的文件, 通过ftp, 用的是mac下的`lftp`命令，linux下可以直接用ftp命令, 请对应系统更新send脚本相关命令



