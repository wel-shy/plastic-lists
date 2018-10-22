import * as fs from 'fs'
import * as path from 'path'
import { promisify } from 'util'

const writeFile = promisify(fs.writeFile)
const readFile = promisify(fs.readFile)

async function main(): Promise<void> {
  let filePath = path.join(__dirname, '../links.json')
  let raw: string
  let links: any = {}

  try {
    raw = await readFile(filePath, 'utf8')
    links = JSON.parse(raw)
  } catch (e) {
    console.error(e)
  }

  links[process.argv[2]] = {id: process.argv[3]}

  await writeFile(filePath, JSON.stringify(links, null, 2), 'utf8')

  console.log('saved!')
}

main()
