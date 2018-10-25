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
  let links = response.data.payload.links
  return links
}

export async function removeLink (rfid) {
  await Axios.delete(`http://localhost:8888/api/links/destroy/${rfid}`)
}

export async function createLink (rfid, playlist) {
  const response = await Axios.post('http://localhost:8888/api/links/store', {rfid: rfid, playlist: playlist})
  return response
}
