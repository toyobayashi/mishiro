# mishiro
[戳这里下载](https://github.com/toyobayashi/mishiro/releases)

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
```
3. 打包生产环境代码。  
``` bash 
> npm run prod
```
4. 走你！  
``` bash 
> npm start
```

## 版权
CGSS及其相关所有内容的版权归[BANDAI NAMCO Entertainment Inc.](https://bandainamcoent.co.jp/)所属。  
