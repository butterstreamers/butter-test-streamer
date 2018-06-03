const http = require('http')
const assert = require('assert')
const path = require('path')
const fs = require('fs')
const rimraf = require('rimraf').sync
const ButterStreamer = require('butter-streamer')
const Streamer = require(process.cwd())
const debug = require('debug')('butter-test-streamer')

const pkg = require(path.join(process.cwd(), 'package.json'))
const defaultConfig = {
  args: {},
  timeout: 5000,
  uri: 'http://www.frostclick.com/torrents/video/animation/Big_Buck_Bunny_1080p_surround_frostclick.com_frostwire.com.torrent',
  port: 2011,
  tmpFile: 'testFile.mp4'
}

const config = Object.assign(
  {}, defaultConfig, Streamer.config,
  pkg.butter ? ButterStreamer.parseArgs(pkg.butter.testArgs) : {}
)

debug('test', config)

const run = () => {
  return describe(`Butter Streamer: ${config.name}`, function () {
    this.timeout(config.timeout)
    let streamer

    beforeEach((done) => {
      rimraf(config.tmpFile)

      streamer = new Streamer(config.uri, {
        progressInterval: 50,
        buffer: 1000,
        port: config.port,
        writeDir: ''
      })

      done()
    })

    it('should fire a `ready` signal', function (done) {
      this.timeout(config.timeout)

      streamer.on('ready', info => {
        debug('got ready', info)
        assert(true)
        done()
      })
    })

    it('should return progress', done => {
      this.timeout(config.timeout)

      let progressed = false
      streamer.on('progress', info => {
        if (!progressed) {
          progressed = true
          assert(true)
          done()
        }
      })

      streamer.pipe(fs.createWriteStream(config.tmpFile))
    })

    it('should seek', done => {
      this.timeout(config.timeout)

      let progressed = false
      streamer.on('progress', info => {
        if (!progressed) {
          progressed = true
          streamer.seek(info.downloaded*99/info.progress)
        }
      })

      streamer.on('complete', info => {
        debug('got complete, seek worked', info)
        assert(true)
        done()
      })

      streamer.pipe(fs.createWriteStream(config.tmpFile))
    })

    it('should create a video file', done => {

      streamer.pipe(fs.createWriteStream(config.tmpFile))
      streamer.on('progress', info => {
        fs.access(config.tmpFile, fs.constants.F_OK, err => {
          assert.equal(err, undefined)
          done()
        })
      })

    })

    it('we can close the process', done => {
      streamer.close()
      assert(true)
      done()
    })

    it('we can destroy', done => {
      streamer.destroy()
      assert(true)
      done()
    })
  })
}

run()

module.exports = run
