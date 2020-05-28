cd ../bitabase-server
npm i
npm link
cd ../bitabase-gateway
npm i
npm link
cd ../bitabase-manager
npm i
npm link

cd ../bitabase
npm link bitabase-server
npm link bitabase-gateway
npm link bitabase-manager
