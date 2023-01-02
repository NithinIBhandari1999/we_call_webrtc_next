import { Fragment, useEffect, useState } from 'react';
import { useRouter } from 'next/router';

import VideoCall from './VideoCall';

const VideoCallParams = (props) => {
    const router = useRouter();

    const [roomId, setRoomId] = useState('');

    const [deviceId, setDeviceId] = useState('');

    // -----
    // useEffect
    useEffect(() => {
        if (router.isReady) {
            const { roomId } = router.query;
            console.log({ vcp: roomId });
            setRoomId(roomId);
        }
    }, [router.isReady, router.query]);

    useEffect(() => {
        let randomDeviceId = Math.floor(Math.random() * 1000000000);
        setDeviceId(`${randomDeviceId}`);
    }, []);

    return (
        <Fragment>
            {router.isReady && roomId !== '' && deviceId !== '' && (
                <VideoCall {...props} roomId={roomId} deviceId={deviceId} />
            )}
        </Fragment>
    );
};

export default VideoCallParams;
