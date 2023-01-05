import { Fragment } from 'react';

import VideoSendStream from './VideoSendStream';

const VideoSendStreamAll = ({
    refSocket,
    curDeviceId,
    curRoomId,
    userList,
    socketIdLocal,
}) => {
    // -----
    // code

    // -----
    // useStates

    // -----
    // useRefs

    // -----
    // useEffects

    // -----
    // functions
    return (
        <div>
            {userList.map((userInfo) => {
                if (userInfo.deviceId === curDeviceId) {
                    return <Fragment key={userInfo.deviceId} />;
                }

                let curVideoStreamId = Math.floor(Math.random() * 1000000000);

                return (
                    <div key={userInfo.deviceId}>
                        <VideoSendStream
                            refSocket={refSocket}
                            curDeviceId={curDeviceId}
                            curRoomId={curRoomId}
                            curVideoStreamId={curVideoStreamId}
                            userList={userList}
                            userInfo={userInfo}
                            socketIdLocal={socketIdLocal}
                        />
                    </div>
                );
            })}
        </div>
    );
};

export default VideoSendStreamAll;
