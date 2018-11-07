/**
 * Default Swagger Configuration
 */
module.exports = {
    routePrefix: '/swagger',
    exposeRoute: true,
   
    swagger: {
        mode: 'dynamic',
        // info: {
        //     title: 'Test swagger',
        //     description: 'testing the fastify swagger api',
        //     version: '0.1.0'
        // },
        // externalDocs: {
        //     url: 'https://swagger.io',
        //     description: 'Find more info here'
        // },
        // host: 'localhost:3004', // autosets
        // schemes: ['http'],
        consumes: ['application/json'],
        produces: ['application/json'],
        // tags: [
        //     { name: 'auth', description: 'Authentication to grab user token' },
        //     { name: 'moderate', description: 'Moderating authentication functions' }
        // ],
        // securityDefinitions: {
        //     apiKey: {
        //         type: 'apiKey',
        //         name: 'apiKey',
        //         in: 'header'
        //     }
        // }
    }
}