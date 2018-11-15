import {
  getRefreshToken,
  fetchAuthToken,
  getUserPlaylists,
  storePlaylists,
  playPlaylist,
  pausePlaylist,
  setPlaybackDevice
} from '../utils'
import { promisify } from 'util'
import * as fs from 'fs'
import * as dotenv from 'dotenv'
import * as path from 'path'
import Axios from 'axios'
dotenv.load()

let id: string = ''
let lastId: string = ''
const scannerPath = '/dev/hidraw1'
const readFile = promisify(fs.readFile)

let lastRfid: string = ''
let lastScanTimeStamp: number = 0

/**
 * Convert hex to ascii
 * @param  hex number
 * @return ascii string
 */
function hexToAscii(hex: number): string {
  return String.fromCharCode(parseInt(hex.toString(), 16)).replace('@', '0')
}

async function main(): Promise<void> {
  let refreshToken: string
  let access_token: string
  let rawLinks: string
  let links: any = {}

  // Get any previously saved links between rfids and playlists from file.
  try {
    rawLinks = await readFile(path.join(__dirname, '../links.json'), 'utf8')
    links = JSON.parse(rawLinks)
  } catch (e) {
    console.error(e)
  }

  // Get a refresh token from a file if it exists
  try {
    refreshToken = await getRefreshToken()
  } catch (e) {
    console.error(e)
  }

  // If no token throw an error and tell user to authenticate themselves from a web app.
  if (!refreshToken) {
    console.log('User must be authenticated via webapp to continue')
    process.exit(1)
  } else {
    try {
      // Get an access token if refresh token exists
      access_token = await fetchAuthToken(refreshToken)
    } catch(e) {
      console.log(e)
    }
  }

  // Get all of the users playlists from spotify, store them in a file
  let playlists: {}[] = await getUserPlaylists(access_token)
  let userPlaylists: any = await storePlaylists(playlists)

  /**
   * Create a read stream
   * @param  scannerPath path to RFID scannerPath
   * @return
   */
  fs.createReadStream(scannerPath)
  	.on('data', async (chunk: string) => {
      // Create a buffer, convert to hex and take a substring of the hex code
  		let input: string = new Buffer(chunk, 'hex')
  		.toString('hex')
  		.substring(4, 6)

      // Skip if blank line
  		if (input === '00') return

      // Convert hex to ascii character
  		let ascii: string = hexToAscii((parseInt(input, 16)) + 1)

      /*
       * If a new line, then the rfid tag has been constructed.
       * Split on the A character, store tag, and wipe builder
       */
  		if (ascii === 'A') {
  			lastId = id.replace('A', '')
        id = ''

        const currentTime: number = new Date().getTime()

        // If the last scan was longer than two seconds ago, and there is a new id.
        if (currentTime - lastScanTimeStamp > (1000 * 2 /* 1 second x 60 */) && lastId !== lastRfid) {
          // Assign to global last
          lastRfid = lastId

          if (links[lastId]) {
            const playlist = userPlaylists[links[lastId].id]
            console.log(`Playing: ${playlist.name}`)
            try {
              // Try and set the playback device to the vinyl player
              const playbackDeviceSet: boolean = await setPlaybackDevice(access_token)
              if (playbackDeviceSet) {
                await playPlaylist(playlist.uri, access_token)
              }
            } catch (e) {
              console.error(e)
            }
          } else { // send to server as the last unkown rfid.
            await Axios.put(`http://localhost:8888/api/rfid`, {rfid: lastId})
          }
        } // longer than one minute since last scan
        else if (currentTime - lastScanTimeStamp > (1000 * 60)) {
          // stop playing playlist
          try {
            await pausePlaylist(access_token)
          } catch(e) {
            console.error(e)
          }
        }
  		}

      // Build id by adding onto previous character
  		id = `${id}${ascii}`
  	})
  	.on('error', (err) => {
  		console.error(err)
  	})
}

main()
