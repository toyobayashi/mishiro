# mishiro
[![Github All Releases](https://img.shields.io/github/downloads/toyobayashi/mishiro/total.svg)](https://github.com/toyobayashi/mishiro/releases)
[![GitHub release](https://img.shields.io/github/release/toyobayashi/mishiro.svg)](https://github.com/toyobayashi/mishiro/releases)
[![GitHub package version](https://img.shields.io/github/package-json/v/toyobayashi/mishiro.svg?label=version)]()
[![Electron](https://img.shields.io/badge/dynamic/json.svg?label=electron&url=https%3A%2F%2Fraw.githubusercontent.com%2Ftoyobayashi%2Fmishiro%2Fmaster%2Fpackage.json&query=%24.devDependencies.electron&colorB=9feaf9)](https://electronjs.org/)
[![Vue](https://img.shields.io/badge/dynamic/json.svg?label=vue&url=https%3A%2F%2Fraw.githubusercontent.com%2Ftoyobayashi%2Fmishiro%2Fmaster%2Fpackage.json&query=%24.dependencies.vue&colorB=41b883)](https://vuejs.org/)
[![Webpack](https://img.shields.io/badge/dynamic/json.svg?label=webpack&url=https%3A%2F%2Fraw.githubusercontent.com%2Ftoyobayashi%2Fmishiro%2Fmaster%2Fpackage.json&query=%24.devDependencies.webpack&colorB=55a7dd)](https://webpack.js.org/)
[![GitHub repo size in bytes](https://img.shields.io/github/repo-size/toyobayashi/mishiro.svg)](https://github.com/toyobayashi/mishiro/archive/master.zip)

[Release Download](https://github.com/toyobayashi/mishiro/releases) __(Windows Release Only)__  
[中文](https://github.com/toyobayashi/mishiro/blob/master/README_CN.md)


## Usage

* Run, and you see.
* [ HOME ] Download game resources. (unity3d, acb, bdb, mdb)
* [ IDOL ] Search idol card and download card background png from [starlight.kirara.ca](https://starlight.kirara.ca/) or character voice from game server.
* [ LIVE ] Download bgm or live songs from game server, or play game.
* [ GACHA ] Gacha simulation. (the same to game)
* [ MENU ] Event PT calculator, options...

## Build

### Windows
Require 
* __Node.js 8+__
* __Python 2.7__
* __Visual Studio 2015/2017__
* __.Net 4.5.1 (Windows 7 only)__  
### MacOS
Require 
* __Node.js 8+__
* __Python 2.7__
* __Xcode__ (install Command Line Tools by running ```xcode-select --install``` in your Terminal)

### Start Building
1. Clone.  
``` bash 
$ git clone https://github.com/toyobayashi/mishiro.git
```
2. Install dependencies. 
``` bash
$ cd mishiro

# if mainland Chinese, recommend
$ npm config set registry http://registry.npm.taobao.org/
$ npm config set electron_mirror https://npm.taobao.org/mirrors/electron/
# endif

$ npm install
```
3. Bundle production code.  
``` bash
$ npm run prod
```
4. Start!  
``` bash
$ npm start
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
