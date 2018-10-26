#!/bin/sh

printf "\033[1;31mUpdating and upgrading packages\033[0m\n"
# Check for and install updates
apt-get update -y && apt-get upgrade -y
apt-get install nginx

########################################################################################################################
### Install Node ###
### https://github.com/nodejs/help/wiki/Installation
########################################################################################################################
printf "\033[1;31mInstalling NodeJS-v8.9.4-arm7vl\033[0m\n"

# Download node 8.9.4
wget https://nodejs.org/dist/v8.9.4/node-v8.9.4-linux-armv7l.tar.xz

# Extract and move to /usr/local
tar -xJvf node-v8.9.4-linux-armv7l.tar.xz
cp -R node-v8.9.4-linux-armv7l/* /usr/local
rm -r node-*

# Check versions
npm -v
node -v

########################################################################################################################
### Install dependencies ###
########################################################################################################################
printf "\033[1;31mInstalling dependencies\033[0m\n"

npm install -g nodemon

# Install vue dependencies
npm --prefix ./api install ./api
npm --prefix ./webapp install ./webapp

# Build vue project
npm --prefix ./webapp run build

Make services executable
chmod 755 services/api.service
chmod 755 services/rfid.service

# Add services
cp services/api.service /etc/systemd/system/
cp services/rfid.service /etc/systemd/system/

# Set services to run at boot

systemctl enable api.service
systemctl enable rfid.service

shutdown -r now
