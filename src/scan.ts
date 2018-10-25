import * as readline from 'readline'
import {
  getRefreshToken,
  fetchAuthToken,
  getUserPlaylists,
  storePlaylists,
  linkPlaylistToRFID,
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

  try {
    rawLinks = await readFile(path.join(__dirname, '../links.json'), 'utf8')
    links = JSON.parse(rawLinks)
  } catch (e) {
    console.error(e)
  }

  try {
    refreshToken = await getRefreshToken()
  } catch (e) {
    console.error(e)
  }

  if (!refreshToken) {
    console.log('User must be authenticated via webapp to continue')
    process.exit(1)
  } else {
    try {
      access_token = await fetchAuthToken(refreshToken)
    } catch(e) {
      console.log(e)
    }
  }

  let playlists: {}[] = await getUserPlaylists(access_token)
  let userPlaylists: any = await storePlaylists(playlists)

  try {
    await linkPlaylistToRFID('hello', 'world')
  } catch(e) {
    console.error(e)
  }

  const rl: any = readline.createInterface({
    input: process.stdin,
    output: process.stdout,
    terminal: false
  });

  rl.on('line', async function(line: any){
      if (links[line]) {
        const playlist = userPlaylists[links[line].id]
        console.log(`Playing: ${playlist.name}`)
        try {
          await playPlaylist(playlist.uri, access_token)
        } catch (e) {
          console.error(e)
        }
      } else {
        await Axios.put(`http://localhost:8888/api/rfid`, {rfid: line})
      }
  })
}

main()
