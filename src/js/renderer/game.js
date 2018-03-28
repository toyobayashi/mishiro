let liveResult = {
  perfect: 0,
  great: 0,
  nice: 0,
  bad: 0,
  miss: 0,
  maxCombo: 0
  // combo: 0,
  // hp: 100
}

let comboDom = document.getElementById('combo')
let numberDom = comboDom.getElementsByClassName('combo-number')[0]
let hpDom = document.getElementById('hp')

let model = {
  combo: 0,
  hp: 100
}

Object.defineProperties(liveResult, {
  combo: {
    configurable: true,
    enumerable: true,
    get () {
      return model.combo
    },
    set (n) {
      model.combo = n
      if (n > 0) {
        comboDom.style.display = 'flex'
        numberDom.innerHTML = n
      } else {
        comboDom.style.display = 'none'
      }
    }
  },
  hp: {
    configurable: true,
    enumerable: true,
    get () {
      return model.hp
    },
    set (h) {
      model.hp = h
      hpDom.style.width = h + '%'
      if (h <= 40 && h > 20) {
        hpDom.className = 'hp warning'
      } else if (h <= 20) {
        hpDom.className = 'hp dangerous'
      } else {
        hpDom.className = 'hp'
      }
    }
  }
})

let se = {
  clap: new Audio('./asset/sound/se.asar/se_live_clap.mp3'),
  fullcombo: new Audio('./asset/sound/se.asar/se_live_fullcombo.mp3'),
  longLoop: new Audio('./asset/sound/se.asar/se_live_long_loop.mp3'),
  tapGreat: new Audio('./asset/sound/se.asar/se_live_tap_great.mp3'),
  tapNice: new Audio('./asset/sound/se.asar/se_live_tap_nice.mp3'),
  tapPerfect: new Audio('./asset/sound/se.asar/se_live_tap_perfect.mp3')
}

const rankImg = newImage('./img/img.asar/rank.png')

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
Note.SPEED = 12 // x 60 px / s
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
      this.clean()
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
  if (dt <= 50) {
    liveResult.perfect++
    liveResult.combo++
    if (liveResult.combo > liveResult.maxCombo) liveResult.maxCombo = liveResult.combo
    showRank('perfect')
    playSe(se.tapPerfect)
    // console.log('perfect')
  } else if (dt <= 75) {
    liveResult.great++
    liveResult.combo++
    if (liveResult.combo > liveResult.maxCombo) liveResult.maxCombo = liveResult.combo
    showRank('great')
    playSe(se.tapGreat)
    // console.log('great')
  } else if (dt <= 87.5) {
    liveResult.nice++
    liveResult.combo = 0
    showRank('nice')
    playSe(se.tapNice)
    // console.log('nice')
  } else {
    playSe(se.tapNice)
    liveResult.bad++
    liveResult.combo = 0
    liveResult.hp -= 4
    showRank('bad')
    hpCheck()
    // console.log('bad')
  }
}

function miss () {
  liveResult.miss++
  liveResult.combo = 0
  liveResult.hp -= 6
  showRank('miss')
  hpCheck()
  // console.log('miss')
}

function hpCheck () {
  if (liveResult.hp < 0) window.close()
}

function clearRank () {
  Note.BACK_CTX.clearRect(0, Note.TOP_TO_BOTTOM - 100, 1280, 54)
}

let t = 1
let st = 1
function showRank (rank) {
  clearTimeout(st)
  clearRank()
  let f = 0
  cancelAnimationFrame(t)
  t = requestAnimationFrame(show)

  function show () {
    clearRank()
    if (rank === 'perfect') {
      Note.BACK_CTX.drawImage(
        rankImg,
        0,
        212,
        253,
        54,
        // (1280 - 253) / 2,
        (1280 - f * 253 / 9) / 2,
        // Note.TOP_TO_BOTTOM - 100,
        Note.TOP_TO_BOTTOM - 75 - f * 25 / 9,
        f * 253 / 9,
        f * 54 / 9
      )
    } else if (rank === 'great') {
      Note.BACK_CTX.drawImage(
        rankImg,
        0,
        159,
        208,
        53,
        (1280 - f * 208 / 9) / 2,
        Note.TOP_TO_BOTTOM - 75 - f * 25 / 9,
        f * 208 / 9,
        f * 53 / 9
      )
    } else if (rank === 'nice') {
      Note.BACK_CTX.drawImage(
        rankImg,
        0,
        106,
        141,
        53,
        (1280 - f * 141 / 9) / 2,
        Note.TOP_TO_BOTTOM - 75 - f * 25 / 9,
        f * 141 / 9,
        f * 53 / 9
      )
    } else if (rank === 'bad') {
      Note.BACK_CTX.drawImage(
        rankImg,
        0,
        53,
        128,
        53,
        (1280 - f * 128 / 9) / 2,
        Note.TOP_TO_BOTTOM - 75 - f * 25 / 9,
        f * 128 / 9,
        f * 53 / 9
      )
    } else if (rank === 'miss') {
      Note.BACK_CTX.drawImage(
        rankImg,
        0,
        0,
        151,
        53,
        (1280 - f * 151 / 9) / 2,
        Note.TOP_TO_BOTTOM - 75 - f * 25 / 9,
        f * 151 / 9,
        f * 53 / 9
      )
    }
    if (f >= 9) {
      cancelAnimationFrame(t)
      clearTimeout(st)
      st = setTimeout(() => {
        clearRank()
      }, 500)
    } else {
      f++
      requestAnimationFrame(show)
    }
  }
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
