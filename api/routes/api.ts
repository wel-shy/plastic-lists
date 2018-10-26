import { Router, Request, Response } from 'express'
import { promisify } from 'util'
import * as fs from 'fs'
import * as path from 'path'
import * as ws from 'ws'

const readFile = promisify(fs.readFile)
const writeFile = promisify(fs.writeFile)

const playlistFilePath = path.join(__dirname, '../../playlists.json')
const linksFilePath = path.join(__dirname, '../../links.json')

function api(wss: ws.Server): Router {
  const router = Router()

  /**
   * Return stored playlists from file.
   * @param  '/playlists' [description]
   * @param  async(req    [description]
   * @return              [description]
   */
  router.get('/playlists', async (req: Request, res: Response) => {
    let playlists: any = {}

    try {
      const playlistsString = await readFile(playlistFilePath, 'utf8')
      playlists = JSON.parse(playlistsString)
    } catch (e) {
      console.error(e)
    }

    if (playlists) {
      let list: any = []
      Object.keys(playlists).forEach((key: string) => {
        list.push(playlists[key])
      })

      return res.json({
        messages: '',
        errors: false,
        payload: {
          playlists: list
        }
      })
    } else {
      return res.json({
        messages: '',
        errors: false,
        payload: {
          playlists: []
        }
      })
    }
  })

  // Return stored links from file
  router.get('/links', async (req: Request, res: Response) => {
    let links: any = {}

    try {
      const linksString = await readFile(linksFilePath, 'utf8')
      links = JSON.parse(linksString)
    } catch (e) {
      console.error(e)
    }

    if (links) {
      let list: any = []
      Object.keys(links).forEach((key: string) => {
        list.push({
          rfid: key,
          playlistId: links[key].id
        })
      })

      return res.json({
        messages: '',
        errors: false,
        payload: {
          links: list
        }
      })
    } else {
      return res.json({
        messages: '',
        errors: false,
        payload: {
          playlists: []
        }
      })
    }
  })

  // Broadcast an unlinked rfid tag
  router.put('/rfid', async (req: Request, res: Response) => {
    const rfid = req.body.rfid

    wss.clients.forEach((client) => {
      client.send(rfid)
    })

    return res.json({
      messages: '',
      errors: false,
      payload: {
        playlists: []
      }
    })
  })

  router.post('/links/store', async(req: Request, res: Response) => {
    const rfid: string = req.body.rfid
    const playlistId: string = req.body.playlist

    if(!rfid || !playlistId) {
      return res.json({
        message: 'missing rfid',
        errors: true,
        status: 400,
        payload: {}
      })
    }

    let links: any = {}

    try {
      const linksString = await readFile(linksFilePath, 'utf8')
      links = JSON.parse(linksString)
    } catch (e) {
      console.error(e)
    }

    links[rfid] = {
      id: playlistId
    }

    try {
      await writeFile(linksFilePath, JSON.stringify(links, null, 2), 'utf8')
    } catch(e) {
      console.error(e)
    }

    return res.json({})

  })

  router.delete('/links/destroy/:rfid', async(req: Request, res: Response) => {
    const rfid: string = req.params.rfid

    if(!rfid) {
      return res.json({
        message: 'missing rfid',
        errors: true,
        status: 400,
        payload: {}
      })
    }

    let links: any = {}

    try {
      const linksString = await readFile(linksFilePath, 'utf8')
      links = JSON.parse(linksString)
    } catch (e) {
      console.error(e)
    }

    // delete from map
    delete links[rfid]

    try {
      await writeFile(linksFilePath, JSON.stringify(links, null, 2), 'utf8')
    } catch(e) {
      console.error(e)
    }

    return res.json({})
  })

  return router
}

export default api
