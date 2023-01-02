import { useEffect, useRef } from 'react';

import constantSocketActions from '../../../constant/constantSocket/constantSocketActions';

import constantIceServers from '../../../constant/constantIceServers';

const VideoSendStream = ({ refSocket, localStream, curDeviceId, userList, roomId, deviceId, userInfo }) => {

    // -----
    // code
    

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

                if (typeof argAnswer === 'string') {
                    let argAnswerObj = JSON.parse(argAnswer);
                    addAnswer(argAnswerObj);
                }
            });

        } catch (error) {
            console.error(error);
        }
    };

    const createOffer = async () => {
        const sendOfferToOtherUsers = (offer) => {
            try {
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

                let curUserInfo = userList.filter(user => user.deviceId === curDeviceId);

                socketObj.emit(constantSocketActions.SEND_OFFER, {
                    socketIdLocal: curUserInfo[0].socketId,
                    socketIdRemote: userInfo.socketId,
                    offer: offer,
                });
            } catch (error) {
                console.error(error);
            }
        };

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
                            sendOfferToOtherUsers(
                                JSON.stringify(localDescription)
                            );
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

    const addAnswer = async (answer) => {
        try {
            console.log('STEP: Add answer');

            let peerConnection = refPeerConnection.current;

            if (!peerConnection?.currentRemoteDescription) {
                await peerConnection.setRemoteDescription(answer);
            }
        } catch (error) {
            console.error(error);
        }
    };

    return (
        <div>
            <div>Hello</div>
            <div>
                <div>Room Id: {roomId}</div>
                <div>Device Id: {deviceId}</div>
            </div>
        </div>
    );
};

export default VideoSendStream;
