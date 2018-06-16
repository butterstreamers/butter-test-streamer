const assert = require('assert')
const path = require('path')
const fs = require('fs')
const rimraf = require('rimraf').sync
const NullWritable = require('null-writable')

const ButterStreamer = require('butter-streamer')
const Streamer = require(process.cwd())
const debug = require('debug')('butter-test-streamer')

const pkg = require(path.join(process.cwd(), 'package.json'))
const defaultOptions = {
  args: {},
  timeout: 100000,
  uri: 'http://www.frostclick.com/torrents/video/animation/Big_Buck_Bunny_1080p_surround_frostclick.com_frostwire.com.torrent',
  port: 2011,
  tmpFile: 'testFile.mp4'
}

const options = Object.assign(
  {}, defaultOptions, pkg.butter ? ButterStreamer.parseArgs(pkg.butter.testArgs) : {}
)

debug('test', options)

const run = () => {
  return describe(`Butter Streamer: ${options.name}`, function () {
    this.timeout(options.timeout)
    const nullStream = new NullWritable()
    let streamer = null
    let stream = null

    beforeEach((done) => {
      streamer = new Streamer(options.uri, {
        progressInterval: 50,
        buffer: 1000,
        port: options.port,
        writeDir: ''
      })

      done()
    })

    afterEach((done) => {
      rimraf(options.tmpFile)

      if (stream) {
        stream.destroy()
        stream = null
      }

      if (streamer) {
        streamer.destroy()
        streamer = null
      }

      done()
    })

    it('should fire a `ready` signal', function (done) {
      this.timeout(options.timeout)

      streamer.on('ready', info => {
        debug('got ready', info.source)
        assert(true)
        done()
      })
    })

    it('should return progress', done => {
      this.timeout(options.timeout)

      streamer.on('ready', info => {
        const file = info.files[0]
        debug('creating readStream on file 0', file.name)
        stream = file.createReadStream()
        stream.pipe(nullStream)
      })

      let progressed = false
      streamer.on('progress', info => {
        if (!progressed) {
          progressed = true
          assert(true)
          done()
        }
      })
    })

    it('should seek', done => {
      this.timeout(options.timeout)

      let progressed = false
      streamer.on('ready', info => {
        let file = info.files[0]
        debug('creating readStream on file 0', file.name)
        stream = file.createReadStream()
        stream.pipe(nullStream)

        streamer.on('progress', info => {
          if (progressed) return

          progressed = true
          const offset = file.length - 2048
          stream.destroy()
          debug('creating readStream on file 0', file.name, 'at offset', offset)
          stream = file.createReadStream({start: offset})
          stream.pipe(nullStream)
        })
      })

      streamer.on('complete', info => {
        debug('got complete, seek worked', info)
        assert(true)
        done()
      })
    })

    it('should create a video file', done => {
      streamer.on('ready', info => {
        debug('got ready, creating stream', options.tmpFile)
        stream = info.files[0].createReadStream()
        stream.pipe(fs.createWriteStream(options.tmpFile))
      })

      streamer.on('progress', info => {
        debug('got progress, checking file')
        fs.access(options.tmpFile, fs.constants.F_OK, err => {
          if (err) return
          done()
        })
      })
    })

    it('we can destroy', done => {
      streamer.on('ready', info => {
        stream = info.files[0].createReadStream()
        stream.pipe(nullStream)
      })

      streamer.on('progress', info => {
        streamer.destroy()
        streamer = null
        assert(true)
        done()
      })
    })
  })
}

run()

module.exports = run
