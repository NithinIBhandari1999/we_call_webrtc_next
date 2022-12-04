import { io } from 'socket.io-client';

import envKeys from './envKeys';

export const initSocket = async () => {

    const options = {
        'force new connection': true,
        reconnectionAttempts: 'Infinity',
        timeout: 1000,
        transport: ['websocket']
    };

    return io(envKeys.BACKEND_URL, options);
};