const path = require('path')
const log = global.log || console
require('dotenv').config({ path: path.join(process.cwd(), '.env') })

const {
    NODE_ENV,
    DEBUG
} = process.env

const isProd = NODE_ENV === 'production'
const isDebugging = DEBUG && DEBUG.length

;(async ()=>{
    
    const fs = require('fs')

    const { getSchema } = require('./graphql')
    
    const { typeDefs } = getSchema({ useMergeTypeDefs: true })
    
    fs.writeFileSync(path.join(process.cwd(),'dist/typeDefs.gql'),typeDefs)

})()