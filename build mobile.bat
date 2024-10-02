:: Start the server
start cmd /k "cd /d %~dp0packages/mobile/android && gradlew clean && gradlew assembleRelease"
