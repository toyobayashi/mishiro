#!/bin/bash

npm install -g node-gyp@10
# npm config set node_gyp "`npm prefix -g`/lib/node_modules/node-gyp/bin/node-gyp.js"
node-gyp install --target=$(node -p require\(\'./app/package.json\'\).devDependencies.electron) --disturl=https://electronjs.org/headers

cd ./app
npm install --legacy-peer-deps --verbose
npm run build
cd ..
