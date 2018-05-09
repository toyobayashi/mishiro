# mishiro
[Release Download](https://github.com/toyobayashi/mishiro/releases)  
[中文](https://github.com/toyobayashi/mishiro/blob/master/README_CN.md)

## Usage

* Run, and you see.
* [ HOME ] Download game resources. (unity3d, acb, bdb, mdb)
* [ IDOL ] Search idol card and download card background png from [starlight.kirara.ca](https://starlight.kirara.ca/) or character voice from game server.
* [ LIVE ] Download bgm or live songs from game server, or play game.
* [ GACHA ] Gacha simulation. (the same to game)
* [ MENU ] Event PT calculator, options...

## Build
Require __Node.js 8+__, __Python 2.7__, __Visual Studio 2015/2017__, __.Net 4.5.1 (Windows 7 only)__.  
1. Clone.  
``` bash 
> git clone https://github.com/toyobayashi/mishiro.git
```
2. Install dependencies. If you are in Chinese mainland, maybe you should run ```npm config set ELECTRON_MIRROR=https://npm.taobao.org/mirrors/electron/```before your installing.  
``` bash
> cd mishiro
> npm install
> npm run sql64
> npm run reb:hca-x64
```
3. Run building command.  
``` bash
> npm run prod
```
4. Start!  
``` bash
> npm start
```

## Reference
Special thanks:   
* [デレステ解析ノート](https://subdiox.github.io/deresute/)
* [subdiox/UnityLz4](https://github.com/subdiox/UnityLz4)
* [subdiox/StarlightTool](https://github.com/subdiox/StarlightTool)
* [Nyagamon/HCADecoder](https://github.com/Nyagamon/HCADecoder)
* [marcan/deresuteme](https://github.com/marcan/deresuteme)
* [summertriangle-dev/sparklebox](https://github.com/summertriangle-dev/sparklebox)
* [superk589/DereGuide](https://github.com/superk589/DereGuide)
* [OpenCGSS/DereTore](https://github.com/OpenCGSS/DereTore)


## Copyright
The copyright of CGSS and its related content is held by [BANDAI NAMCO Entertainment Inc.](https://bandainamcoent.co.jp/)  
