// Version 0.1.0

const path = require('path')
const fs = require('fs')
require('dotenv').config({ path: path.join(process.cwd(), '.env'), safe: true })

const NOW_JSON_FILE_PATH = path.join(process.cwd(),'now.json')
const nowJson = require(NOW_JSON_FILE_PATH)

if (!nowJson || typeof nowJson !== 'object'){
    throw new Error('Invalid now.json file. Make sure your now.json file is included within the project root')
}
if (process.env.NOW_ALIAS && process.env.NOW_ALIAS.length){
    nowJson.alias = process.env.NOW_ALIAS

    fs.writeFileSync(NOW_JSON_FILE_PATH,JSON.stringify(nowJson,null, 4))
    
}else{
    console.warn('No NOW_ALIAS specified')
    if (nowJson.alias && nowJson.alias.length){
        console.warn('Using default alias specified in now.json',nowJson.alias)
        
    }
}

if (process.env.DEBUG){
    console.debug('Extended environment variables using env-to-now-json.js')
}
