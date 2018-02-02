const path = require('path')
/**
 * @method hcadec
 * @param {String} hcaFilePath -- hca file path
 * @return {Boolean}
 */
const hcadec = require('./build/Release/hcadec.node')

// Synchronizing, return true or false
console.log(hcadec(path.join(__dirname, 'song_3015.hca')))
