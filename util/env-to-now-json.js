const path = require('path')
const fs = require('fs')
require('dotenv').config({ path: path.join(process.cwd(), '.env'), safe: true })

const NOW_JSON_FILE_PATH = path.join(process.cwd(),'now.json')
const nowJson = require(NOW_JSON_FILE_PATH)

if (!nowJson || typeof nowJson !== 'object'){
    throw new Error('Invalid now.json file. Make sure your now.json file is included within the project root')
}

if (typeof nowJson.env !== 'object'){
    nowJson.env = {}
}

// '!/PATH=/ && !/HOME=/ && !/HOST=/ && !/CWD=/ && !/PWD=/'
// delete reserved env vars
['PATH','HOME','CWD','PWD'].forEach((envName)=>{
    delete process.env[envName]
})

// Enforce Host is set to 0.0.0.0 for Zeit Now
process.env.HOST = '0.0.0.0'

nowJson.env = Object.assign(nowJson.env,process.env)

// change build env
if (typeof nowJson.build !== 'object'){
    nowJson.build = {}
}
if (typeof nowJson.build.env !== 'object'){
    nowJson.build.env = {}
}
nowJson.env = Object.assign(nowJson.build.env,process.env)

fs.writeFileSync(NOW_JSON_FILE_PATH,JSON.stringify(nowJson,null, 4))

if (process.env.DEBUG){
    console.debug('Extended environment variables using env-to-now-json.js')
}
