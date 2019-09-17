const path = require('path')
    
require('dotenv').config({
    safe: true,
    debug: process.env.DEBUG,
    allowEmptyValues: true,
    silent: true
})

const { Prisma,extractFragmentReplacements } = require('prisma-binding')
const { ApolloServer, gql } = require('apollo-server-micro')
// const { importSchema } = require('graphql-import')
const { AuthorisationError } = require('./errors')

module.exports = ({
    schemaDirectives,
    resolvers,
    jwtAuth,
    apolloTypeDefs,
    prismaClient,
    prismaTypeDefs,
    cache
})=>{
    
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
    
    const USER_AUTHENTICATION_TIMEOUT = 60 * 1000
    
    if ([
        PRISMA_URL
        // ,PRISMA_SECRET
    ].includes(undefined)) {
        throw new TypeError('Required environment variables not set')
    }
    
    // let prismaClient
    
    // try {
        
    //     // @ts-ignore
    //     prismaClient = require('./generated/prisma-client').prisma
    
    // }catch(err){
    //     // todo: warn prisma generate etc...
    //     console.error(err)
    //     process.exit(1)
    // }
    
    // const { typeDefs: prismaTypeDefs } = require('./generated/prisma-client/prisma-schema')
    
    if (!prismaTypeDefs) {
        throw new Error('Invalid generated Prisma client typeDefs')
    }
    
    const server = new ApolloServer({
        schemaDirectives,
        typeDefs: apolloTypeDefs,
        resolvers,
        introspection: true,
        playground: true,
        cache,
        cors: {
            origin: '*',
            methods: 'GET,HEAD,PUT,PATCH,POST,DELETE',
            preflightContinue: false,
            optionsSuccessStatus: 204,
            credentials: true
        },
        context: (ctx)=>{
    
            const { req,res,connection } = ctx
            // web socket subscriptions will return a connection
            if (connection) {
                // check connection for metadata
                return ctx
            }
            
            const userToken = ()=> new Promise((resolve, reject) => {
    
                setTimeout(()=>{
                    reject('Authentication timed out')
                },USER_AUTHENTICATION_TIMEOUT)// todo: set timeout via env variable, also check resolved
    
                jwtAuth(req, res, (e) => {
    
                    if (req.user) {
                        return resolve(req.user)
                    }
    
                    reject(new AuthorisationError('Failed to extract user information from token'))
    
                })
            })
            
            return Object.assign(ctx,{
                userToken,
                // user,
                db: new Prisma({
                    fragmentReplacements: extractFragmentReplacements(resolvers),
                    typeDefs: prismaTypeDefs,
                    endpoint: PRISMA_URL,
                    secret: PRISMA_SECRET,
                    debug: DEBUG
                }),
                prismaClient 
            })
        }
    })
    
    const withCors = handler => (req, res, ...args) => {
    
        // add required headers here
        res.setHeader('Access-Control-Allow-Origin', '*')
        res.setHeader('Access-Control-Allow-Credentials' ,true)
        res.setHeader('Access-Control-Allow-Headers' ,['X-Requested-With','Access-Control-Allow-Origin','X-HTTP-Method-Override','Content-Type','Authorization','Accept'].join(','))
        
        if (req.method === 'OPTIONS'){
    
            // add required headers here
            // res.setHeader("Access-Control-Allow-Origin", "*")
            res.end()
        }else {
            return handler(req, res, ...args)
        }
    }
      
    const cors = require('micro-cors')()
    
    return withCors(cors(server.createHandler()))
    // if (!isProd) {
    
    //     const { router, get, post } = require('microrouter')
    //     const graphqlHandler = server.createHandler()
    
    //     module.exports = router(
    //       get('/',graphqlHandler),
    //       post('/', graphqlHandler),
    //     )
    
    // }else{
    //     module.exports=server.createHandler()
    // }
    
}
