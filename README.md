# mishiro
[![Github All Releases](https://img.shields.io/github/downloads/toyobayashi/mishiro/total.svg)](https://github.com/toyobayashi/mishiro/releases)
[![GitHub release](https://img.shields.io/github/release/toyobayashi/mishiro.svg)](https://github.com/toyobayashi/mishiro/releases)
[![Electron](https://img.shields.io/badge/dynamic/json.svg?label=electron&url=https%3A%2F%2Fraw.githubusercontent.com%2Ftoyobayashi%2Fmishiro%2Fmaster%2Fapp%2Fpackage.json&query=%24.devDependencies.electron&colorB=9feaf9)](https://electronjs.org/)
[![GitHub repo size in bytes](https://img.shields.io/github/repo-size/toyobayashi/mishiro.svg)](https://github.com/toyobayashi/mishiro/archive/master.zip)
<!-- [![Build status](https://travis-ci.com/toyobayashi/mishiro.svg?branch=master)](https://travis-ci.com/toyobayashi/mishiro/) -->
[![Build](https://github.com/toyobayashi/mishiro/workflows/Build/badge.svg)](https://github.com/toyobayashi/mishiro/actions)
<!-- [![Build status](https://ci.appveyor.com/api/projects/status/qv7x4qj669pyolfi/branch/master?svg=true)](https://ci.appveyor.com/project/toyobayashi/mishiro/branch/master) -->
<!-- [![Vue](https://img.shields.io/badge/dynamic/json.svg?label=vue&url=https%3A%2F%2Fraw.githubusercontent.com%2Ftoyobayashi%2Fmishiro%2Fmaster%2Fapp%2Fpackage.json&query=%24.dependencies.vue&colorB=41b883)](https://vuejs.org/)
[![Webpack](https://img.shields.io/badge/dynamic/json.svg?label=webpack&url=https%3A%2F%2Fraw.githubusercontent.com%2Ftoyobayashi%2Fmishiro%2Fmaster%2Fapp%2Fpackage.json&query=%24.devDependencies.webpack&colorB=55a7dd)](https://webpack.js.org/) -->

<!-- <font color="green" size=5>**Latest Available Version: [2.0.0](https://github.com/toyobayashi/mishiro/releases/tag/v2.0.0)**</font> -->

[中文 README](https://github.com/toyobayashi/mishiro/blob/master/README_CN.md)

## Download

* [Download from Github Release](https://github.com/toyobayashi/mishiro/releases)  
<!-- * [Download from Gitee Release (Chinese user)](https://gitee.com/toyobayashi/mishiro/releases)   -->

Note：

* Do not install mishiro in a path which includes Chinese or Japanese characters.

* If you have trouble to launch or experience any error, try to install the latest version.
<!-- * Mac users please refer to the following building steps and [Electron's document](http://electronjs.org/docs/tutorial/application-distribution) to compile and pack mishiro. -->

## Screenshot

![screenshot.png](https://github.com/toyobayashi/mishiro/raw/master/img/screenshot.png)

## Feature

* Support language: Chinese / Japanese / English.
* [ HOME ] Get game resources. (unity3d, acb, bdb, mdb)
* [ IDOL ] Search idol card, get card background png / character voice.
* [ COMMU ] Producer searching.
* [ LIVE ] Get BGM / live songs, view live score, play.
* [ MENU ] Event PT calculator, options...

Score viewer demo: [https://toyobayashi.github.io/mishiro-score-viewer/](https://toyobayashi.github.io/mishiro-score-viewer/)  
Repo: [mishiro-score-viewer](https://github.com/toyobayashi/mishiro-score-viewer)

<!-- * [ IDOL ] Search idol card and download card background png from [starlight.kirara.ca](https://starlight.kirara.ca/) or character voice from game server. -->

## Development & Building

### Windows Require

* __Windows 7+__
* __Node.js 18+__
* __Python 3__
* __Visual Studio 2022 with C++ Desktop workload installed__
* __.NET & Powershell__

### Linux Require

* __Node.js 18+__
* __Python 3__
* __gcc & g++__
* __make__
* __zip & unzip__

### MacOS Require (This part is not tested)
 
* __Node.js 18+__
* __Python 3__
* __Xcode__ (install Command Line Tools by running ```xcode-select --install``` in your terminal)

### Quick Start

1. Clone / Pull  

    ``` bash 
    $ git clone https://github.com/toyobayashi/mishiro.git

    $ git pull
    ```

    **NOTE:** Due to C++ native addon compilation must match correct Electron / Node.js version, when `electron` version in `package.json` changed, please remove the following folders manually then run `npm install` again.

    * `/app/node_modules/mishiro-core`
    * `/app/node_modules/sqlite3`
    * `/app/node_modules/hca-decoder`
    * `/app/node_modules/spdlog`
    * `/app/node_modules/usm-decrypter`

    You can also just run `npm run rm` to do this.

2. Install  

    * Windows

        ``` bat
        > cd mishiro/app

        > npm install -g node-gyp

        REM install electron's node C++ header
        > for /f "delims=" %P in ('node -p "require('./package.json').devDependencies.electron"') do node-gyp install --target=%P --dist-url=https://electronjs.org/headers

        REM install dependencies
        > npm install
        REM get external resources
        > npm run get
        ```
    
    * Linux / MacOS

        ``` bash
        $ cd mishiro/app

        $ npm install -g node-gyp
        $ node-gyp install --target=$(node -p require\(\'./package.json\'\).devDependencies.electron) --dist-url=https://electronjs.org/headers

        $ npm install
        $ npm run get # get external resources
        ```

    If run `npm install` error, remove `package-lock.json` then try again.

* Develop

    Recommend VSCode.
    
    ``` bash
    # ~/mishiro/app$ code .
    $ npm run dev

    # or
    $ npm run serve
    # then launch mishiro by vscode debug mode
    ```

* Build  

    ``` bash
    # bundle code for production
    $ npm run build
    ```

* Launch  

    ``` bash
    # launch mishiro in production mode
    $ npm start
    ```

* Pack

    ``` bash
    $ npm run pack:x64 # x64 
    $ npm run pack:ia32 # Windows x86
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
