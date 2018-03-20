let liveResult = {
  perfect: 0,
  great: 0,
  nice: 0,
  bad: 0,
  miss: 0
}

let se = {
  clap: new Audio('./asset/sound/se.asar/se_live_clap.mp3'),
  fullcombo: new Audio('./asset/sound/se.asar/se_live_fullcombo.mp3'),
  longLoop: new Audio('./asset/sound/se.asar/se_live_long_loop.mp3'),
  tapGreat: new Audio('./asset/sound/se.asar/se_live_tap_great.mp3'),
  tapNice: new Audio('./asset/sound/se.asar/se_live_tap_nice.mp3'),
  tapPerfect: new Audio('./asset/sound/se.asar/se_live_tap_perfect.mp3')
}

function playSe (se) {
  se.currentTime = 0
  se.play()
}

function newImage (src) {
  var img = new Image()
  img.src = src
  return img
}

class Note {
  constructor (path, distance) {
    this.path = path
    this.exist = true
    this.x = Note.X[this.path - 1]
    this.y = Note.TOP_TO_BOTTOM - distance
    Note.queue[this.path - 1].push(this)
  }
}
Note.IMG = newImage('./img/img.asar/icon_notes.png')
// Note.CTX = document.getElementById('live').getContext('2d')
Note.SPEED = 10 // x 60 px / s
Note.PX_SPEED = Note.SPEED * 60 / 1000
Note.TOP_TO_BOTTOM = 592
Note.X = [238.5, 414.5, 589.5, 764.5, 937.5]
Note.queue = [[], [], [], [], []]
Note.W = 102
Note.H = 102
Note.DISTANCE = Note.TOP_TO_BOTTOM + Note.H
Note.RANGE = 100

class ShortNote extends Note {
  constructor (path, distance = Note.DISTANCE, doDrop = true) {
    super(path, distance)
    this.draw()
    if (doDrop) this.startDrop()
  }

  clean () {
    Note.CTX.clearRect(this.x, this.y, Note.W, Note.H)
  }

  draw () {
    Note.CTX.drawImage(
      Note.IMG,
      ShortNote.IMG_POSITION_X,
      ShortNote.IMG_POSITION_Y,
      Note.W,
      Note.H,
      this.x,
      this.y,
      Note.W,
      Note.H
    )
  }

  update (distance) {
    this.clean()
    this.y = Note.TOP_TO_BOTTOM - distance
    this.draw()
  }

  startDrop () {
    this.t = requestAnimationFrame(frame.bind(this))
    function frame () {
      if (this.y >= Note.TOP_TO_BOTTOM + Note.RANGE * Note.PX_SPEED) {
        this.exist = false
        cancelAnimationFrame(this.t)
        this.clean()
        Note.queue[this.path - 1].shift()
        miss()
      } else if (this.exist) {
        var d = Note.TOP_TO_BOTTOM - this.y
        this.update(d - Note.SPEED)
        requestAnimationFrame(frame.bind(this))
      }
    }
  }
}
ShortNote.IMG_POSITION_X = 0
ShortNote.IMG_POSITION_Y = 0

class LongNote extends Note {
  constructor (path, length, distance = Note.DISTANCE, doDrop = true) {
    super(path, distance)
    this.status = 0
    this.length = length
    this.draw()
    if (doDrop) this.startDrop()
  }

  clean () {
    Note.CTX.clearRect(this.x, this.y - this.length, Note.W + 1, this.length > 0 ? this.length + Note.H : Note.H)
  }

  draw () {
    Note.CTX.beginPath()
    Note.CTX.arc(this.x + Note.W / 2, this.y + Note.W / 2, Note.W / 2, Math.PI, 2 * Math.PI, true)
    Note.CTX.lineTo(this.x + 102, this.y + Note.W / 2 - this.length)
    Note.CTX.arc(this.x + Note.W / 2, this.y + Note.W / 2 - this.length, Note.W / 2, 0, Math.PI, true)
    Note.CTX.lineTo(this.x, this.y + Note.W / 2)
    Note.CTX.fillStyle = 'rgba(255, 255, 255, 0.66)'
    Note.CTX.fill()
    Note.CTX.drawImage(
      Note.IMG,
      LongNote.IMG_POSITION_X,
      LongNote.IMG_POSITION_Y,
      Note.W,
      Note.H,
      this.x,
      this.y - this.length,
      Note.W,
      Note.H
    )
    if (this.status === 0) {
      Note.CTX.drawImage(
        Note.IMG,
        LongNote.IMG_POSITION_X,
        LongNote.IMG_POSITION_Y,
        Note.W,
        Note.H,
        this.x,
        this.y,
        Note.W,
        Note.H
      )
    }
  }

