import fs from 'fs'
import path from 'path'

function UTFTable (acb) {
  let body = acb.slice(8)

  let tableHeader = {
    unknown: body.readUIntBE(0x0, 2),
    tableDataOffset: body.readUIntBE(0x2, 2),
    stringDataOffset: body.readUIntBE(0x4, 4),
    binaryDataOffset: body.readUIntBE(0x8, 4),
    tableNameStringOffset: body.readUIntBE(0xc, 4),
    columnLength: body.readUIntBE(0x10, 2),
    rowTotalByte: body.readUIntBE(0x12, 2),
    rowLength: body.readUIntBE(0x14, 4),
  }

  let columnType = {
    zero: 0x10,
    constant: 0x30,
    perrow: 0x50,
    constant2: 0x70,
  }

  let dataType = {
    Uint8: 0x00,
    Int8: 0x01,
    Uint16: 0x02,
    Int16: 0x03,
    Uint32: 0x04,
    Int32: 0x05,
    Uint64: 0x06,
    Int64: 0x07,
    Float: 0x08,
    Double: 0x09,
    String: 0x0a,
    Binary: 0x0b,
  }

  let keyData = body.slice(0x18, tableHeader.tableDataOffset)
  let tableData = body.slice(tableHeader.tableDataOffset, tableHeader.stringDataOffset)
  let stringData = body.slice(tableHeader.stringDataOffset, tableHeader.binaryDataOffset)
  let binaryData = body.slice(tableHeader.binaryDataOffset)

  let rows = []
  let constants = []

  for (let r = 0; r < tableHeader.rowLength; r++) {
    let d = r * tableHeader.rowTotalByte
    let row = {}
    let constant = {}
    let kd = 0
    for (let i = 0; i < keyData.length;) {
      let keyT = keyData[i] & 0xf0
      let dataT = keyData[i] & 0x0f


      let data
      // let st
      
      switch (dataT) {
        case dataType.Uint8:
          data = tableData.readUInt8(d)
          kd = 1
          d += 1
          // st = ': UInt8'
          break
        case dataType.Int8:
          data = tableData.readInt8(d)
          kd = 1
          d += 1
          // st = ': Int8'
          break
        case dataType.Uint16:
          data = tableData.readUInt16BE(d)
          kd = 2
          d += 2
          // st = ': UInt16'
          break
        case dataType.Int16:
          data = tableData.readInt16BE(d)
          kd = 2
          d += 2
          // st = ': Int16'
          break
        case dataType.Uint32:
          data = tableData.readUInt32BE(d)
          kd = 4
          d += 4
          // st = ': UInt32'
          break
        case dataType.Int32:
          data = tableData.readInt32BE(d)
          kd = 4
          d += 4
          // st = ': Int32'
          break
        case dataType.Uint64:
          data = tableData.readUInt64BE(d)
          kd = 8
          d += 8
          // st = ': UInt64'
          break
        case dataType.Int64:
          data = tableData.readInt64BE(d)
          kd = 8
          d += 8
          // st = ': Int64'
          break
        case dataType.Float:
          data = tableData.readFloatBE(d)
          kd = 4
          d += 4
          // st = ': Float'
          break
        case dataType.Double:
          data = tableData.readDoubleBE(d)
          kd = 8
          d += 8
          // st = ': Double'
          break
        case dataType.String:
          let offs = tableData.readUIntBE(d, 4)
          let stringslice = stringData.slice(offs).toString()
          data = stringslice.substr(0, stringslice.indexOf('\u0000'))
          kd = 4
          d += 4
          // st = ': String'
          break
        case dataType.Binary:
          let offset = [tableData.readUIntBE(d, 4), tableData.readUIntBE(d + 4, 4)]
          let buf = binaryData.slice(offset[0], offset[0] + offset[1])
          data = buf
          kd = 8
          d += 8
          // st = ': Binary'
          break
        default:
          break;
      }

      if (keyT === columnType.zero || keyT === columnType.perrow) {
        let keyoffset = keyData.readUIntBE(i + 1, 4)

        let key = stringData.slice(keyoffset).toString().split('\x00')[0]
        row[key] = data
        i += 5
      } else { // I don't know.
        /* let keyoffset = keyData.readUIntBE(i + 1, 4)
        let c = keyData.readUIntBE(i + 5, kd)
        let key = stringData.slice(keyoffset).toString().split('\x00')[0]
        constant[key] = c */
        i += (5 + kd)
      }
    }
    rows.push(row)
    constants.push(constant)
  }

  return rows
}

function getHCAFromAWB (awb, name, cueNameTable) {
  let dataSizeLength = awb.readUInt8(0x5)
  let fileCount = awb.readUInt32LE(0x8)
  let alignment = awb.readUInt32LE(0xc)


  let fileIndex = []
  let d = 16
  for (let i = 0; i < fileCount; i++) {
    fileIndex.push(awb.readUInt8(d))
    d += 2
  }
  
  let fileEndPoints = []
  for (let i = 0; i <= fileCount; i++) {
    fileEndPoints.push(awb.readUIntLE(d, dataSizeLength))
    d += dataSizeLength
  }

  let hcaFiles = []
  
  for (let i = 1; i < fileEndPoints.length; i++) {
    let start = Math.ceil(fileEndPoints[i - 1] / alignment) === fileEndPoints[i - 1] / alignment ? (fileEndPoints[i - 1] / alignment + 1) * alignment : Math.ceil(fileEndPoints[i - 1] / alignment) * alignment
    let index = fileIndex[i - 1]
    let cueName = ''
    for (let j = 0; j < cueNameTable.length; j++) {
      if (cueNameTable[j].CueIndex === index) {
        cueName = cueNameTable[j].CueName
        break
      }
    }
    hcaFiles.push({
      name: `${cueName}.hca`,
      buf: awb.slice(start, fileEndPoints[i] + 1)
    })
  }
  return hcaFiles
}

function extractACB (acbPath, outputDir = path.join(path.parse(acbPath).dir, `_acb_${path.parse(acbPath).base}`)) {
  let utftable = UTFTable(fs.readFileSync(acbPath))
  let cueNameTable = UTFTable(utftable[0].CueNameTable)
  let awb = utftable[0].AwbFile
  let hcaFiles = getHCAFromAWB(awb, utftable[0].Name, cueNameTable)
  
  if (!fs.existsSync(outputDir)) fs.mkdirSync(outputDir)
  for (const f of hcaFiles) {
    fs.writeFileSync(path.join(outputDir, f.name), f.buf)
  }
}

export default extractACB
