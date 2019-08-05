const path = require('path')
const fs = require('fs')
require('dotenv').config({ path: path.join(process.cwd(), '.env'), safe: true })

const NOW_JSON_FILE_PATH = path.join(process.cwd(),'now.json')
const ENV_EXAMPLE_FILE_PATH = path.join(process.cwd(),'.env.example')
const nowJson = require(NOW_JSON_FILE_PATH)

if (!nowJson || typeof nowJson !== 'object'){
    throw new Error('Invalid now.json file. Make sure your now.json file is included within the project root')
}

if (typeof nowJson.env !== 'object'){
    nowJson.env = {}
}

const envExampleFileContents = fs.readFileSync(ENV_EXAMPLE_FILE_PATH,'utf-8')

const processEnvVarsFilteredByEnvExample = {}

for (let processVarName in process.env){
    if (envExampleFileContents.indexOf(`${processVarName}=`) > -1){
        processEnvVarsFilteredByEnvExample[processVarName] = process.env[processVarName]
    }
}

// '!/PATH=/ && !/HOME=/ && !/HOST=/ && !/CWD=/ && !/PWD=/'
// delete reserved env vars and any sensitive
['PATH','HOME','CWD','PWD','GITHUB_TOKEN','GITHUB_REPO_URL'].forEach((envName)=>{
    delete process.env[envName]
})

// Enforce Host is set to 0.0.0.0 for Zeit Now
processEnvVarsFilteredByEnvExample.HOST = '0.0.0.0'

nowJson.env = Object.assign(nowJson.env,processEnvVarsFilteredByEnvExample)

// change build env
if (typeof nowJson.build !== 'object'){
    nowJson.build = {}
}
if (typeof nowJson.build.env !== 'object'){
    nowJson.build.env = {}
}
nowJson.env = Object.assign(nowJson.build.env,processEnvVarsFilteredByEnvExample)

fs.writeFileSync(NOW_JSON_FILE_PATH,JSON.stringify(nowJson,null, 4))

if (process.env.DEBUG){
    console.debug('Extended environment variables using env-to-now-json.js')
}
