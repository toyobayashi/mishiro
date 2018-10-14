# mishiro
[![Github All Releases](https://img.shields.io/github/downloads/toyobayashi/mishiro/total.svg)](https://github.com/toyobayashi/mishiro/releases)
[![GitHub release](https://img.shields.io/github/release/toyobayashi/mishiro.svg)](https://github.com/toyobayashi/mishiro/releases)
[![Electron](https://img.shields.io/badge/dynamic/json.svg?label=electron&url=https%3A%2F%2Fraw.githubusercontent.com%2Ftoyobayashi%2Fmishiro%2Fmaster%2Fapp%2Fpackage.json&query=%24.devDependencies.electron&colorB=9feaf9)](https://electronjs.org/)
[![GitHub repo size in bytes](https://img.shields.io/github/repo-size/toyobayashi/mishiro.svg)](https://github.com/toyobayashi/mishiro/archive/master.zip)
[![Build status](https://ci.appveyor.com/api/projects/status/qv7x4qj669pyolfi/branch/master?svg=true)](https://ci.appveyor.com/project/toyobayashi/mishiro/branch/master)
<!-- [![Vue](https://img.shields.io/badge/dynamic/json.svg?label=vue&url=https%3A%2F%2Fraw.githubusercontent.com%2Ftoyobayashi%2Fmishiro%2Fmaster%2Fapp%2Fpackage.json&query=%24.dependencies.vue&colorB=41b883)](https://vuejs.org/)
[![Webpack](https://img.shields.io/badge/dynamic/json.svg?label=webpack&url=https%3A%2F%2Fraw.githubusercontent.com%2Ftoyobayashi%2Fmishiro%2Fmaster%2Fapp%2Fpackage.json&query=%24.devDependencies.webpack&colorB=55a7dd)](https://webpack.js.org/) -->


[Release Download](https://github.com/toyobayashi/mishiro/releases) __(Do not install mishiro in a path which includes Chinese or Japanese characters)__  
[中文](https://github.com/toyobayashi/mishiro/blob/master/README_CN.md)


## Usage

* Run, and you see.
* [ HOME ] Download game resources. (unity3d, acb, bdb, mdb)
* [ IDOL ] Search idol card and download card background png or character voice from game server.
* [ LIVE ] Download bgm or live songs from game server, or play game.
* [ GACHA ] Gacha simulation. (the same to game)
* [ MENU ] Event PT calculator, options...

<!-- * [ IDOL ] Search idol card and download card background png from [starlight.kirara.ca](https://starlight.kirara.ca/) or character voice from game server. -->

## Develop & Build

### Windows Require
 
* __Node.js 8+__
* __Python 2.7__
* __Visual Studio 2015/2017__
* __.Net 4.5.1 (Windows 7 only)__  

### MacOS Require
 
* __Node.js 8+__
* __Python 2.7__
* __Xcode__ (install Command Line Tools by running ```xcode-select --install``` in your terminal)

### Linux Require

* __Node.js 8+__
* __Python 2.7__
* __gcc & g++__
* __make__

### Quick Start

1. Clone  

    ``` bash 
    $ git clone https://github.com/toyobayashi/mishiro.git
    ```

2. Install  

    ``` bash
    $ cd mishiro/app

    # if mainland Chinese, recommend
    $ npm config set registry http://registry.npm.taobao.org/
    $ npm config set electron_mirror https://npm.taobao.org/mirrors/electron/
    # endif

    # if you have not downloaded Electron's C++ header
    $ npm install -g node-gyp
    $ node-gyp install --target=3.0.4 --dist-url=https://atom.io/download/electron

    # install dependencies
    $ npm install
    ```

* Develop

    Recommend VSCode.
    
    ``` bash
    # ~/mishiro/app$ code .
    $ npm run dev
    $ npm start # or press [F5] in vscode
    ```

* Build  

    ``` bash
    $ npm run prod
    ```

* Launch  

    ``` bash
    $ npm start
    ```

* Pack

    ``` bash
    $ npm run pkg64 install
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
