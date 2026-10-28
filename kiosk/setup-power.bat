@echo off
REM ============================================================
REM  HINDI PAGPAPATULOG NG KIOSK
REM
REM  Kahit tama ang lahat sa app, papatayin pa rin ng Windows
REM  ang TV pagkaraan ng ilang minutong walang gumagalaw — at
REM  walang gigising niyon hanggang may pumindot sa screen.
REM
REM  PATAKBUHIN ITO BILANG ADMINISTRATOR:
REM    kanang-klik sa file na ito > "Run as administrator"
REM  Isang beses lang ito kailangan sa bawat mini PC.
REM ============================================================

net session >nul 2>&1
if errorlevel 1 (
  echo.
  echo   KAILANGAN ITONG PATAKBUHIN BILANG ADMINISTRATOR.
  echo   Kanang-klik sa file na ito, tapos "Run as administrator".
  echo.
  pause
  exit /b 1
)

echo Pinapatay ang lahat ng timer ng pagtulog habang nakasaksak...

REM  0 = huwag nang patayin kailanman.
powercfg /change monitor-timeout-ac 0
powercfg /change standby-timeout-ac 0
powercfg /change disk-timeout-ac 0
powercfg /change hibernate-timeout-ac 0

REM  Ganoon din kapag baterya ang gamit, sakaling laptop ang kiosk.
powercfg /change monitor-timeout-dc 0
powercfg /change standby-timeout-dc 0

REM  Screen saver — ito ang madalas na nakakaligtaan.
reg add "HKCU\Control Panel\Desktop" /v ScreenSaveActive /t REG_SZ /d 0 /f >nul
reg add "HKCU\Control Panel\Desktop" /v ScreenSaveTimeOut /t REG_SZ /d 0 /f >nul
reg add "HKCU\Control Panel\Desktop" /v ScreenSaverIsSecure /t REG_SZ /d 0 /f >nul

REM  PAG-SWIPE MULA SA GILID NG SCREEN
REM  Sa touchscreen, ang hagod mula sa pinakadulong kanan ay
REM  nagbubukas ng notification at calendar ng Windows; sa kaliwa,
REM  ng Widgets. Windows ang may hawak niyon, hindi ang kiosk —
REM  kaya dito ito pinapatay, hindi sa app.
echo Pinapatay ang pag-swipe mula sa gilid ng screen...
reg add "HKLM\SOFTWARE\Policies\Microsoft\Windows\EdgeUI" /v AllowEdgeSwipe /t REG_DWORD /d 0 /f >nul

REM  PAGSASARA NG CHROME SA MGA PANLABAS NA DAAN
REM  Kapag may nagsaksak ng keyboard, ito ang mga daan palabas ng
REM  kiosk o papasok sa loob nito:
REM    - DevTools (F12): nababasa at nababago ang session ng kiosk
REM    - Incognito, Guest, bagong profile: bagong window sa ibabaw
REM    - file:// : nababasa ang mga file ng mini PC
REM    - Password manager at autofill: hindi dapat matandaan sa
REM      pampublikong makina ang password ng admin
REM  Sa LAHAT ng Chrome sa mini PC ito tumatalab, hindi lang sa kiosk.
REM  Para bawiin:  reg delete "HKLM\SOFTWARE\Policies\Google\Chrome" /f
echo Isinasara ang DevTools, Incognito at password manager ng Chrome...
set "CHROME_POLICY=HKLM\SOFTWARE\Policies\Google\Chrome"
reg add "%CHROME_POLICY%" /v DeveloperToolsAvailability /t REG_DWORD /d 2 /f >nul
reg add "%CHROME_POLICY%" /v IncognitoModeAvailability /t REG_DWORD /d 1 /f >nul
reg add "%CHROME_POLICY%" /v BrowserGuestModeEnabled /t REG_DWORD /d 0 /f >nul
reg add "%CHROME_POLICY%" /v BrowserAddPersonEnabled /t REG_DWORD /d 0 /f >nul
reg add "%CHROME_POLICY%" /v PasswordManagerEnabled /t REG_DWORD /d 0 /f >nul
reg add "%CHROME_POLICY%" /v AutofillAddressEnabled /t REG_DWORD /d 0 /f >nul
reg add "%CHROME_POLICY%" /v AutofillCreditCardEnabled /t REG_DWORD /d 0 /f >nul
reg add "%CHROME_POLICY%\URLBlocklist" /v 1 /t REG_SZ /d "file://*" /f >nul

echo.
echo   TAPOS NA.
echo.
echo   I-RESTART ANG MINI PC para gumana ang pagpatay sa
echo   pag-swipe mula sa gilid at ang mga patakaran ng Chrome.
echo.
echo   Isang bagay pang gawin nang kamay, wala kasi itong
echo   maaasahang utos sa lahat ng bersyon ng Windows:
echo.
echo     Settings ^> Accounts ^> Sign-in options
echo       "If you've been away, when should Windows require
echo        you to sign in again?"  -^>  Never
echo.
echo     Settings ^> Bluetooth ^& devices ^> Touch
echo       "Three- and four-finger touch gestures"  -^>  Off
echo.
pause
