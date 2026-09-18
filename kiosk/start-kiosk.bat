@echo off
REM ============================================================
REM  TAGAYTAY CITY HALL KIOSK — Windows launcher
REM
REM  Binubuksan ang kiosk sa buong screen: walang address bar,
REM  walang tab, walang paraan para makalabas ang bisita.
REM
REM  PAGLALAGAY:
REM    1. Kopyahin ang buong "kiosk" folder sa mini PC,
REM       halimbawa sa C:\kiosk
REM    2. Doble-klik ito para subukan.
REM    3. Kapag tama na, sundan ang "AUTO-START" sa ibaba.
REM
REM  PAGHINTO (para sa maintenance):
REM    Gumawa ng file na "stop-kiosk.txt" sa loob ng folder na
REM    ito, tapos isara ang Chrome (Alt+F4). Hindi na ito
REM    magbubukas ulit. Burahin ang file para bumalik sa dati.
REM ============================================================

setlocal

REM --- Ang link na bubuksan ---------------------------------
REM  Kung papalitan ito at may "&" sa bagong link, palitan ang
REM  bawat "&" ng "^&" — kung hindi, doon puputulin ng Windows
REM  ang linya at mali ang mabubuksan.
set "KIOSK_URL=https://tagaytay-kiosk-map-one.vercel.app/?key=cct-bsit-kiosk"

REM --- Hiwalay na profile ------------------------------------
REM  Para hindi magulo ang normal na Chrome ng gumagamit ng
REM  mini PC, at para malinis ang simula tuwing bubukas.
set "KIOSK_PROFILE=%LOCALAPPDATA%\TagaytayKiosk\ChromeProfile"

REM --- Hanapin ang Chrome ------------------------------------
REM  Ang registry ang pinaka-maaasahan: doon nakasulat ng installer
REM  mismo kung saan ito inilagay, kahit saang drive pa iyon.
set "CHROME="
for /f "tokens=2,*" %%a in ('reg query "HKLM\SOFTWARE\Microsoft\Windows\CurrentVersion\App Paths\chrome.exe" /ve 2^>nul') do set "CHROME=%%~b"
if not defined CHROME for /f "tokens=2,*" %%a in ('reg query "HKCU\SOFTWARE\Microsoft\Windows\CurrentVersion\App Paths\chrome.exe" /ve 2^>nul') do set "CHROME=%%~b"

REM  Mga karaniwang lugar, sakaling walang nakasulat sa registry.
if not defined CHROME if exist "%ProgramFiles%\Google\Chrome\Application\chrome.exe" set "CHROME=%ProgramFiles%\Google\Chrome\Application\chrome.exe"
if not defined CHROME if exist "%LOCALAPPDATA%\Google\Chrome\Application\chrome.exe" set "CHROME=%LOCALAPPDATA%\Google\Chrome\Application\chrome.exe"
if not defined CHROME if exist "C:\Program Files (x86)\Google\Chrome\Application\chrome.exe" set "CHROME=C:\Program Files (x86)\Google\Chrome\Application\chrome.exe"

if not defined CHROME (
  echo.
  echo   HINDI MAHANAP ANG GOOGLE CHROME.
  echo   I-install ito mula sa https://google.com/chrome
  echo.
  pause
  exit /b 1
)

REM --- Hintayin ang internet ---------------------------------
REM  Sa startup, madalas hindi pa handa ang network kapag
REM  tumatakbo na ang shortcut. Sandaling paghihintay lang ito
REM  para hindi lumabas ang "No internet" na pahina ng Chrome.
echo Hinihintay ang koneksyon...
set /a NETTRIES=0
:waitnet
ping -n 1 -w 1000 1.1.1.1 >nul 2>&1 && goto :online
set /a NETTRIES+=1
if %NETTRIES% lss 30 (
  timeout /t 2 /nobreak >nul
  goto :waitnet
)
echo   Walang koneksyon pagkatapos ng isang minuto. Itutuloy pa rin.
:online

:loop
if exist "%~dp0stop-kiosk.txt" goto :end

REM  Binubura ang naiwang session bago bumukas. Pagkatapos ng
REM  biglaang pagkawala ng kuryente, may naiiwang senyas ang
REM  Chrome na "hindi maayos ang pagkasara" — dito iyon nalilinis.
if exist "%KIOSK_PROFILE%\Default\Sessions" rmdir /s /q "%KIOSK_PROFILE%\Default\Sessions" >nul 2>&1

start "" /wait "%CHROME%" ^
 --kiosk "%KIOSK_URL%" ^
 --user-data-dir="%KIOSK_PROFILE%" ^
 --autoplay-policy=no-user-gesture-required ^
 --disable-session-crashed-bubble ^
 --disable-infobars ^
 --noerrdialogs ^
 --no-first-run ^
 --no-default-browser-check ^
 --disable-translate ^
 --disable-features=TranslateUI,Translate ^
 --disable-pinch ^
 --overscroll-history-navigation=0 ^
 --check-for-update-interval=31536000 ^
 --password-store=basic

REM  Kapag isinara ang Chrome (o nag-crash), binubuksan ulit —
REM  hindi dapat maiwang blangko ang screen sa lobby.
timeout /t 3 /nobreak >nul
goto :loop

:end
echo.
echo   Huminto ang kiosk dahil may stop-kiosk.txt sa folder na ito.
echo   Burahin ang file na iyon para bumalik sa dati.
echo.
pause
endlocal
