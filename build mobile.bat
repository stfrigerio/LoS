:: Start the server
start cmd /k "cd /d %~dp0packages/mobile/android && gradlew assembleRelease && echo. && echo Now copy paste this once your phone is correctly connected to the computer: adb install app\build\outputs\apk\release\app-release.apk"
