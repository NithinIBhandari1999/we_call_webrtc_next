import { useState, useEffect, useRef, Fragment } from 'react';

import { initSocket } from '../../../config/socket';

import constantSocketActions from '../../../constant/constantSocket/constantSocketActions';

import VideoItem from './VideoItem';
import VideoSendStream from './VideoSendStream';

const VideoCall = (props) => {
    const roomId = props.roomId;
    const deviceId = props.deviceId;

    // -----
    // useRefs
    const refUseEffect = useRef(true);

    const refSocket = useRef(null);

    const [userList, setUserList] = useState([]);

    const [localStream, setLocalStream] = useState(null);

    // -----
    // useState

    // -----
    // useEffects
    useEffect(() => {
        if (refUseEffect.current) {
            initConnection();
        }

        return () => {
            refUseEffect.current = false;

            let socketObj = refSocket.current;
            if (socketObj) {
                socketObj?.disconnect();
            }
        };
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, []);

    // -----
    // functions
    const sleep = (ms) => {
        return new Promise((resolve) => {
            setTimeout(resolve, ms);
        });
    };

    const initConnection = async () => {
        try {
            refSocket.current = await initSocket();

            await sleep(100);

            // create local stream
            const tempLocalStream = await navigator.mediaDevices.getUserMedia({
                video: true,
                audio: true,
            });
            setLocalStream(tempLocalStream);
            
            await sleep(100);
            
            listenConnection();
        } catch (error) {
            console.error(error);
        }
    };

    const listenConnection = () => {
        try {
            let socketObj = refSocket.current;

            // room joined
            socketObj.emit(constantSocketActions.SERVER_ROOM_JOINED, {
                roomId: roomId,
                deviceId: deviceId,
            });

            socketObj.on(
                constantSocketActions.CLIENT_ROOM_JOINED_BRODCAST,
                async (payload) => {
                    try {
                        console.log(payload);

                        setUserList([]);

                        sleep(100);

                        setUserList(payload.userList);
                    } catch (error) {
                        console.log(error);
                    }
                }
            );
        } catch (error) {
            console.error(error);
        }
    };

    // -----
    // renderFunctions

    return (
        <div>
            <div className="container py-5">
                <h1>Homepage - {roomId}</h1>

                {/* p */}
                <div>
                    User lists:
                    <div>{userList.length}</div>
                    <pre>{JSON.stringify(userList, null, 2)}</pre>
                </div>
                
                {userList.map((user) => {
                    if (user.deviceId === deviceId) {
                        return <Fragment key={user.deviceId} />;
                    }

                    return (
                        <div
                            className="col-12 col-md-4 col-lg-3"
                            key={user.deviceId}
                        >
                            <VideoSendStream
                                refSocket={refSocket}

                                userList={userList}
                                curDeviceId={deviceId}

                                localStream={localStream}
                                roomId={roomId}
                                deviceId={deviceId}
                                userInfo={user}
                            />
                        </div>
                    );
                })}

                <div className="row">
                    {userList.map((user) => {
                        if (user.deviceId === deviceId) {
                            return <Fragment key={user.deviceId} />;
                        }

                        return (
                            <div
                                className="col-12 col-md-4 col-lg-3"
                                key={user.deviceId}
                            >
                                <VideoItem
                                    refSocket={refSocket}

                                    roomId={roomId}
                                    deviceId={user.deviceId}
                                />
                            </div>
                        );
                    })}
                </div>
            </div>
        </div>
    );
};

/*
Steps:
1. Listen connection User Add -> Call Create Offer -> Then send connection to other users.
2. Listen connection Offer received -> Get offer from other user -> Create answer -> send to other user -> 
3. Listen Answer -> Add answer
*/

export default VideoCall;
