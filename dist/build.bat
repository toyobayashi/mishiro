@echo off

set version=%1
set arch=%2

if "%version%"=="" (
  echo Require target version.
  goto end
)

if "%arch%"=="x64" (
  makensis /DPRODUCT_VERSION=%version% /DLIBRARY_X64 mishiro.nsi
) else (
  makensis /DPRODUCT_VERSION=%version% mishiro.nsi
)

:end
