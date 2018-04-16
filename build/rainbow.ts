import * as util from 'util'

const colors = {
  reset: '\x1b[0m',
  fg: {
    black: '\x1b[30m',
    red: '\x1b[31m',
    green: '\x1b[32m',
    yellow: '\x1b[33m',
    blue: '\x1b[34m',
    magenta: '\x1b[35m',
    cyan: '\x1b[36m',
    white: '\x1b[37m',
    rgb: '\x1b[38;2;',
    bBlack: '\x1b[30;1m',
    bRed: '\x1b[31;1m',
    bGreen: '\x1b[32;1m',
    bYellow: '\x1b[33;1m',
    bBlue: '\x1b[34;1m',
    bMagenta: '\x1b[35;1m',
    bCyan: '\x1b[36;1m',
    bWhite: '\x1b[37;1m'
  },
  bg: {
    black: '\x1b[40m',
    red: '\x1b[41m',
    green: '\x1b[42m',
    yellow: '\x1b[43m',
    blue: '\x1b[44m',
    magenta: '\x1b[45m',
    cyan: '\x1b[46m',
    white: '\x1b[47m',
    rgb: '\x1b[48;2;',
    bBlack: '\x1b[100m',
    bRed: '\x1b[101m',
    bGreen: '\x1b[102m',
    bYellow: '\x1b[103m',
    bBlue: '\x1b[104m',
    bMagenta: '\x1b[105m',
    bCyan: '\x1b[106m',
    bWhite: '\x1b[107m'
  }
}

const std = process.stdout

const LEFT = '\x1b[666D'
const UP = '\x1b[1A'
const ERASE = '\x1b[0K'
const CLEAR_LINE = LEFT + ERASE

let LF = 0

function checkRGB (arr) {
  let flag = false
  if (arr.length === 3) {
    let n = 0
    arr.forEach(v => {
      if (!isNaN(v) && v >= 0 && v <= 255) {
        n++
      }
    })
    if (n === 3) {
      flag = true
    }
  }
  return flag
}

function addColor (content, cl, type) {
  if (cl) {
    if (Array.isArray(cl)) {
      if (checkRGB(cl)) {
        content = `${colors[type].rgb}${cl[0]};${cl[1]};${cl[2]}m${util.format(content)}${colors.reset}`
      }
    } else if (typeof cl === 'string') {
      if (cl[0] === '#') {
        if (cl.length === 4) {
          let clarr = cl.split('#')[1].match(/.{1}/g)
          let clnum = clarr.map(v => Number(`0x${v + v}`))
          if (checkRGB(clnum)) {
            content = `${colors[type].rgb}${clnum[0]};${clnum[1]};${clnum[2]}m${util.format(content)}${colors.reset}`
          }
        } else if (cl.length === 7) {
          let clarr = cl.split('#')[1].match(/.{2}/g)
          let clnum = clarr.map(v => Number(`0x${v}`))
          if (checkRGB(clnum)) {
            content = `${colors[type].rgb}${clnum[0]};${clnum[1]};${clnum[2]}m${util.format(content)}${colors.reset}`
          }
        }
      }
    }
  }
  return content
}

function c (content, fg, bg) {
  content = addColor(content, fg, 'fg')
  content = addColor(content, bg, 'bg')
  return content
}

function clearLine (n = 0) {
  if (n < 0) {
    return
  }
  for (let i = 0; i < n; i++) {
    std.write(CLEAR_LINE + UP)
  }
  std.write(CLEAR_LINE)
}

function slog (format, ...arg) {
  const str = util.format(format, ...arg)
  clearLine(LF)
  std.write(str)
  const matching = str.match(/\n/g)
  LF = matching ? matching.length : 0
}

function llog (format, ...arg) {
  std.write(util.format(format, ...arg))
  if (LF) LF = 0
}

function log (format, ...arg) {
  llog(format, ...arg)
  llog('\n')
}

function l (format, ...arg) {
  std.write(colors.fg[this] + util.format(format, ...arg) + colors.reset + '\n')
  if (LF) LF = 0
}

const ilog = l.bind('bGreen')
const wlog = l.bind('bYellow')
const elog = l.bind('bRed')

export {
  colors,
  c,
  llog,
  log,
  slog,
  ilog,
  wlog,
  elog,
  clearLine
}
