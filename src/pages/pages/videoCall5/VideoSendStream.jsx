import { useEffect, useRef, useState } from 'react';

import constantSocketActions from '../../../constant/constantSocket/constantSocketActions';

import constantIceServers from '../../../constant/constantIceServers';
import { useDebounce } from 'use-debounce';

const VideoSendStream = ({
    refSocket,
    curDeviceId,
    curRoomId,
    curVideoStreamId,
    userList,
    userInfo,
}) => {
    // -----
    // code
    const refUserLocalVideo = useRef(null);

    // -----
    // useStates
    const [offerString, setOfferString] = useState('');
    const [debounceOfferString] = useDebounce(offerString, 250);

    // -----
    // useRefs
    const refPeerConnection = useRef(null);

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

    useEffect(() => {
        sendOfferToOtherUsers();
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [debounceOfferString]);

    // -----
    // functions
    const sleep = (ms) => {
        return new Promise((resolve) => {
            setTimeout(resolve, ms);
        });
    };

    const initConnection = async () => {
        try {
            // create rtc peer connection
            refPeerConnection.current = new RTCPeerConnection({
                configuration: {
                    offerToReceiveAudio: true,
                    offerToReceiveVideo: true,
                },
                constantIceServers,
            });

            let peerConnection = refPeerConnection.current;

            const localStream = await navigator.mediaDevices.getUserMedia({
                video: true,
                audio: false,
            });

            refUserLocalVideo.current.srcObject = localStream;

            localStream.getTracks().forEach((track) => {
                peerConnection.addTrack(track, localStream);
            });

            await sleep(100);

            listenConnection();
        } catch (error) {
            console.error(error);
        }
    };

    const listenConnection = () => {
        try {
            createOffer();

            let socketObj = refSocket.current;

            socketObj.on(constantSocketActions.SEND_ANSWER, async (args) => {
                console.log('on: ', constantSocketActions.SEND_ANSWER);

                let argAnswer = args.answer;
                let tempCurVideoStreamId = args.curVideoStreamId;

                if (typeof argAnswer === 'string') {
                    let argAnswerObj = JSON.parse(argAnswer);
                    addAnswer(argAnswerObj, tempCurVideoStreamId);
                }
            });
        } catch (error) {
            console.error(error);
        }
    };

    const createOffer = async () => {
        try {
            console.log('Creating Offer');

            let peerConnection = refPeerConnection.current;

            // -----
            // step 2
            // create offer
            peerConnection.onicecandidate = async (event) => {
                try {
                    // Event that fires off when a new offer ICE candidate is created
                    if (event?.candidate) {
                        let localDescription = peerConnection.localDescription;

                        if (localDescription) {
                            setOfferString(JSON.stringify(localDescription));
                        }
                    }
                } catch (error) {
                    console.error(error);
                }
            };

            // create an offer

            const offer = await peerConnection.createOffer();
            await peerConnection.setLocalDescription(offer);
        } catch (error) {
            console.error(error);
        }
    };

    const sendOfferToOtherUsers = () => {
        try {
            let offer = debounceOfferString;
            console.log('Send Offer To Other Users');

            let socketObj = refSocket.current;

            if (!socketObj) {
                console.error('Not sending offer as socketObj is null.');
                return;
            }

            if (typeof offer === 'string' && offer !== '') {
                // valid
            } else {
                console.error(
                    'Not sending request as offer is empty. Offer=',
                    offer
                );
                return;
            }

            if (offer.length < 100) {
                console.error(
                    'Not sending offer as offer length is less than 100. Offer=',
                    offer
                );
                return;
            }

            // curDeviceId, userList;

            let curUserInfo = userList.filter(
                (user) => user.deviceId === curDeviceId
            );

            socketObj.emit(constantSocketActions.SEND_OFFER, {
                socketIdLocal: curUserInfo[0].socketId,
                socketIdRemote: userInfo.socketId,
                curVideoStreamId,
                offer: offer,
            });
        } catch (error) {
            console.error(error);
        }
    };

    const addAnswer = async (answer, tempCurVideoStreamId) => {
        try {
            console.log('STEP: Add answer');
            if(tempCurVideoStreamId !== curVideoStreamId) {
                // not valid
                console.log('add answer not equal: ', {
                    tempCurVideoStreamId,
                    curVideoStreamId
                });
                return;
            } else {
                console.log('add answer equal: ', {
                    tempCurVideoStreamId,
                    curVideoStreamId
                });
            }

            let peerConnection = refPeerConnection.current;

            if (!peerConnection?.currentRemoteDescription) {
                await peerConnection.setRemoteDescription(answer);
            }
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
                    <div>Current Video Stream Id: {curVideoStreamId}</div>
                    <div>Offer String: {offerString.length}</div>
                </div>

                <div>
                    <video
                        ref={refUserLocalVideo}
                        autoPlay
                        playsInline
                        style={{
                            width: '100%',
                            height: '200px',
                            backgroundColor: 'black'
                        }}
                    ></video>
                    <button
                        className="btn btn-primary"
                        onClick={() => createOffer()}
                    >
                        Send Offer
                    </button>
                </div>
            </div>
        </div>
    );
};

export default VideoSendStream;
