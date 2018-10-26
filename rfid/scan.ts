import * as readline from 'readline'
import {
  getRefreshToken,
  fetchAuthToken,
  getUserPlaylists,
  storePlaylists,
  playPlaylist
} from './utils'
import { promisify } from 'util'
import * as fs from 'fs'
import * as dotenv from 'dotenv'
import * as path from 'path'
import Axios from 'axios'
dotenv.load()

const readFile = promisify(fs.readFile)

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

  // Listen for rfids on the stdin
  const rl: any = readline.createInterface({
    input: process.stdin,
    output: process.stdout,
    terminal: false
  })

  // on a new line...
  rl.on('line', async function(line: any){
    // Play the playlist if the rifd is known
      if (links[line]) {
        const playlist = userPlaylists[links[line].id]
        console.log(`Playing: ${playlist.name}`)
        try {
          await playPlaylist(playlist.uri, access_token)
        } catch (e) {
          console.error(e)
        }
      } else { // send to server as the last unkown rfid.
        await Axios.put(`http://localhost:8888/api/rfid`, {rfid: line})
      }
  })
}

main()
