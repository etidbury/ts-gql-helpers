const path = require('path')
const log = global.log || console
require('dotenv').config({ path: path.join(process.cwd(), '.env') })
const { importSchema } = require('graphql-import')

const {
    NODE_ENV,
    DEBUG
} = process.env

const isProd = NODE_ENV === 'production'
const isDebugging = DEBUG && DEBUG.length

;(async ()=>{
    
    const fs = require('fs')

    const typeDefs = importSchema(path.resolve('src/schema.graphql'))
    
    // todo: check dist dir exists
    fs.writeFileSync(path.join(process.cwd(),'dist/typeDefs.gql'),typeDefs)

})()