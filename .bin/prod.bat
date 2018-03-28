@echo off
set NODE_ENV=production
echo NODE_ENV = production
..\node_modules\.bin\webpack --config ..\build\webpack.dll.config.js --progress&&..\node_modules\.bin\webpack --config ..\build\webpack.config.js --progress
