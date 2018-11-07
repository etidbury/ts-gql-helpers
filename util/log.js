const {
    DISABLE_LOGS,
    LOG_LEVEL,
    LOG_TIMESTAMP,
    DEBUG
} = process.env

const isDebugging = DEBUG && DEBUG.length

// Disable console logs
if (DISABLE_LOGS) {
    const noOp = function() {} // no-op function

    const names = [
        'log',
        'debug',
        'info',
        'warn',
        'error',
        'assert',
        'dir',
        'dirxml',
        'group',
        'groupEnd',
        'time',
        'timeEnd',
        'count',
        'trace',
        'profile',
        'profileEnd'
    ]

    if (typeof window !== 'undefined') {
        names.forEach(name => {
            window.console[name] = noOp
        })
    }

    if (typeof global.console !== 'undefined') {
        names.forEach(name => {
            global.console[name] = noOp
        })
    }
}else{

    try {

        const chalk = require('chalk')

        const prettyPrintOptions = {
            colorize: true
        }
        if (LOG_TIMESTAMP){
            prettyPrintOptions.translateTime = 'SYS:standard'
        }
        const _logLevel = LOG_LEVEL || (isDebugging && 'debug') || 'info'

        if (global.log){
            console.warn('Overriding \'global.log\'!')
        }
        global.log = {}

        log.info = function(){
            Array.prototype.unshift.call(arguments, chalk.blueBright('INFO\t'))
            console.info.apply(this, arguments)
        }
        // because log.error does not show otherwise!
        log.error = function(){
            Array.prototype.unshift.call(arguments, chalk.red('ERROR\t'))
            console.error.apply(this, arguments)
        }

        log.warn = function(){
            Array.prototype.unshift.call(arguments, chalk.yellow('WARN\t'))
            console.warn.apply(this, arguments)
        }
      
        log.debug = function(){
            Array.prototype.unshift.call(arguments, chalk.blue('DEBUG\t'))
            console.debug.apply(this, arguments)
        }

    }catch (err){
        global.log = console
        console.error(err)
        console.error('> Failed prettifying logs. Falling back to console')
    }
}