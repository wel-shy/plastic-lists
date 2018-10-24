import Axios from 'axios'

/**
 * Get users playlists from api
 * @return {[type]} [description]
 */
export async function getPlaylists () {
  const response = await Axios.get('http://localhost:8888/api/playlists')
  let playlists = response.data.payload.playlists
  return playlists
}

/**
 * Get playlist and rfid links
 * @return {[type]} [description]
 */
export async function getLinks () {
  const response = await Axios.get('http://localhost:8888/api/links')
  console.log(response)
  let links = response.data.payload.links
  return links
}
