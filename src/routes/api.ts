import { Router, Request, Response } from 'express'
import { promisify } from 'util'
import * as fs from 'fs'
import * as path from 'path'
import * as ws from 'ws'

const readFile = promisify(fs.readFile)

function api(wss: ws.Server): Router {
  const router = Router()

  router.get('/playlists', async (req: Request, res: Response) => {
    let playlists: any = {}
    const filePath = path.join(__dirname, '../../playlists.json')

    try {
      const playlistsString = await readFile(filePath, 'utf8')
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

  router.get('/links', async (req: Request, res: Response) => {
    let links: any = {}
    const filePath = path.join(__dirname, '../../links.json')

    try {
      const linksString = await readFile(filePath, 'utf8')
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

  return router
}

export default api
