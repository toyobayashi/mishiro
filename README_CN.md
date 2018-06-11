# mishiro
[戳这里下载](https://github.com/toyobayashi/mishiro/releases) __（只提供Windwos的发布版，MacOS请按照下面的步骤自行编译打包__  

## 用法

* 跑一下，就知道。
* [ HOME ] 拿资源。(unity3d, acb, bdb, mdb)
* [ IDOL ] 查卡，从[starlight.kirara.ca](https://starlight.kirara.ca/)拿卡面，拿角色语音。
* [ LIVE ] 拿音乐，玩。
* [ GACHA ] 同步卡池抽到爽。
* [ MENU ] 活动算分，设置等

## 构建

### Windows
需要 
* __Node.js 8+__
* __Python 2.7__
* __Visual Studio 2015/2017__
* __.Net 4.5.1__ （只有Windows 7需要）
### MacOS
需要 
* __Node.js 8+__
* __Python 2.7__
* __Xcode__ （终端运行 ```xcode-select --install```安装Command Line Toos）
### 开始构建
1. 克隆这个git仓库。  
``` bash 
$ git clone https://github.com/toyobayashi/mishiro.git
```
2. 安装依赖。  
``` bash 
$ cd mishiro

# 如果你在中国大陆，由于众所周知的原因，建议
$ npm config set registry http://registry.npm.taobao.org/
$ npm config set ELECTRON_MIRROR https://npm.taobao.org/mirrors/electron/
# 建议结束

$ npm install
```
3. 打包生产环境代码。  
``` bash 
$ npm run prod
```
4. 走你！  
``` bash 
$ npm start
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
