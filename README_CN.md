# mishiro
[戳这里下载](https://github.com/toyobayashi/mishiro/releases)

## 用法

* 跑一下，就知道。
* [ HOME ] 拿资源。(unity3d, acb, bdb, mdb)
* [ IDOL ] 查卡，从[starlight.kirara.ca](https://starlight.kirara.ca/)拿卡面，拿角色语音。
* [ LIVE ] 拿音乐，玩。
* [ GACHA ] 同步卡池抽到爽。
* [ MENU ] 活动算分，设置等

## 构建
需要 __Node.js__ 和 __npm__。  
1. 克隆这个git仓库。  
``` bash 
> git clone https://github.com/toyobayashi/mishiro.git
```
2. 安装依赖。由于众所周知的原因，安装前可能需要先全局配置一下npm。  
``` bash 
> cd mishiro
> npm config set registry http://registry.npm.taobao.org/
> npm config set ELECTRON_MIRROR https://npm.taobao.org/mirrors/electron/
> npm install
> npm run sql64
> npm run reb:hca-x64
```
3. 打包生产环境代码。  
``` bash 
> npm run prod
```
4. 走你！  
``` bash 
> npm start
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
