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

echo.
echo   TAPOS NA.
echo.
echo   Isang bagay pang gawin nang kamay, wala kasi itong
echo   maaasahang utos sa lahat ng bersyon ng Windows:
echo.
echo     Settings ^> Accounts ^> Sign-in options
echo       "If you've been away, when should Windows require
echo        you to sign in again?"  -^>  Never
echo.
pause
