const path = require('path')
require('dotenv-safe').config({ path: path.join(process.cwd(),'.env'), safe: true, debug: process.env.DEBUG })

const { ApolloServer } = require('apollo-server-express')
const { importSchema,mergeSchemas } = require('graphql-import')
const { getSchema } = require('./graphql')
const express = require('express')
const urljoin = require('url-join')
const fs = require('fs')

const {
    NODE_ENV,
    USE_NOTIFIER,
    HOST,
    PORT,
    PRISMA_URL
} = process.env

const isProd = NODE_ENV === 'production'
const log = global['log'] || console

const startServer = async ()=>{

    let PrismaClient
    try {
        PrismaClient = require(path.join(process.cwd(),isProd ? 'dist' : 'src', 'generated/prisma-client')).Prisma
    }catch(err){
        // todo: warn prisma generate etc...
        console.error(err)
        process.exit(1)
    }

    const { Prisma } = require('prisma-binding')
    const { typeDefs } = require( path.join(process.cwd(),isProd ? 'dist' : 'src','generated/prisma-client/prisma-schema') )
    
    const { resolvers } = getSchema()

    const { fileLoader, mergeTypes,mergeResolvers } = require('merge-graphql-schemas')
    
    const server = new ApolloServer({
        typeDefs: mergeTypes([
            // require(path.join(process.cwd(),isProd ? 'dist' : 'src', 'generated/prisma-client/prisma-schema' + (isProd ? '.js' : '.ts'))).typeDefs
            // fs.readFileSync( path.join(process.cwd(), 'prisma/datamodel.graphql' ) ).toString()
            fs.readFileSync( path.join(process.cwd(),isProd ? 'dist' : 'src','schema.graphql') ).toString()
        ]),
        resolvers,
        context: req => Object.assign(
            req ,
            {
                prisma: new Prisma({
                    typeDefs,
                    endpoint: PRISMA_URL
                }),
                db: new PrismaClient({
                    // typeDefs,
                    endpoint: PRISMA_URL
                })
            }
        )
    })
    
    const app = express()
    
    require( path.join(process.cwd(),isProd ? 'dist' : 'src','routes') ).default(app)
    
    server.applyMiddleware({ app })

    const port = PORT
    const host = HOST || '127.0.0.1'
    
    app.listen({ port: PORT },() => {
    
        const url = `http://${host}:${port}`

        if (!isProd){
            require('express-routemap')(app)
        }

        log.info(`🚀 Server ready at ${urljoin(url,server.graphqlPath)}`)
        
        if (USE_NOTIFIER) {
            try {
            
                const displayNotification = require('display-notification')
    
                displayNotification({
                    title: require(path.join(process.cwd(),'package')).name + ' now up!',
                    subtitle: url,
                    sound: 'Bottle'
                })
    
            }catch (err){
                log.warn('Failed to display notification. Ignoring...')
            }
        }
    
    })
}

module.exports = startServer