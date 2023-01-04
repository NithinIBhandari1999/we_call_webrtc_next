import { useEffect, useRef, useState, Fragment } from 'react';

import constantSocketActions from '../../../constant/constantSocket/constantSocketActions';

import constantIceServers from '../../../constant/constantIceServers';
import { useDebounce } from 'use-debounce';

import VideoSendStream from './VideoSendStream';

const VideoSendStreamAll = ({
    refSocket,
    curDeviceId,
    curRoomId,
    userList,
}) => {
    // -----
    // code

    // -----
    // useStates
    const [socketSendAnswerList, setSocketSetAnswerList] = useState([]);

    // -----
    // useRefs
    const refUseEffect = useRef(true);

    // -----
    // useEffects
    useEffect(() => {
        if (refUseEffect.current) {
            initConnection();
        }

        return () => {
            refUseEffect.current = false;
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
            listenConnection();
        } catch (error) {
            console.error(error);
        }
    };

    const listenConnection = async () => {
        try {
            // let socketObj = refSocket.current;

            // socketObj.on(constantSocketActions.SEND_ANSWER, async (args) => {
            //     try {
            //         setSocketSetAnswerList((prevSocketSetAnswerList) => {
            //             return [...prevSocketSetAnswerList, args];
            //         });
            //     } catch (error) {
            //         console.error(error);
            //     }
            // });
        } catch (error) {
            console.error(error);
        }
    };

    return (
        <div className="p-3">
            <div className="p-3 border">
                <div>Send Video Stream</div>
                <div>
                    <div>Current Room Id: {curRoomId}</div>
                    <div>Current Device Id: {curDeviceId}</div>
                    <div>User List: {JSON.stringify(userList)}</div>
                    <div>
                        {/* Socker Answer: {JSON.stringify(socketSendAnswerList)} */}
                    </div>
                    <div>
                        Socker Answer Len: {socketSendAnswerList.length}
                    </div>
                </div>

                {userList.map((userInfo) => {
                    if (userInfo.deviceId === curDeviceId) {
                        return <Fragment key={userInfo.deviceId} />;
                    }

                    let curVideoStreamId = Math.floor(Math.random() * 1000000000);

                    return (
                        <div
                            className="col-12 col-md-6 col-lg-4"
                            key={userInfo.deviceId}
                        >
                            <VideoSendStream
                                refSocket={refSocket}
                                curDeviceId={curDeviceId}
                                curRoomId={curRoomId}
                                curVideoStreamId={curVideoStreamId}
                                userList={userList}
                                userInfo={userInfo}
                            />
                        </div>
                    );
                })}
            </div>
        </div>
    );
};

export default VideoSendStreamAll;
