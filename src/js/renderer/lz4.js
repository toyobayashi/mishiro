import fs from 'fs'
// Binary Reader for Uint8Array
/* class BinaryReader */
class BinaryReader {
  constructor (array) {
    this.ary = array
    this.curPos = 0
  }
  readByte () {
    this.curPos++
    return this.ary[this.curPos - 1]
  }
  readShortLE () {
    this.curPos += 2
    return this.ary[this.curPos - 2] + (this.ary[this.curPos - 1] << 8)
  }
  readIntLE () {
    this.curPos += 4
    return this.ary[this.curPos - 4] + (this.ary[this.curPos - 3] << 8) + (this.ary[this.curPos - 2] << 16) + (this.ary[this.curPos - 1] << 24)
  }
  copyBytes (dst, offset, size) {
    dst.set(this.ary.slice(this.curPos, this.curPos + size), offset)
    this.curPos += size
  }
  seekAbs (pos) {
    this.curPos = pos
  }
  seekRel (diff) {
    this.curPos += diff
  }
  getPos () {
    return this.curPos
  }
}

// Unity LZ4 Decompressor for Uint8Array
class Lz4 {
  constructor (array) {
    this.reader = new BinaryReader(array)
  }
  decompress () {
    let r = this.reader
    let retArray
    let dataSize = 0
    let decompressedSize = 0

    let token = 0
    let sqSize = 0
    let matchSize = 0
    // let litPos = 0;
    let offset = 0
    let retCurPos = 0
    let endPos = 0

    r.seekAbs(4)
    decompressedSize = r.readIntLE()
    dataSize = r.readIntLE()
    endPos = dataSize + 16
    retArray = new Uint8Array(decompressedSize)

    r.seekAbs(16)

    // Start reading sequences
    while (1) {
      // read the LiteralSize and the MatchSize
      token = r.readByte()
      sqSize = token >> 4
      matchSize = (token & 0x0F) + 4
      if (sqSize == 15) { sqSize += this.readAdditionalSize(r) }

      // copy the literal
      r.copyBytes(retArray, retCurPos, sqSize)
      retCurPos += sqSize

      if (r.getPos() >= endPos - 1) { break }

      // read the offset
      offset = r.readShortLE()

      // read the additional MatchSize
      if (matchSize == 19) { matchSize += this.readAdditionalSize(r) }

      // copy the match properly
      if (matchSize > offset) {
        let matchPos = retCurPos - offset
        while (1) {
          retArray.copyWithin(retCurPos, matchPos, matchPos + offset)
          retCurPos += offset
          matchSize -= offset
          if (matchSize < offset) { break }
        }
      }
      retArray.copyWithin(retCurPos, retCurPos - offset, retCurPos - offset + matchSize)
      retCurPos += matchSize
    }

    return retArray
  }

  readAdditionalSize (reader) {
    let size = reader.readByte()
    if (size == 255) { return size + this.readAdditionalSize(reader) } else { return size }
  }
}

function lz4dec (input, output = 'unity3d') {
  let dec = new Lz4(fs.readFileSync(input))
  let raw = dec.decompress()
  fs.writeFileSync(input + '.' + output, Buffer.from(raw.buffer))
  return input + '.' + output
}

export default lz4dec

/*
* in browser

function handleFileSelect (loaded) {
  var file = $('#file').prop('files')[0]
  if (file == null) {
    alert('Please select a file.')
    return
  }
  var reader = new FileReader()
  reader.onload = function () {
    loaded(reader.result, file.name)
  }
  reader.readAsArrayBuffer(file)
}
$(function () {
  $('#load').click(function () {
    handleFileSelect(function (ary, name) {
      var fBuf = new Uint8Array(ary)
      var dec = new lz4(fBuf)
      var raw = dec.decompress()
      var blob = new Blob([raw], { type: 'octet/stream' })
      var a = document.createElement('a')
      a.href = URL.createObjectURL(blob)
      a.target = '_blank'
      a.download = name + '.unity3d'
      a.click()
    })
  })
})
*/
