import {io} from 'socket.io-client'

export const initSocket = async() =>{
    const options = {
        'force new conenction': true,
        reconnectionAttempt:'Infinity',
        timeout: 10000,
        transports: ['websocket'],
    };
    console.log("called")

    return io(process.env.REACT_APP_BACKEND_URL, options )
}