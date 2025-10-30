@echo off
REM Launch Chrome Canary with AI APIs force-enabled
REM Close all Chrome instances before running this

echo Launching Chrome Canary with AI APIs enabled...
echo.

start "" "C:\Users\sghar\AppData\Local\Google\Chrome SxS\Application\chrome.exe" ^
--user-data-dir="C:\Users\sghar\ChromeAITest" ^
--enable-features=Optimization GuideOnDeviceModel:bypass_perf_requirement_check/true,PromptAPIForGeminiNano,TextBasedAudioDescriptions ^
--enable-ai-features ^
--no-first-run ^
--enable-logging ^
--v=1

echo.
echo Chrome launched with AI features enabled
echo If this doesn't work, check chrome_debug.log for errors
pause
