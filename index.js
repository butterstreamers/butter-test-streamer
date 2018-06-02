const http = require('http')
const assert = require('assert')
const fs = require('fs')
const rimraf = require('rimraf')
const Streamer = require(process.cwd())

const pkg = require(path.join(process.cwd(), 'package.json'))
const defaultConfig = {
  args: {},
  timeout: 1000,
  url = 'http://www.frostclick.com/torrents/video/animation/Big_Buck_Bunny_1080p_surround_frostclick.com_frostwire.com.torrent',
  port = 2011,
  tmpFile = 'testFile.mp4'
}

const parseArgs = (uri) {
  const [name, args] = uri.split('?')
  const parsed = { name }

  if (args) {
    args.split('&').map(v => {
      const [ key, value ] = v.split('=')

      parsed[key] =  return JSON.parse(arg)
    })
  }

  return parsed
}

const config = Object.assign({}, defaultConfig, pkg.butter ? parseArgs(pkg.butter.testArgs) : {})

module.exports = () => {
  return describe(`Butter Streamer: ${config.name}`, function () {
    let streamer

    beforeEach(() => {
      rimraf(config.tmpFile)

      streamer = new Streamer(config.url, {
        progressInterval: 50,
        buffer: 1000,
        port: config.port,
        writeDir: ''
      })
    })

    it('should fire a `ready` signal', function (done) {
      this.timeout(config.timeout)


      streamer.on('ready', info => {
        debug(info)
        done()
      })
    })

    it('should return progress', done => {
      this.timeout(config.timeout)

      let progressed = false
      stream.on('progress', info => {
        if (!progressed) {
          progressed = true
          assert(true)
          done()
        }
      })

      streamer.pipe(fs.createWriteStream(config.tmpFile))
    })

    it('should create a video file', done => {

      streamer.pipe(fs.createWriteStream(config.tmpFile))
      stream.on('progress', info => {
        fs.access(config.tmpFile, fs.constants.F_OK, err => {
          assert.equal(err, undefined)
          done()
        })
      })

    })

    it('we can close the process', done => {
      stream.close()
      done()
    })
  })
}