  update (distance, length) {
    this.clean()
    this.y = Note.TOP_TO_BOTTOM - distance
    this.length = length
    this.draw()
  }

  startDrop () {
    this.t = requestAnimationFrame(frame.bind(this))
    function frame () {
      if (this.y >= Note.TOP_TO_BOTTOM + Note.RANGE * Note.PX_SPEED) {
        this.exist = false
        cancelAnimationFrame(this.t)
        this.clean()
        Note.queue[this.path - 1].shift()
        miss()
        miss()
        return
      }

      if (this.status === 0 && this.exist) {
        var d = Note.TOP_TO_BOTTOM - this.y
        this.update(d - Note.SPEED, this.length)
        requestAnimationFrame(frame.bind(this))
      } else if (this.status === 1 && this.exist) {
        if (this.y - this.length >= Note.TOP_TO_BOTTOM + Note.RANGE * Note.PX_SPEED) {
          this.exist = false
          cancelAnimationFrame(this.t)
          this.clean()
          Note.queue[this.path - 1].shift()
          miss()
          se.longLoop.pause()
          return
        }
        var l = this.length
        this.update(0, l - Note.SPEED)
        requestAnimationFrame(frame.bind(this))
      }
    }
  }
}
LongNote.IMG_POSITION_X = 102
LongNote.IMG_POSITION_Y = 0

function tap () {
  let dt = Math.abs(this.y - Note.TOP_TO_BOTTOM) / Note.PX_SPEED
  if (dt <= Note.RANGE) {
    this.exist = false
    cancelAnimationFrame(this.t)
    this.clean()
    Note.queue[this.path - 1].shift()
    rank(dt)
  } else {
    playSe(se.clap)
  }
}

function down () {
  if (this.status === 0) {
    let dt = Math.abs(this.y - Note.TOP_TO_BOTTOM) / Note.PX_SPEED
    if (dt <= Note.RANGE) {
      rank(dt)
      this.status = 1
      this.length = this.length - (this.y - Note.TOP_TO_BOTTOM)
      se.longLoop.loop = true
      se.longLoop.play()
    } else {
      playSe(se.clap)
    }
  }
}

function up () {
  se.longLoop.pause()
  let dt = Math.abs(this.y - this.length - Note.TOP_TO_BOTTOM) / Note.PX_SPEED
  if (dt <= Note.RANGE) {
    this.exist = false
    cancelAnimationFrame(this.t)
    this.clean()
    Note.queue[this.path - 1].shift()
    rank(dt)
  } else { // miss
    this.exist = false
    cancelAnimationFrame(this.t)
    this.clean()
    Note.queue[this.path - 1].shift()
    miss()
  }
}

function rank (dt) {
  if (dt <= 40) {
    liveResult.perfect++
    playSe(se.tapPerfect)
    // console.log('perfect')
  } else if (dt <= 60) {
    liveResult.great++
    playSe(se.tapGreat)
    // console.log('great')
  } else if (dt <= 80) {
    liveResult.nice++
    playSe(se.tapNice)
    // console.log('nice')
  } else {
    liveResult.bad++
    playSe(se.tapNice)
    // console.log('bad')
  }
}

function miss () {
  liveResult.miss++
  console.log('miss')
}

function keydown (path) {
  let note = Note.queue[path - 1][0]
  if (note) {
    if (note.constructor === ShortNote) tap.call(note)
    else down.call(note)
  } else {
    playSe(se.clap)
  }
}

function keyup (path) {
  let note = Note.queue[path - 1][0]
  if (note && note.constructor === LongNote && note.status === 1) up.call(note)
}

function keyBind () {
  window.addEventListener('keydown', (e) => {
    switch (e.keyCode) {
      case 67: keydown(1); break
      case 86: keydown(2); break
      case 66: keydown(3); break
      case 78: keydown(4); break
      case 77: keydown(5); break
      default: break
    }
  }, false)

  window.addEventListener('keyup', (e) => {
    switch (e.keyCode) {
      case 67: keyup(1); break
      case 86: keyup(2); break
      case 66: keyup(3); break
      case 78: keyup(4); break
      case 77: keyup(5); break
      default: break
    }
  }, false)
}

export { Note, ShortNote, LongNote, newImage, keyBind, liveResult }
