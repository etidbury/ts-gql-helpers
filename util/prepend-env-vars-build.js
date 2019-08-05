const path = require('path')
const fs = require('fs')
require('dotenv').config({ path: path.join(process.cwd(), '.env'), safe: true })

const TARGET_FILE_PATH = path.join(process.cwd(), './dist/index.js')
const ENV_EXAMPLE_FILE_PATH = path.join(process.cwd(),'.env.example')
const originalTargetFileContents = fs.readFileSync(TARGET_FILE_PATH,'utf-8')
// '!/PATH=/ && !/HOME=/ && !/HOST=/ && !/CWD=/ && !/PWD=/'
// delete reserved env vars and any sensitive
;['PATH','HOME','CWD','PWD','GITHUB_TOKEN','GITHUB_REPO_URL'].forEach((envName)=>{
    delete process.env[envName]
})

const envExampleFileContents = fs.readFileSync(ENV_EXAMPLE_FILE_PATH,'utf-8')

const processEnvVarsFilteredByEnvExample = {}

for (let processVarName in process.env){
    if (envExampleFileContents.indexOf(`${processVarName}=`) > -1){
        processEnvVarsFilteredByEnvExample[processVarName] = process.env[processVarName]
    }
}

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

for (let varName in processEnvVarsFilteredByEnvExample){
    prependValue += `process.env.${varName}="${processEnvVarsFilteredByEnvExample[varName]}";`
    prependValue += '\n'
}
prependValue += '//prepend-env-vars-build end\n'

fs.writeFileSync(TARGET_FILE_PATH,prependValue + originalTargetFileContents)

if (process.env.DEBUG){
    console.debug('Prepended text',prependValue)
}
