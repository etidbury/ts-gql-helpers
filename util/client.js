const axios = require('axios')
const { API_BASE_URL } = process.env

const client = axios.create({
    timeout: 60 * 1000,
    baseURL: API_BASE_URL
    /* validateStatus: (status) => {
        return (status >= 200 && status < 300 || status === 401 || status === 403);
    }*/
})

axios.interceptors.request.use(function(config) {
   
    console.debug('Request URL:',config.url)

    return config
})

/** Cause delays for Spotify API requests */
// const _spotifyApiResponseHandler = async response => {
//     const url = response && response.config && response.config.url || ''
    
//     if (url.indexOf('api.spotify.com') > -1) {
//         const wait = new Promise((resolve, reject) => {
//             setTimeout(() => {
//                 resolve(response)
//             }, SPOTIFY_REQUEST_DELAY)
            
//         })

//         response = await wait
//     }

//     return response
// }

// client.interceptors.response.use(
//     (response)=>_spotifyApiResponseHandler(response)
//     ,(error)=>_spotifyApiResponseHandler(error).then((response)=>Promise.reject(error && error.response && error.response.data || response) )
// )

/**
 * Pretty-print axios network errors.
 */
const MAX_DATA_CONSOLE_OUT_LENGTH = 600

let _lastError
client.interceptors.response.use(
    response => {
        console.debug('Response URL:',response.config.url)
        return response
    },
    error => {
        try {
            try {
                const errorId =
                    error.response.status +
                    error.config.method.toUpperCase() +
                    error.config.url +
                    error.response.data.substr(0,MAX_DATA_CONSOLE_OUT_LENGTH)

                if (errorId !== _lastError) {
                    console.error(
                        error.response.status,
                        error.config.method.toUpperCase(),
                        error.config.url,
                        error.response.data.substr(0,MAX_DATA_CONSOLE_OUT_LENGTH)
                    )
                    _lastError = errorId
                }
            } catch (e) {
                const status = error.config.status || (error.response && error.response.status)

                const errorId =
                    status +
                    error.config.method.toUpperCase() +
                    error.config.url

                if (errorId !== _lastError) {
                    console.error(
                        status,
                        error.config.method.toUpperCase(),
                        error.config.url,
                        
                    )
                    _lastError = errorId
                }
            }
        } catch (e) {
            console.error((error && error.response) || error)
        }
        
        return Promise.reject(error)

        // return Promise.reject(error)
    }
)

module.exports = client
