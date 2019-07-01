# mishiro
[![Github All Releases](https://img.shields.io/github/downloads/toyobayashi/mishiro/total.svg)](https://github.com/toyobayashi/mishiro/releases)
[![GitHub release](https://img.shields.io/github/release/toyobayashi/mishiro.svg)](https://github.com/toyobayashi/mishiro/releases)
[![Electron](https://img.shields.io/badge/dynamic/json.svg?label=electron&url=https%3A%2F%2Fraw.githubusercontent.com%2Ftoyobayashi%2Fmishiro%2Fmaster%2Fapp%2Fpackage.json&query=%24.devDependencies.electron&colorB=9feaf9)](https://electronjs.org/)
[![GitHub repo size in bytes](https://img.shields.io/github/repo-size/toyobayashi/mishiro.svg)](https://github.com/toyobayashi/mishiro/archive/master.zip)
[![Build status](https://ci.appveyor.com/api/projects/status/qv7x4qj669pyolfi/branch/master?svg=true)](https://ci.appveyor.com/project/toyobayashi/mishiro/branch/master)
[![Build status](https://travis-ci.com/toyobayashi/mishiro.svg?branch=master)](https://travis-ci.com/toyobayashi/mishiro/)
<!-- [![Vue](https://img.shields.io/badge/dynamic/json.svg?label=vue&url=https%3A%2F%2Fraw.githubusercontent.com%2Ftoyobayashi%2Fmishiro%2Fmaster%2Fapp%2Fpackage.json&query=%24.dependencies.vue&colorB=41b883)](https://vuejs.org/)
[![Webpack](https://img.shields.io/badge/dynamic/json.svg?label=webpack&url=https%3A%2F%2Fraw.githubusercontent.com%2Ftoyobayashi%2Fmishiro%2Fmaster%2Fapp%2Fpackage.json&query=%24.devDependencies.webpack&colorB=55a7dd)](https://webpack.js.org/) -->

<font color="green" size=5>**Latest Available Version: [1.9.1](https://github.com/toyobayashi/mishiro/releases/tag/v1.9.1)**</font>

[Release Download](https://github.com/toyobayashi/mishiro/releases) __(Do not install mishiro in a path which includes Chinese or Japanese characters)__  
[中文](https://github.com/toyobayashi/mishiro/blob/master/README_CN.md)

## Screenshot

![screenshot.png](https://github.com/toyobayashi/mishiro/raw/master/img/screenshot.png)

## Feature

* Support language: Chinese / Japanese / English.
* [ HOME ] Get game resources. (unity3d, acb, bdb, mdb)
* [ IDOL ] Search idol card, get card background png / character voice.
* [ LIVE ] Get BGM / live songs, view live score, play.
* [ GACHA ] Gacha simulation. (official odds)
* [ MENU ] Event PT calculator, options...

Score viewer demo: [https://toyobayashi.github.io/mishiro-score-viewer/](https://toyobayashi.github.io/mishiro-score-viewer/)  
Repo: [mishiro-score-viewer](https://github.com/toyobayashi/mishiro-score-viewer)

<!-- * [ IDOL ] Search idol card and download card background png from [starlight.kirara.ca](https://starlight.kirara.ca/) or character voice from game server. -->

## Development & Building

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
* __gcc__
* __make__

### Quick Start

1. Clone / Pull  

    ``` bash 
    $ git clone https://github.com/toyobayashi/mishiro.git
    $ git pull
    ```

    **NOTE:** Due to C++ native addon compilation must match correct Electron / Node.js version, when `electron` version in `package.json` changed, please remove the following folders manually then run `npm install` again.

    * `/app/node_modules/lame`
    * `/app/node_modules/sqlite3`
    * `/app/node_modules/hca-decoder`

2. Install  

    ``` bat
    > cd mishiro/app

    REM if mainland Chinese, recommend
    > npm config set registry http://registry.npm.taobao.org/
    > npm config set electron_mirror https://npm.taobao.org/mirrors/electron/
    REM endif

    REM if you have not downloaded Electron's C++ header
    > npm install -g node-gyp
    > node-gyp install --target=4.2.2 --dist-url=https://atom.io/download/electron
    REM else

    REM if you have not downloaded Electron's C++ header and
    REM your system is windows and
    REM you installed Visual Studio 2019
    > npm install -g toyobayashi/node-gyp#v3.8.0-vs2019
    > for /f "delims=" %P in ('npm prefix -g') do npm config set node_gyp "%P\node_modules\node-gyp\bin\node-gyp.js"
    > node-gyp install --target=4.2.2 --dist-url=https://atom.io/download/electron
    REM endif 

    REM install dependencies
    > npm install
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
    $ npm run pkg64 # x64 
    $ npm run pkg32 # Windows x86
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
