import { useRef, useEffect, useState } from 'react';

import { useDebounce } from 'use-debounce';

import constantSocketActions from '../../../constant/constantSocket/constantSocketActions';

import constantIceServers from '../../../constant/constantIceServers';

const VideoItem = ({
    refSocket,
    socketIdLocal,
    socketIdRemote,
    userInfo,
}) => {
    // -----
    // useStates
    const [answer, setAnswer] = useState({
        answer: '',
        socketIdLocal: '',
        socketIdRemote: '',
        curVideoStreamId: '',
    });
    const [debounceAnswer] = useDebounce(answer, 250);
    const [connectionState, setConnectionState] = useState('');

    const [timer, setTimer] = useState(0);

    // -----
    // useRefs
    const refUseEffect = useRef(true);

    const refPeerConnection = useRef(null);

    const refRemoteStream = useRef(null);

    const refUserRemoteVideo = useRef(null);

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

    useEffect(() => {
        if (debounceAnswer) {
            sendAnswer();
        }
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [debounceAnswer]);

    useEffect(() => {
        let customTimer = setInterval(() => {
            setTimer((timer) => {
                return timer + 1;
            });
        }, 1000);

        return () => {
            clearInterval(customTimer);
        };
    }, []);

    useEffect(() => {
        if (timer % 4 === 0) {
            sendStreamRequest();
        }
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [timer]);

    // -----
    // functions
    const sleep = (ms) => {
        return new Promise((resolve) => {
            setTimeout(resolve, ms);
        });
    };

    const initConnection = async () => {
        try {
            refPeerConnection.current = new RTCPeerConnection({
                configuration: {
                    offerToReceiveAudio: true,
                    offerToReceiveVideo: true,
                },
                constantIceServers,
            });

            refPeerConnection.current.onconnectionstatechange = (e) => {
                console.log('onconnectionstatechange', {
                    e,
                    peerConnection: refPeerConnection.current,
                });

                let tempConnectionState =
                    refPeerConnection?.current?.connectionState;
                if (typeof tempConnectionState === 'string') {
                    setConnectionState(tempConnectionState);
                }
            };

            let peerConnection = refPeerConnection.current;

            refRemoteStream.current = new MediaStream();

            refUserRemoteVideo.current.srcObject = refRemoteStream.current;

            peerConnection.ontrack = (event) => {
                console.log({
                    event,
                });
                event.streams[0].getTracks().forEach((track) => {
                    console.log({ track });
                    refRemoteStream.current.addTrack(track);
                });
            };

            await sleep(100);

            listenConnection();
        } catch (error) {
            console.error(error);
        }
    };

    const listenConnection = () => {
        try {
            let socketObj = refSocket.current;

            sendStreamRequest();

            socketObj.on(constantSocketActions.SEND_OFFER, (args) => {
                try {
                    if (
                        socketIdLocal === args.socketIdLocal &&
                        userInfo.socketId === args.socketIdRemote
                    ) {
                        // valid
                        console.log('Valid SEND_OFFER');
                    } else {
                        // not valid
                        console.log('Invalid SEND_OFFER');
                        return;
                    }

                    let argOffer = args.offer;

                    if (typeof argOffer === 'string') {
                        let argOfferObj = JSON.parse(argOffer);
                        createAnswer({
                            argOfferObj,
                            socketIdLocal: args.socketIdLocal,
                            socketIdRemote: args.socketIdRemote,
                            curVideoStreamId: args.curVideoStreamId,
                        });
                    }
                } catch (error) {
                    console.error(error, 'SEND_OFFER');
                }
            });
        } catch (error) {
            console.error(error);
        }
    };

    const sendStreamRequest = () => {
        try {
            if(connectionState === 'connected'){
                // already connected so dont reestablish
                return;
            }

            let socketObj = refSocket.current;

            socketObj.emit(constantSocketActions.REQUEST_OFFER, {
                socketIdLocal,
                socketIdRemote,
            });
        } catch (error) {
            console.error(error);
        }
    };

    const createAnswer = async ({
        argOfferObj: offer,
        socketIdLocal,
        socketIdRemote,
        curVideoStreamId,
    }) => {
        try {
            let peerConnection = refPeerConnection.current;

            peerConnection.onicecandidate = async (event) => {
                try {
                    //Event that fires off when a new answer ICE candidate is created
                    if (event.candidate) {
                        let jsonLocalDescription = JSON.stringify(
                            peerConnection?.localDescription
                        );

                        console.log(
                            'Type: emit - ',
                            constantSocketActions.SEND_ANSWER
                        );

                        setAnswer({
                            answer: jsonLocalDescription,
                            socketIdLocal,
                            socketIdRemote,
                            curVideoStreamId,
                        });
                    }
                } catch (error) {
                    console.error(error);
                }
            };

            await peerConnection.setRemoteDescription(offer);

            let answer = await peerConnection.createAnswer();
            console.log({
                answer,
            });
            await peerConnection.setLocalDescription(answer);
        } catch (error) {
            console.error(error);
        }
    };

    const sendAnswer = async () => {
        try {
            let socketObj = refSocket.current;

            socketObj.emit(constantSocketActions.SEND_ANSWER, answer);
        } catch (error) {
            console.error(error);
        }
    };

    return (
        <div className="p-2">
            <div className="border p-2">
                <div>
                    <video
                        ref={refUserRemoteVideo}
                        autoPlay
                        playsInline
                        style={{
                            width: '100%',
                            height: '200px',
                            backgroundColor: 'black',
                        }}
                    ></video>
                </div>
            </div>
        </div>
    );
};

export default VideoItem;
