import { useState, useEffect, useRef, Fragment } from 'react';

import { initSocket } from '../../../config/socket';

import constantSocketActions from '../../../constant/constantSocket/constantSocketActions';

import VideoItem from './VideoItem';
import VideoSendStreamAll from './VideoSendStreamAll';
import VideoSelf from './VideoSelf';

const VideoCall = (props) => {
    const curRoomId = props.curRoomId;
    const curDeviceId = props.curDeviceId;

    // -----
    // useRefs
    const refUseEffect = useRef(true);

    const refSocket = useRef(null);

    const [userList, setUserList] = useState([]);

    const [localStream, setLocalStream] = useState(null);

    const [curSocketId, setCurSocketId] = useState('');

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

            await sleep(1000);

            let tempSocketId = refSocket.current?.id;
            if (typeof tempSocketId === 'string') {
                setCurSocketId(tempSocketId);
            }

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
                roomId: curRoomId,
                deviceId: curDeviceId,
            });

            socketObj.on(
                constantSocketActions.CLIENT_ROOM_JOINED_BRODCAST,
                async (payload) => {
                    try {
                        console.log(payload);

                        setUserList([]);

                        sleep(1000);

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
    const renderVideoList = () => {
        return (
            <div>
                {curSocketId !== '' && (
                    <div className="row">
                        {userList.map((userInfo) => {
                            if (userInfo.deviceId === curDeviceId) {
                                return <Fragment key={userInfo.deviceId} />;
                            }

                            return (
                                <div
                                    className="col-4 col-md-4 col-lg-4"
                                    key={userInfo.deviceId}
                                >
                                    <VideoItem
                                        refSocket={refSocket}
                                        curRoomId={curRoomId}
                                        curSocketId={curSocketId}
                                        curDeviceId={curDeviceId}
                                        socketIdLocal={curSocketId}
                                        socketIdRemote={userInfo.socketId}
                                        userInfo={userInfo}
                                    />
                                </div>
                            );
                        })}
                    </div>
                )}       
            </div>
        )
    }

    return (
        <div>
            <div className="container py-5">
                {curSocketId !== '' && (
                    <div>
                        {refSocket && userList.length > 1 && (
                            <VideoSendStreamAll
                                refSocket={refSocket}
                                userList={userList}
                                localStream={localStream}
                                curDeviceId={curDeviceId}
                                curRoomId={curRoomId}
                                socketIdLocal={curSocketId}
                            />
                        )}
                    </div>
                )}

                <div>
                    <div className="row">
                        <div className="col-12 col-md-8">
                            {renderVideoList()}
                        </div>
                        <div className="col-12 col-md-4">
                            <VideoSelf />
                        </div>
                    </div>
                </div>
                
                <div>
                    
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
