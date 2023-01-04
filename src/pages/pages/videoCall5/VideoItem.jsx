import { useRef, useEffect, useState } from 'react';

import { useDebounce } from 'use-debounce';

import constantSocketActions from '../../../constant/constantSocket/constantSocketActions';

import constantIceServers from '../../../constant/constantIceServers';

const VideoItem = ({ refSocket, curRoomId, curDeviceId }) => {
    // -----
    // useStates
    const [answer, setAnswer] = useState(null);
    const [debounceAnswer] = useDebounce(answer, 250);

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

            let peerConnection = refPeerConnection.current;

            refRemoteStream.current = new MediaStream();

            refUserRemoteVideo.current.srcObject = refRemoteStream.current;

            console.log(refUserRemoteVideo);

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

            socketObj.on(constantSocketActions.SEND_OFFER, (args) => {
                console.log('on: ', constantSocketActions.SEND_OFFER);
                let argOffer = args.offer;

                if (typeof argOffer === 'string') {
                    console.log(args);
                    let argOfferObj = JSON.parse(argOffer);
                    createAnswer({
                        argOfferObj,
                        socketIdLocal: args.socketIdLocal,
                        socketIdRemote: args.socketIdRemote,
                        curVideoStreamId: args.curVideoStreamId,
                    });
                }
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
                <div>Current Room Id: {curRoomId}</div>
                <div>Current Device Id: {curDeviceId}</div>

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
