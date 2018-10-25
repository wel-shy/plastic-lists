import * as fs from 'fs'

let id: string = ''
let lastId: string = ''
const scannerPath = '/dev/hidraw1'

/**
 * Convert hex to ascii
 * @param  hex number
 * @return ascii string
 */
function hexToAscii(hex: number): string {
	return String.fromCharCode(parseInt(hex.toString(), 16)).replace('@', '0')
}

/**
 * Create a read stream
 * @param  scannerPath path to RFID scannerPath
 * @return
 */
fs.createReadStream(scannerPath)
	.on('data', (chunk: string) => {
    // Create a buffer, convert to hex and take a substring of the hex code
		let input: string = new Buffer(chunk, 'hex')
		.toString('hex')
		.substring(4, 6)

    // Skip if blank line
		if (input === '00') return

    // Convert hex to ascii character
		let ascii = hexToAscii((parseInt(input, 16)) + 1)

    /*
     * If a new line, then the rfid tag has been constructed.
     * Split on the A character, store tag, and wipe builder
     */
		if (ascii === 'A') {
			lastId = id.replace('A', '')
			id = ''
			console.log(lastId)
		}

    // Build id by adding onto previous character
		id = `${id}${ascii}`
	})
	.on('error', (err) => {
		console.error(err)
	})
