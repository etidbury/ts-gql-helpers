const fs = require('fs')
const path = require('path')
const readDirR = dir =>
    fs
        .readdirSync(dir)
        .reduce(
            (files, file) =>
                fs.statSync(path.join(dir, file)).isDirectory()
                    ? files.concat(readDirR(path.join(dir, file)))
                    : files.concat(path.join(dir, file)),
            []
        )
/**
 * Read directories recursively
 */
module.exports.readDirR = readDirR