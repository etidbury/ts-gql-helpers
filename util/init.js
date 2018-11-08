const path = require('path')
require('dotenv').config({ path: path.join(process.cwd(),'.env'), safe: true })

const { ApolloServer } = require('apollo-server-express')
const { importSchema } = require('graphql-import')
const { getSchema } = require('./graphql')
const express = require('express')
const urljoin = require('url-join')

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

    let Prisma
    try {
        Prisma = require(path.join(process.cwd(),'./generated/prisma-client')).Prisma
    }catch(err){
        // todo: warn prisma generate etc...
        console.error(err)
        process.exit(1)
    }
    
    const { resolvers } = getSchema()
    const typeDefs = importSchema(path.resolve('src/schema.graphql'))
    
    const server = new ApolloServer({
        typeDefs,
        resolvers,
        context: req => Object.assign(
            req ,
            {
                prisma: new Prisma({
                    typeDefs: path.join(process.cwd(),'src/generated/prisma.graphql'),
                    endpoint: PRISMA_URL
                })
            }
        )
    })
    
    const app = express()
    
    server.applyMiddleware({ app })
    
    const port = PORT
    const host = HOST || '127.0.0.1'
    
    app.listen({ port: PORT },() => {
    
        const url = `http://${host}:${port}`
    
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