import fs from 'fs'

class FileReader {
  constructor (buf) {
    this.buf = buf
    this.curPos = 0
  }
  readUInt8 () {
    this.curPos++
    return this.buf.readUInt8(this.curPos - 1)
  }
  readUInt16LE () {
    this.curPos += 2
    return this.buf.readUInt16LE(this.curPos - 2)
  }
  readUInt32LE () {
    this.curPos += 4
    return this.buf.readUInt32LE(this.curPos - 4)
  }
  copy (target, targetStart, thisSize) {
    this.buf.copy(target, targetStart, this.curPos, this.curPos + thisSize)
    this.curPos += thisSize
  }
  seek (pos) {
    this.curPos = pos
  }
  tell () {
    return this.curPos
  }
}

class Lz4 {
  constructor (buf) {
    this.reader = new FileReader(buf)
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

    r.seek(4)
    decompressedSize = r.readUInt32LE()
    dataSize = r.readUInt32LE()
    endPos = dataSize + 16
    retArray = Buffer.alloc(decompressedSize)

    r.seek(16)

    // Start reading sequences
    while (1) {
      // read the LiteralSize and the MatchSize
      token = r.readUInt8()
      sqSize = token >> 4
      matchSize = (token & 0x0F) + 4
      if (sqSize === 15) sqSize += this.readAdditionalSize(r)

      // copy the literal
      r.copy(retArray, retCurPos, sqSize)
      retCurPos += sqSize

      if (r.tell() >= endPos - 1) break

      // read the offset
      offset = r.readUInt16LE()

      // read the additional MatchSize
      if (matchSize === 19) matchSize += this.readAdditionalSize(r)

      // copy the match properly
      if (matchSize > offset) {
        let matchPos = retCurPos - offset
        while (1) {
          retArray.copy(retArray, retCurPos, matchPos, matchPos + offset)
          retCurPos += offset
          matchSize -= offset
          if (matchSize < offset) break
        }
      }
      retArray.copy(retArray, retCurPos, retCurPos - offset, retCurPos - offset + matchSize)
      retCurPos += matchSize
    }

    return retArray
  }

  readAdditionalSize (reader) {
    let size = reader.readUInt8()
    if (size === 255) return size + this.readAdditionalSize(reader)
    else return size
  }
}

function lz4dec (input, output = 'unity3d') {
  let dec = new Lz4(fs.readFileSync(input))
  fs.writeFileSync(input + '.' + output, dec.decompress())
  return input + '.' + output
}

export default lz4dec
