import { Fragment, useEffect, useRef, useState } from 'react';

import constantSocketActions from '../../../constant/constantSocket/constantSocketActions';

import constantIceServers from '../../../constant/constantIceServers';
import { useDebounce } from 'use-debounce';

const VideoSendStream = ({
    refSocket,
    socketIdLocal,
    curVideoStreamId,
    userInfo,
}) => {
    // -----
    // code

    // -----
    // useStates
    const [sendOfferCallFunc, setSendOfferCallFunc] = useState({
        randomNum: '',
        socketIdLocal: '',
        socketIdRemote: '',
    });
    const [debounceSendOfferCallFunc] = useDebounce(sendOfferCallFunc, 250);

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
        createOffer();
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [debounceSendOfferCallFunc]);

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

            console.log({
                peerConnection,
            });

            const localStream = await navigator.mediaDevices.getUserMedia({
                video: true,
                audio: false,
            });

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
            let socketObj = refSocket.current;

            socketObj.on(constantSocketActions.REQUEST_OFFER, async (args) => {
                try {
                    console.log(constantSocketActions.REQUEST_OFFER, {
                        args,
                        socketIdLocal,
                        r: socketIdLocal === args.socketIdRemote,
                    });

                    if (
                        socketIdLocal === args.socketIdRemote &&
                        userInfo.socketId === args.socketIdLocal
                    ) {
                        // valid
                    } else {
                        // not valid
                        console.log('Invalid REQUEST OFFER');
                        return;
                    }

                    let randomNum = Math.floor(Math.random() * 1000000000);
                    setSendOfferCallFunc({
                        randomNum: `${randomNum}`,
                        socketIdLocal: args.socketIdLocal,
                        socketIdRemote: args.socketIdRemote,
                    });
                } catch (error) {
                    console.error(error);
                }
            });

            socketObj.on(constantSocketActions.SEND_ANSWER, async (args) => {
                try {
                    console.log('on: ', constantSocketActions.SEND_ANSWER);

                    let argAnswer = args.answer;
                    let tempCurVideoStreamId = args.curVideoStreamId;

                    if (typeof argAnswer === 'string') {
                        let argAnswerObj = JSON.parse(argAnswer);
                        addAnswer({
                            answer: argAnswerObj,
                            socketIdLocal: args.socketIdLocal,
                            socketIdRemote: args.socketIdRemote,
                            curVideoStreamId: args.curVideoStreamId,
                        });
                    }
                } catch (error) {
                    console.error(error);
                }
            });
        } catch (error) {
            console.error(error);
        }
    };

    const createOffer = async () => {
        try {
            let peerConnection = refPeerConnection.current;

            if (
                socketIdLocal === debounceSendOfferCallFunc.socketIdRemote &&
                userInfo.socketId === debounceSendOfferCallFunc.socketIdLocal
            ) {
                // valid
            } else {
                // not valid
                console.log('Invalid CREATE OFFER');
                return;
            }

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
            let tempPayload = debounceSendOfferCallFunc;

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

            socketObj.emit(constantSocketActions.SEND_OFFER, {
                socketIdLocal: tempPayload.socketIdLocal,
                socketIdRemote: tempPayload.socketIdRemote,

                curVideoStreamId,
                offer: offer,
            });
        } catch (error) {
            console.error(error);
        }
    };

    const addAnswer = async (args) => {
        try {
            if (
                socketIdLocal === args.socketIdRemote &&
                userInfo.socketId === args.socketIdLocal
            ) {
                // valid
            } else {
                // not valid
                console.log('Invalid REQUEST OFFER');
                return;
            }

            let peerConnection = refPeerConnection.current;

            if (!peerConnection?.currentRemoteDescription) {
                await peerConnection.setRemoteDescription(args.answer);
            }
        } catch (error) {
            console.error(error);
        }
    };

    return <Fragment />;
};

export default VideoSendStream;
