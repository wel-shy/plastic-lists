import * as fs from 'fs'
import * as path from 'path'
import { promisify } from 'util'
import * as request from 'request'
import Axios from 'axios'

const writeFile = promisify(fs.writeFile)
const readFile = promisify(fs.readFile)

/**
 * Generate a random string
 * @param  length length of random string
 * @return        [description]
 */
export function generateRandomString(length: number): string {
	let text = ''
	const possible = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789'

	for (let i = 0; i < length; i++) {
		text += possible.charAt(Math.floor(Math.random() * possible.length))
	}

	return text
}

/**
 * Save a token to file
 * @param  token [description]
 * @return       [description]
 */
export async function saveTokenToFile(token: string): Promise<void> {
	const filePath = path.join(__dirname, '/../refresh_token.txt')
	await writeFile(filePath, token)
}

/**
 * Get a token from a file
 * @return [description]
 */
export async function getRefreshToken(): Promise<string> {
	const filePath = path.join(__dirname, '/../refresh_token.txt')

	const token = await readFile(filePath, 'utf8')
	return token
}

/**
 * Get an access token from spotify
 * @param  refreshToken [description]
 * @return              [description]
 */
export async function fetchAuthToken(refreshToken: string): Promise<string> {
	const authOptions = {
		url: 'https://accounts.spotify.com/api/token',
		headers: { 'Authorization': 'Basic ' + (new Buffer(process.env.CLIENT_ID + ':' + process.env.CLIENT_SECRET).toString('base64')) },
		form: {
			grant_type: 'refresh_token',
			refresh_token: refreshToken
		},
		json: true
	};

  return new Promise<string>((resolve, reject) => {
    request.post(authOptions, function(error, response: request.Response, body: any) {
      if (error) {
        console.log('error')
        reject(error)
      }
      else if (!error && response.statusCode === 200) {
        const access_token: string = body.access_token;
        resolve(access_token)
      }
      else {
        console.log(response)
      }
    });
  })
}

/**
 * Get a user's playlists
 * @param  accessToken [description]
 * @return             [description]
 */
export async function getUserPlaylists(accessToken: string): Promise<{}[]> {
  const options = {
    url: 'https://api.spotify.com/v1/me/playlists?limit=50',
    headers: { 'Authorization': 'Bearer ' + accessToken},
    json: true
  }

  return new Promise<{}[]>((resolve, reject) => {
    request.get(options, (error: Error, response: request.RequestResponse, body: any) => {
      if (error) {
        reject(error)
      } else if (response.statusCode === 200) {
        resolve(body.items)
      } else {
        reject(response)
      }
    })
  })
}

/**
 * Store users playlists to file
 * @param  playlists [description]
 * @return           [description]
 */
export async function storePlaylists(playlists: {}[]): Promise<{}> {
  const data: any = {}
  playlists.forEach((playlist: any) => {
    const item = {
      name: playlist.name,
      uri: playlist.uri,
      id: playlist.id
    }

    data[playlist.id] = item
  })

  await writeFile(path.join(__dirname, '../playlists.json'), JSON.stringify(data, null, 2), 'utf8')

  return data
}

export async function linkPlaylistToRFID(playlistId: string, rfid: string): Promise<void> {
  const filePath = path.join(__dirname, '/../links.json')

  let rawLinks: string
  let links: any = {}
  try {
    rawLinks = await readFile(filePath, 'utf8')
    links = JSON.parse(rawLinks)
  } catch(e) {
    rawLinks = ''
  }

  links[rfid] = {id: playlistId}

  await writeFile(filePath, JSON.stringify(links, null, 2), 'utf8')
}

export async function playPlaylist(uri: string, accessToken: string): Promise<void> {
  try {
    await Axios.put('https://api.spotify.com/v1/me/player/play', {context_uri: uri}, {headers: { 'Authorization': 'Bearer ' + accessToken}})
  } catch(e) {
    console.error(e)
  }
}
