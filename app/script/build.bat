@echo off

@REM call npm.cmd config set toolset v144
@REM call npm.cmd config set msvs_version 2022

call npm.cmd install -g node-gyp@10

@REM for /f "delims=" %%P in ('npm prefix -g') do call npm.cmd config set node_gyp "%%P\node_modules\node-gyp\bin\node-gyp.js"
for /f "delims=" %%P in ('node -p "require('./app/package.json').devDependencies.electron"') do call node-gyp.cmd install --target=%%P --disturl=https://electronjs.org/headers

cd .\app
call npm.cmd install --legacy-peer-deps --verbose
call npm.cmd run build
cd ..
