#!/bin/bash

echo "FURINLA BACKEND INSTALLER"

sudo apt-get update
sudo apt-get install -y curl git build-essential

if ! command -v node &> /dev/null
then
    curl -fsSL https://deb.nodesource.com/setup_20.x | sudo -E bash -
    sudo apt-get install -y nodejs
fi

if ! command -v pm2 &> /dev/null
then
    sudo npm install -g pm2
fi

mkdir -p /root/furinla

npm install
npm run build

echo "Setup Complete. Configure .env and run: pm2 start ecosystem.config.cjs"
