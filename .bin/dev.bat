@echo off

set /a size=105*1024

for %%i in ("..\public\dll.js") do (
  if %%~zi gtr %size% npm run dev
  if %%~zi lss %size% npm run dll&&npm run dev
)
