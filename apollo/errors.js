const { createError } = require('apollo-errors')
const _AuthorisationError = createError('AuthorisationError', {
    message: 'You are not authorised.'
})

module.exports.AuthorisationError = _AuthorisationError
module.exports.AuthorizationError = _AuthorisationError