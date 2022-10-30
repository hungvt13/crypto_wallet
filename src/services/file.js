import fs from 'fs'
import readline from 'readline'
import Stream from 'stream'

function createReadStreamSafe (filename, options) {
  return new Promise((resolve, reject) => {
    const fileStream = fs.createReadStream(filename, options)
    fileStream
      .on('error', reject)
      .on('open', () => {
        resolve(fileStream)
      })
  })
}

export const readFileStream = async (options) => {
  const {
    filename,
    func,
    start = 0
  } = options

  const instream = await createReadStreamSafe(filename)
  const outstream = new Stream()
  const rl = readline.createInterface(instream, outstream)

  let lineCount = 0

  for await (const line of rl) {
    if (lineCount < start) {
      lineCount++
      continue
    }

    const end = func(line, lineCount)
    if (end === true) {
      rl.close()
      break
    }

    lineCount++
  }

  return options
}

export const readFile = (filename, cb) => {
  fs.readFile(filename, 'utf8', cb)
}

export const writeFileStream = (path, data, options = {}) => {
  const stream = fs.createWriteStream(path, { ...options })

  stream.write(data + '\n')
}

export const existFile = async (filename) => {
  try {
    await fs.promises.access(filename)
    return true
  } catch {
    return false
  }
}

export const getFileSizeInGB = (filename) => {
  return fs.statSync(filename).size / (1024 * 1024 * 1024)
}
