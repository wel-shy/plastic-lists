# Plastic Lists
> A record player extension

## Setup
Designed to run on a Raspberry Pi, with RFID reader connected to a usb port.
Run:
```bash
git clone https://openlab.ncl.ac.uk/gitlab/b3030144/self-management.git
cd self-management
```

Create a `.env` file in the root of the directory and add the following:
```bash
CLIENT_ID=<SPOTIFY_CLIENT_ID>
CLIENT_SECRET=<SPOTIFY_SECRET>
REDIRECT_URL=http://localhost:8888/callback
PORT=8888
DEBUG=false
DEVICE_ID=<PLAYBACK DEVICE ID>
```

Then run:
```bash
chmod +x setup.sh
./setup.sh
```

This will reboot the Pi, with the api and rfid reader scanning at boot.

## Use
### Link to Spotify
Connect to the same wifi network as the device. Then go to:
```
http://vinyl
```
Use the interface to login into Spotify and give the device permission to use your account.

### Link Playlists to Vinyls
Stick an RFID tag to the back of a vinyl, and place it on the record player. The web interface will display the id of an unknown tag. Click link and then select a playlist to link it to.

### Setting up as Spotify Connect Device
Download and install Raspotify, run from Pi:
```bash
curl -sL https://dtcooper.github.io/raspotify/install.sh | sh
```
Update config files with your username and password.
