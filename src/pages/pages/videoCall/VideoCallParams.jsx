import { Fragment, useEffect, useState } from 'react';
import { useRouter } from 'next/router';

import VideoCall from './VideoCall';

const VideoCallParams = (props) => {
    const router = useRouter();

    const [roomId, setRoomId] = useState('');

    // -----
    // useEffect
    useEffect(() => {
        if (router.isReady) {
            const { roomId } = router.query;
            console.log({ vcp: roomId });
            setRoomId(roomId);
        }
    }, [router.isReady, router.query]);

    return (
        <Fragment>
            {router.isReady && roomId !== '' && (
                <VideoCall {...props} roomId={roomId} />
            )}
        </Fragment>
    );
};

export default VideoCallParams;
