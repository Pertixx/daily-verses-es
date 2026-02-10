directory="com.startnode.marea"

# Build the app
cd "$(dirname "$0")/../"
npx expo export

cd ./expo-update

rm -rf ./updates/$directory
mkdir ./updates
mkdir ./updates/$directory

# Copy the build to the updates directory
cp -r ../dist/ ./updates/$directory/_expo

node ./exportClientExpoConfig.js > ./updates/$directory/_expo/expoConfig.json

# upload and untar in one request
echo "Uploading and extracting to remote..."
tar -C updates -czf - "$directory" | ssh root@contentor.io "cd /var/www/html/expo-updates/updates && rm -rf \"$directory\" && tar -xzf -"

echo "✅  Published to remote "