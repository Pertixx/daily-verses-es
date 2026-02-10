# Expo OTA Updates Configuration

This directory contains the scripts and documentation for managing Over-The-Air (OTA) updates for the AlguienQuiere mobile app using a custom update server.

## Overview

The app uses `expo-updates` to fetch and apply updates without requiring a new store submission. We use a custom update server hosted at `https://expo-updates.contentor.io`.

## Prerequisites

Ensure you have the `expo-updates` package installed:

```bash
npm install expo-updates
```

## Configuration

### 1. Project Configuration (`app.json`)

Add the following configuration to your `app.json` file. The `runtimeVersion` must match between the native code and the published update.

```json
{
  "expo": {
    "runtimeVersion": "com.startnode.marea",
    "updates": {
      "url": "https://expo-updates.contentor.io/api/manifest",
      "enabled": true,
      "fallbackToCacheTimeout": 30000
    }
  }
}
```

### 2. iOS Configuration (`ios/alguienquiereapp/Supporting/Expo.plist`)

Ensure the following keys are correctly set in your `Expo.plist`:

```xml
<?xml version="1.0" encoding="UTF-8"?>
<!DOCTYPE plist PUBLIC "-//Apple//DTD PLIST 1.0//EN" "http://www.apple.com/DTDs/PropertyList-1.0.dtd">
<plist version="1.0">
  <dict>
    <key>EXUpdatesEnabled</key>
    <true/>
    <key>EXUpdatesURL</key>
    <string>https://expo-updates.contentor.io/api/manifest</string>
    <key>EXUpdatesRuntimeVersion</key>
    <string>com.startnode.marea</string>
    <key>EXUpdatesCheckOnLaunch</key>
    <string>ALWAYS</string>
    <key>EXUpdatesLaunchWaitMs</key>
    <integer>0</integer>
  </dict>
</plist>
```

### 3. Android Configuration (`android/app/src/main/AndroidManifest.xml`)

Add the following meta-data tags inside the `<application>` tag:

```xml
<meta-data android:name="expo.modules.updates.ENABLED" android:value="true"/>
<meta-data android:name="expo.modules.updates.EXPO_RUNTIME_VERSION" android:value="@string/expo_runtime_version"/>
<meta-data android:name="expo.modules.updates.EXPO_UPDATES_CHECK_ON_LAUNCH" android:value="ALWAYS"/>
<meta-data android:name="expo.modules.updates.EXPO_UPDATES_LAUNCH_WAIT_MS" android:value="30000"/>
<meta-data android:name="expo.modules.updates.EXPO_UPDATE_URL" android:value="https://expo-updates.contentor.io/api/manifest"/>
```

Also, ensure the runtime version is defined in `android/app/src/main/res/values/strings.xml`:

```xml
<string name="expo_runtime_version">com.startnode.marea</string>
```

## Programmatic Usage

You can manually check for updates in the application code:

```javascript
import * as Updates from 'expo-updates';

const checkForUpdates = async () => {
  try {
    const update = await Updates.checkForUpdateAsync();
    if (update.isAvailable) {
      await Updates.fetchUpdateAsync();
      // ... notify user or reload ...
      await Updates.reloadAsync();
    }
  } catch (error) {
    console.error(`Error fetching latest Expo update: ${error}`);
  }
}
```

## Publishing Updates

To publish a new OTA update to the production server, use the provided script:

```bash
./expo-update/publish.sh
```

### What the script does:
1.  **Exports the project**: Runs `npx expo export` to generate the static assets in the `/dist` directory.
2.  **Prepares the update bundle**: Copies the exported files to a structured directory matching the `runtimeVersion`.
3.  **Generates Config**: Uses `exportClientExpoConfig.js` to extract the current Expo configuration.
4.  **Deploys to Remote**: Tars the update bundle and uploads it via SSH to the update server at `contentor.io`.

### Publishing Requirements

- **SSH Access**: You must have SSH access to `contentor.io` as the `root` user.
- **Directory Structure**: The script expects a `updates/` directory within `expo-update/`. You may need to create it manually before the first run:
  ```bash
  mkdir -p expo-update/updates/com.startnode.marea/_expo
  ```

## Internal Tools

- `publish.sh`: The main deployment script.
- `exportClientExpoConfig.js`: Helper script that exports the `app.json` configuration in a format required by the update server.