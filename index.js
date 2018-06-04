const http = require('http')
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
    let streamer

    beforeEach((done) => {
      rimraf(options.tmpFile)

      if (streamer) {
        streamer.destroy()
        streamer = null
      }

      streamer = new Streamer(options.uri, {
        progressInterval: 50,
        buffer: 1000,
        port: options.port,
        writeDir: ''
      })

      done()
    })

    it('should fire a `ready` signal', function (done) {
      this.timeout(options.timeout)

      streamer.on('ready', info => {
        debug('got ready', info)
        assert(true)
        done()
      })
    })

    it('should return progress', done => {
      this.timeout(options.timeout)

      let progressed = false
      streamer.on('progress', info => {
        if (!progressed) {
          progressed = true
          assert(true)
          done()
        }
      })

      streamer.pipe(nullStream)
    })

    it('should seek', done => {
      this.timeout(options.timeout)

      let progressed = false
      streamer.on('progress', info => {
        if (!progressed) {
          progressed = true
          streamer.seek(streamer.length*0.99)
        }
      })

      streamer.on('complete', info => {
        debug('got complete, seek worked', info)
        assert(true)
        done()
      })

      streamer.pipe(nullStream)
    })

    it('should create a video file', done => {

      streamer.pipe(fs.createWriteStream(options.tmpFile))
      streamer.on('progress', info => {
        fs.access(options.tmpFile, fs.constants.F_OK, err => {
          assert.equal(err, undefined)
          done()
        })
      })

    })

    it('we can destroy', done => {
      streamer.pipe(nullStream)
      streamer.on('progress', info => {
        streamer.destroy()
        assert(true)
        done()
      })
    })
  })
}

run()

module.exports = run
