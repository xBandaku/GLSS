@ECHO off
setlocal

:: GLSS mod build - compiles locations\*.qsrc into glss.qsp.
:: Uses the qsp-cli from the reference Girl Life checkout.
set QSPCLI=..\reference\nightly\tools\qsp-cli.exe

if not exist "%QSPCLI%" (
	echo ERROR: "%QSPCLI%" not found. Adjust QSPCLI in this script.
	exit /b 1
)

"%QSPCLI%" --compile locations glss.qsp glss.qproj --no-builddate
if errorlevel 1 (
	echo Build FAILED.
	exit /b 1
)

echo.
echo Built glss.qsp
echo Copy it into your game's "mod" folder and enable it in Settings ^> Mods (mod name: glss).
endlocal
