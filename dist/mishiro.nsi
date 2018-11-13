!include "MUI.nsh"
!include "x64.nsh"
!include "Library.nsh"

!define PRODUCT_NAME "mishiro"
!define PRODUCT_PUBLISHER "Toyobayashi"
!define PRODUCT_WEB_SITE "https://github.com/toyobayashi/mishiro"
!define PRODUCT_UNINST_KEY "Software\Microsoft\Windows\CurrentVersion\Uninstall\${PRODUCT_NAME}"
!define PRODUCT_UNINST_ROOT_KEY "HKLM"
!define PRODUCT_STARTMENU_REGVAL "NSIS:StartMenuDir"

!ifdef LIBRARY_X64
  !define PROGRAM_FILES_MAP $PROGRAMFILES64
  !define PRODUCT_ARCH "x64"
!else
  !define PROGRAM_FILES_MAP $PROGRAMFILES
  !define PRODUCT_ARCH "ia32"
!endif

!macro TIP_WHEN_AMD64_INSTALLER_RUNAT_X86
  !ifdef LIBRARY_X64
    ${If} ${RunningX64}
    ${Else}
      MessageBox MB_ICONINFORMATION|MB_OK "Please run this installer on x64 machines."
      Abort
    ${EndIf}
  !endif
!macroend

SetCompressor lzma

!define MUI_ABORTWARNING
!define MUI_ICON "..\app\src\res\icon\mishiro.ico"
!define MUI_UNICON "..\app\src\res\icon\mishiro.ico"

!insertmacro MUI_PAGE_WELCOME

!insertmacro MUI_PAGE_DIRECTORY

var ICONS_GROUP
!define MUI_STARTMENUPAGE_NODISABLE
!define MUI_STARTMENUPAGE_DEFAULTFOLDER "${PRODUCT_NAME}"
!define MUI_STARTMENUPAGE_REGISTRY_ROOT "${PRODUCT_UNINST_ROOT_KEY}"
!define MUI_STARTMENUPAGE_REGISTRY_KEY "${PRODUCT_UNINST_KEY}"
!define MUI_STARTMENUPAGE_REGISTRY_VALUENAME "${PRODUCT_STARTMENU_REGVAL}"
!insertmacro MUI_PAGE_STARTMENU Application $ICONS_GROUP

!insertmacro MUI_PAGE_INSTFILES

!insertmacro MUI_PAGE_FINISH

!insertmacro MUI_UNPAGE_INSTFILES

!insertmacro MUI_LANGUAGE "English"

!insertmacro MUI_RESERVEFILE_INSTALLOPTIONS

Name "${PRODUCT_NAME}-v${PRODUCT_VERSION}"
OutFile "${PRODUCT_NAME}-v${PRODUCT_VERSION}-win32-${PRODUCT_ARCH}-setup.exe"
InstallDir "${PROGRAM_FILES_MAP}\${PRODUCT_NAME}"
ShowInstDetails show
ShowUnInstDetails show
BrandingText "https://github.com/toyobayashi/mishiro"

Section "MainSection" SEC01
  SetOutPath "$INSTDIR\*.*"
  SetOverwrite ifnewer
  File /r "${PRODUCT_NAME}-v${PRODUCT_VERSION}-win32-${PRODUCT_ARCH}\*.*"

  !insertmacro MUI_STARTMENU_WRITE_BEGIN Application
  CreateDirectory "$SMPROGRAMS\$ICONS_GROUP"
  CreateShortCut "$SMPROGRAMS\$ICONS_GROUP\${PRODUCT_NAME}.lnk" "$INSTDIR\${PRODUCT_NAME}.exe"
  CreateShortCut "$DESKTOP\${PRODUCT_NAME}.lnk" "$INSTDIR\${PRODUCT_NAME}.exe"
  !insertmacro MUI_STARTMENU_WRITE_END
SectionEnd

Section -AdditionalIcons
  SetOutPath $INSTDIR
  !insertmacro MUI_STARTMENU_WRITE_BEGIN Application
  CreateShortCut "$SMPROGRAMS\$ICONS_GROUP\Uninstall.lnk" "$INSTDIR\uninst.exe"
  !insertmacro MUI_STARTMENU_WRITE_END
SectionEnd

Section -Post
  !ifdef LIBRARY_X64
    SetRegView 64
  !endif
  WriteUninstaller "$INSTDIR\uninst.exe"
  WriteRegStr ${PRODUCT_UNINST_ROOT_KEY} "${PRODUCT_UNINST_KEY}" "DisplayName" "$(^Name)"
  WriteRegStr ${PRODUCT_UNINST_ROOT_KEY} "${PRODUCT_UNINST_KEY}" "UninstallString" "$INSTDIR\uninst.exe"
  WriteRegStr ${PRODUCT_UNINST_ROOT_KEY} "${PRODUCT_UNINST_KEY}" "DisplayVersion" "${PRODUCT_VERSION}"
  WriteRegStr ${PRODUCT_UNINST_ROOT_KEY} "${PRODUCT_UNINST_KEY}" "URLInfoAbout" "${PRODUCT_WEB_SITE}"
  WriteRegStr ${PRODUCT_UNINST_ROOT_KEY} "${PRODUCT_UNINST_KEY}" "Publisher" "${PRODUCT_PUBLISHER}"
  !ifdef LIBRARY_X64
    SetRegView lastused
  !endif
SectionEnd

Section Uninstall
  !insertmacro MUI_STARTMENU_GETFOLDER "Application" $ICONS_GROUP
  Delete "$DESKTOP\${PRODUCT_NAME}.lnk"

  RMDir /r "$SMPROGRAMS\$ICONS_GROUP"

  RMDir /r "$INSTDIR"
  !ifdef LIBRARY_X64
    SetRegView 64
  !endif
  DeleteRegKey ${PRODUCT_UNINST_ROOT_KEY} "${PRODUCT_UNINST_KEY}"
  !ifdef LIBRARY_X64
    SetRegView lastused
  !endif
  SetAutoClose true
SectionEnd

Function .onInit
  !insertmacro TIP_WHEN_AMD64_INSTALLER_RUNAT_X86
FunctionEnd

Function un.onInit
  !insertmacro TIP_WHEN_AMD64_INSTALLER_RUNAT_X86
  MessageBox MB_ICONQUESTION|MB_YESNO|MB_DEFBUTTON2 "Do you want to uninstall $(^Name)? " IDYES +2
  Abort
FunctionEnd

Function un.onUninstSuccess
  HideWindow
  MessageBox MB_ICONINFORMATION|MB_OK "$(^Name) is uninstalled successfully."
FunctionEnd
