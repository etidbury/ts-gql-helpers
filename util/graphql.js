const path = require('path')
const fs = require('fs')
const log = global.log || console
const {
    NODE_ENV,
    DEBUG
} = process.env

const isProd = NODE_ENV === 'production'
const isDebugging = DEBUG && DEBUG.length

module.exports.getSchema = (config)=>{

    // const { useMergeTypeDefs } = config

    const { fileLoader, mergeResolvers } = require('merge-graphql-schemas')

    const { readDirR } = require('./')

    const schemaFileExtensions = ['.ts', '.js', '.gql', '.graphql', '.graphqls']

    // let typeDefs

    // if (useMergeTypeDefs){
    
    //     const typeDefDir = path.join(process.cwd(),'src/typeDef')

    //     log.debug('> Scanning TypeDef directory:',typeDefDir)

    //     if (!isProd || isDebugging){
    //         readDirR(typeDefDir).forEach((f)=>{
    //             log.debug('> TypeDef file:',f)
    //         })
    //     }

    //     const typeDefArray = fileLoader(typeDefDir)
    //     const prismaClientDir = path.join(process.cwd(),'src/prisma-client')
    //     const prismaTypeDefArray = fileLoader(prismaClientDir)
    //     const concatTypeDefs = typeDefArray.concat(prismaTypeDefArray)

    //     log.debug('> Found TypeDefs:',concatTypeDefs.length)
        
    //     typeDefs = mergeTypes(concatTypeDefs,{ all: true,recursive: true,extensions: schemaFileExtensions })

    // }else{

    //     try{
            
    //         typeDefs = fs.readFileSync( path.join(process.cwd(),'dist/typeDefs.gql') ).toString()

    //     }catch (err){
    //         log.error(err)
    //         log.warn('Make sure you build the schema first! (run \'npm run build:schema\')\n\n')
    //         process.exit(1)
    //     }
    // } 

    // todo: check to make sure this is run via ts-node

    // const resolverDir = path.join(process.cwd(),isProd ? 'dist' : 'src', 'resolver')
    const resolverDir = path.join(process.cwd(),'src', 'resolver')

    log.debug('> Scanning Resolver directory:',resolverDir)

    if (!isProd || isDebugging){
        readDirR(resolverDir).forEach((f)=>{
            log.debug('> Resolver file:',f)
        })
    }
    const resolverArray = fileLoader(resolverDir)
    log.debug('> Found Resolvers:',resolverArray.length)

    const resolvers = mergeResolvers(resolverArray,{ all: true,recursive: true,extensions: schemaFileExtensions })

    return { resolvers }
}