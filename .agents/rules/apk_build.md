# 📱 APK Build Workflow Rule

Whenever you (the AI agent) successfully complete a command to build an Android APK (such as `./gradlew assembleRelease` or `./gradlew assembleDebug`), you must **ALWAYS** automatically copy the resulting `.apk` file from its deep output directory into the `releases/` directory in the project workspace (`/Users/ashhdubey/Desktop/GritMath/releases/`).

### Example Action
If `./gradlew assembleRelease` finishes successfully, immediately run:
```bash
mkdir -p releases
cp android/app/build/outputs/apk/release/app-release.apk ./releases/GritMath-v<VERSION>.apk
```
*Do not wait for the user to ask for it.*
