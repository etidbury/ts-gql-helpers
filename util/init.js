
const path = require('path')
require('dotenv-safe').config({ safe: true, debug: process.env.DEBUG, allowEmptyValues: true })

const { ApolloServer } = require('apollo-server-express')
const { importSchema } = require('graphql-import')
// const { getSchema } = require('./graphql')
const express = require('express')
const { createServer } = require('http')
const urljoin = require('url-join')
// const fs = require('fs')
// const { makeExecutableSchema } = require('graphql-tools')

const bodyParser = require('body-parser')
const cors = require('cors')

const {
    DEBUG,
    NODE_ENV,
    USE_NOTIFIER,
    HOST,
    PORT,
    PRISMA_URL,
    PRISMA_SECRET,
    BODY_PARSER_EXTENDED,
    BODY_PARSER_LIMIT
} = process.env

const isProd = NODE_ENV === 'production'
const log = global['log'] || console

const startServer = async ()=>{

    let prismaClient
    try {
        prismaClient = require(path.join(process.cwd(),isProd ? 'dist' : 'src', 'generated/prisma-client')).prisma
    }catch(err){
        // todo: warn prisma generate etc...
        console.error(err)
        process.exit(1)
    }

    const { Prisma,extractFragmentReplacements } = require('prisma-binding')
    const { typeDefs } = require( path.join(process.cwd(),isProd ? 'dist' : 'src','generated/prisma-client/prisma-schema') )
    
    // const { resolvers } = getSchema()

    const resolvers = require( path.join(process.cwd(),isProd ? 'dist' : 'src','resolvers') )

    const schemaDirectives = require( path.join(process.cwd(),isProd ? 'dist' : 'src','schemaDirectives') )

    // const { fileLoader, mergeTypes,mergeResolvers } = require('merge-graphql-schemas')

    // let schema = makeExecutableSchema({
    //     typeDefs: importSchema('./src/schema.graphql'),
    //     resolvers,
    //     directiveResolvers: schemaDirectives
    // })
    
    // schema = addDirectiveResolveFunctionsToSchema(schema,schemaDirectives)

    const jwtAuth = require( path.join(process.cwd(),isProd ? 'dist' : 'src','middleware/auth') )

    const server = new ApolloServer({
        // schemaDirectives,
        typeDefs: importSchema('./src/schema.graphql'),
        resolvers,
        schemaDirectives,
        // schema,
        introspection: true, // todo: add env option to disable introspection?
        playground: true,// todo: add env option to disable playground?
        context: (ctx)=>{
            const { req,res,connection } = ctx
            // web socket subscriptions will return a connection
            if (connection) {
                // check connection for metadata
                return ctx
            }
            
            const userToken = ()=>new Promise((resolve, reject) => {
                setTimeout(reject,120000)// todo: set timeout via env variable, also check resolved
                jwtAuth(req, res, (e) => {
                    if (req.user) {
                        resolve(req.user)
                    } else {
                        resolve()
                    }
                })
            })
            
            // jwtAuth({
            //     secret: JWT_SECRET,
            //     credentialsRequired: false,
            // })(req, res, (e) => {
            //     if (req.user) {
            //         resolve(User.findOne({ where: { id: req.user.id } }))
            //     } else {
            //         resolve(null)
            //     }
            // }
            return Object.assign(ctx,{ 
                userToken,
                // user,
                db: new Prisma({
                    fragmentReplacements: extractFragmentReplacements(resolvers),
                    typeDefs,
                    endpoint: PRISMA_URL,
                    secret: PRISMA_SECRET,
                    debug: DEBUG
                }),
                prismaClient 
            })
        }
        // context: req => Object.assign(
        //     req ,
        //     {
        //         db: new Prisma({
        //             fragmentReplacements: extractFragmentReplacements(resolvers),
        //             typeDefs,
        //             endpoint: PRISMA_URL,
        //             secret: PRISMA_SECRET,
        //             debug: DEBUG
        //         }),
        //         prismaClient
        //     }
        // )
    })
    
    const app = express()

    app.use(cors())
    // parse application/x-www-form-urlencoded
    app.use(bodyParser.urlencoded({ limit: BODY_PARSER_LIMIT , extended: !!BODY_PARSER_EXTENDED }))

    // parse application/json
    app.use(bodyParser.json({ limit: BODY_PARSER_LIMIT }))
    
    const routes = require( path.join(process.cwd(),isProd ? 'dist' : 'src','routes') )

    // todo: improve this logic to handle es6, commonjs and any other poss
    if (typeof routes.default === 'function'){
        routes.default(app)
    }else{
        routes(app)
    }
    
    server.applyMiddleware({ app, path: '/graphql' })

    const httpServer = createServer(app)

    // todo: make env dependant?
    server.installSubscriptionHandlers(httpServer)

    const port = PORT
    const host = HOST || '0.0.0.0'

    // const { checkJwt } = require('./middleware/jwt')

    // todo: update to scan all middlewares
    app.use(jwtAuth)

    // todo: make env dependant?
    const { express: voyagerMiddleware } = require('graphql-voyager/middleware')
    app.use('/voyager', voyagerMiddleware({ endpointUrl: '/graphql' }))

    httpServer.listen({ port: PORT },async () => {
    
        const url = `http://${host}:${port}`

        if (!isProd){
            require('express-routemap')(app)
        }

        log.info(`🚀 Server ready at ${urljoin(url,server.graphqlPath)} ${!isProd && '(development)'}`)
        
        if (USE_NOTIFIER) {
            try {
            
                const displayNotification = require('display-notification')
    
                await displayNotification({
                    title: require(path.join(process.cwd(),'package')).name + ' now up!',
                    subtitle: url,
                    sound: 'Bottle'
                })
    
            }catch (err){
                log.warn('Failed to display notification. Ignoring...')
            }
        }

        // todo: possibly remove?
        // if (DEBUG){
        //     let id = 0
        //     const { PubSub } = require('apollo-server')
        //     const pubsub = new PubSub()
        //     const MESSAGE_CREATED = 'MESSAGE_CREATED'

        //     setInterval(() => {
        //         pubsub.publish(MESSAGE_CREATED, {
        //             messageCreated: { id, content: new Date().toString() },
        //         })
              
        //         id++
        //     }, 1000)
        // }
    
    })
}

module.exports = startServer