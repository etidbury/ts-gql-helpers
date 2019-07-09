const path = require('path')
const fs = require('fs')
require('dotenv').config({ path: path.join(process.cwd(), '.env'), safe: true })

const TARGET_FILE_PATH = path.join(process.cwd(), './dist/index.js')

const originalTargetFileContents = fs.readFileSync(TARGET_FILE_PATH,'utf-8')
// '!/PATH=/ && !/HOME=/ && !/HOST=/ && !/CWD=/ && !/PWD=/'
// delete reserved env vars
;['PATH','HOME','CWD','PWD'].forEach((envName)=>{
    delete process.env[envName]
})

// Enforce Host is set to 0.0.0.0 for Zeit Now
process.env.HOST = '0.0.0.0'
let prependValue = `
if (!process){
    process={}
}

if (!process.env){
    process.env={}
}

`

for (let varName in process.env){

    // hotfix: remove very sensitive github token
    if (varName.toLowerCase().indexOf('github') > -1){
        continue
    }

    prependValue += `process.env.${varName}="${process.env[varName]}";`
    prependValue += '\n'
}

fs.writeFileSync(TARGET_FILE_PATH,prependValue + originalTargetFileContents)

if (process.env.DEBUG){
    console.debug('Prepended text',prependValue)
}
