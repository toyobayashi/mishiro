@echo off

set /a size=780*1024

for %%i in ("..\public\dll.js") do (
  if %%~zi gtr %size% ..\node_modules\.bin\webpack --config ..\build\webpack.config.js -w
  if %%~zi lss %size% ..\node_modules\.bin\webpack --config ..\build\webpack.dll.config.js&&..\node_modules\.bin\webpack --config ..\build\webpack.config.js -w
)
