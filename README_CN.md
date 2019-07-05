# mishiro
[戳这里下载](https://github.com/toyobayashi/mishiro/releases) __（MacOS请按照下面的步骤和[Electron分发应用](http://electronjs.org/docs/tutorial/application-distribution)自行打包。请不要安装在有汉字的目录下）__  

## 特性

* 语言支持：中文 / 日本語 / English
* [ HOME ] 拿资源。(unity3d, acb, bdb, mdb)
* [ IDOL ] 查卡，拿卡面，拿角色语音。
* [ LIVE ] 拿背景音乐 / Live乐曲，谱面查看，玩。
* [ GACHA ] 同步卡池抽到爽。
* [ MENU ] 活动算分，设置等

谱面查看演示：[https://toyobayashi.github.io/mishiro-score-viewer/](https://toyobayashi.github.io/mishiro-score-viewer/)  
仓库：[mishiro-score-viewer](https://github.com/toyobayashi/mishiro-score-viewer)

## 开发 & 构建

### Windows 需要

* __Node.js 8+__
* __Python 2.7__
* __Visual Studio 2015/2017__
* __.Net 4.5.1__ （只有 Windows 7 需要）

### MacOS 需要  

* __Node.js 8+__
* __Python 2.7__
* __Xcode__ （终端运行 ```xcode-select --install``` 安装Command Line Tools）

### Linux 需要

* __Node.js 8+__
* __Python 2.7__
* __gcc__
* __make__

### 快速开始

1. 拉代码 / 更新代码  

    ``` bash 
    $ git clone https://github.com/toyobayashi/mishiro.git
    $ git pull
    ```

    **NOTE:** 由于 C++ 原生模块编译必须匹配对应的 Electron / Node.js 版本，每当 `package.json` 内的 `electron` 版本变化时，请手动删除以下的文件夹然后再重新跑一次 `npm install`。

    * `/app/node_modules/lame`
    * `/app/node_modules/sqlite3`
    * `/app/node_modules/hca-decoder`

2. 装依赖  

    ``` bat
    > cd mishiro/app

    REM 设置国内镜像
    > npm config set registry http://registry.npm.taobao.org/
    > npm config set electron_mirror https://npm.taobao.org/mirrors/electron/

    REM 获取 Electron 用于编译原生模块的头文件
    > npm install -g node-gyp
    > node-gyp install --target=4.2.2 --dist-url=https://atom.io/download/electron

    REM 获取 Electron 用于编译原生模块的头文件
    REM 如果你用的是 Windows 系统而且
    REM 你装的是 Visual Studio 2019
    > npm install -g toyobayashi/node-gyp#v3.8.0-vs2019
    > for /f "delims=" %P in ('npm prefix -g') do npm config set node_gyp "%P\node_modules\node-gyp\bin\node-gyp.js"
    > node-gyp install --target=4.2.2 --dist-url=https://atom.io/download/electron
    REM 结束

    REM 安装依赖
    > npm install
    ```

* 开发

    推荐使用 VSCode
    
    ``` bash
    # ~/mishiro/app$ code .
    $ npm run dev

    # 或者
    $ npm run serve
    $ npm start # 或者直接在 VSCode 里按 [F5]
    ```

* 构建  

    ``` bash
    $ npm run build
    ```

* 启动  

    ``` bash
    $ npm start
    ```

* 打包

    ``` bash
    $ npm run pack:x64 # x64 
    $ npm run pack:ia32 # Windows x86
    ```

## 参考
特别感谢：     
* [デレステ解析ノート](https://subdiox.github.io/deresute/)
* [subdiox/UnityLz4](https://github.com/subdiox/UnityLz4)
* [subdiox/StarlightTool](https://github.com/subdiox/StarlightTool)
* [Nyagamon/HCADecoder](https://github.com/Nyagamon/HCADecoder)
* [marcan/deresuteme](https://github.com/marcan/deresuteme)
* [summertriangle-dev/sparklebox](https://github.com/summertriangle-dev/sparklebox)
* [superk589/DereGuide](https://github.com/superk589/DereGuide)
* [OpenCGSS/DereTore](https://github.com/OpenCGSS/DereTore)

## 版权
CGSS及其相关所有内容的版权归[BANDAI NAMCO Entertainment Inc.](https://bandainamcoent.co.jp/)所属。  
