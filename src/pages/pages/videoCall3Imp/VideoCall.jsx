import { useState, useEffect, useRef } from 'react';
import { useRouter } from 'next/router';
import toast from 'react-hot-toast';

import envKeys from '../../../config/envKeys';

import styles from './css/homepage.module.scss';

import { initSocket } from '../../../config/socket';

import constantSocketActions from '../../../constant/constantSocket/constantSocketActions';

let iceServers = [
    {
        urls: ['stun:stun.l.google.com:19302', 'stun:stun.2.google.com:19302'],
    },
];

const VideoCall = (props) => {
    const router = useRouter();
    const roomId = props.roomId;

    // -----
    // useRefs
    let localStream = useRef(null);
    let remoteStream = useRef(null);

    const refUseEffect = useRef(true);

    const refUser1 = useRef(null);
    const refUser2 = useRef(null);

    const refSocket = useRef(null);

    const refPeerConnection = useRef(null);

    // -----
    // useState
    const [stateCamera, setStateCamera] = useState(true);
    const [stateMic, setStateMic] = useState(false);

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
            if (refUser1 && refUser2) {
                // valid
            } else {
                return;
            }

            refSocket.current = await initSocket();

            await sleep(100);

            // create rtc peer connection
            refPeerConnection.current = new RTCPeerConnection({
                configuration: {
                    offerToReceiveAudio: true,
                    offerToReceiveVideo: true,
                },
                iceServers,
            });

            let peerConnection = refPeerConnection.current;

            // get local stream or get local video
            localStream.current = await navigator.mediaDevices.getUserMedia({
                video: true,
                audio: true,
            });

            // Disable audio
            let audioTrack = localStream.current
                .getTracks()
                .find((track) => track.kind === 'audio');
            if (audioTrack.enabled) {
                audioTrack.enabled = false;
            }

            // set local stream to 1st <video> tag
            refUser1.current.srcObject = localStream.current;

            // create remote stream
            remoteStream = new MediaStream();

            // set remote stream to 2nd <video> tag
            refUser2.current.srcObject = remoteStream;

            //
            localStream.current.getTracks().forEach((track) => {
                peerConnection.addTrack(track, localStream.current);
            });

            peerConnection.ontrack = (event) => {
                event.streams[0].getTracks().forEach((track) => {
                    remoteStream.addTrack(track);
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

            // room joined
            socketObj.emit(constantSocketActions.ROOM_JOINED, {
                roomId: roomId,
            });

            socketObj.on(constantSocketActions.ROOM_JOINED, () => {
                try {
                    console.log(
                        'Event Type: ',
                        constantSocketActions.ROOM_JOINED
                    );

                    createOffer();
                } catch (error) {
                    console.log(error);
                }
            });

            socketObj.on(constantSocketActions.OFFER, (args) => {
                let argOffer = args.offer;

                if (typeof argOffer === 'string') {
                    let argOfferObj = JSON.parse(argOffer);
                    console.log({
                        argOfferObj,
                    });
                    createAnswer(argOfferObj);
                }
            });

            socketObj.on(constantSocketActions.ANSWER, async (args) => {
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

                socketObj.emit(constantSocketActions.OFFER, {
                    roomId: roomId,
                    offer: offer,
                });

                // send by socket io
            } catch (error) {
                console.error(error);
            }
        };

        try {
            console.log('Creating Offer');

            let peerConnection = refPeerConnection.current;
            console.log(refPeerConnection.current);

            console.log(12345);

            // -----
            // step 2
            // create offer
            peerConnection.onicecandidate = async (event) => {
                try {
                    console.log({ e211: event });

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
                    console.log(error);
                }
            };

            // create an offer
            console.log(1234);

            const offer = await peerConnection.createOffer();
            console.log(offer);
            await peerConnection.setLocalDescription(offer);
        } catch (error) {
            console.error(error);
        }
    };

    const createAnswer = async (offer) => {
        try {
            let socketObj = refSocket.current;

            let peerConnection = refPeerConnection.current;

            peerConnection.onicecandidate = async (event) => {
                //Event that fires off when a new answer ICE candidate is created
                if (event.candidate) {
                    let jsonLocalDescription = JSON.stringify(
                        peerConnection?.localDescription
                    );

                    socketObj.emit(constantSocketActions.ANSWER, {
                        roomId: roomId,
                        answer: jsonLocalDescription,
                    });
                }
            };

            await peerConnection.setRemoteDescription(offer);

            let answer = await peerConnection.createAnswer();
            await peerConnection.setLocalDescription(answer);
        } catch (error) {
            console.error(error);
        }
    };

    const addAnswer = async (answer) => {
        try {
            let peerConnection = refPeerConnection.current;

            if (!peerConnection?.currentRemoteDescription) {
                await peerConnection.setRemoteDescription(answer);
            }
        } catch (error) {
            console.error(error);
        }
    };

    const toggleCamera = async () => {
        try {
            let videoTrack = localStream.current
                .getTracks()
                .find((track) => track.kind === 'video');

            if (videoTrack.enabled) {
                videoTrack.enabled = false;
                setStateCamera(false);
            } else {
                videoTrack.enabled = true;
                setStateCamera(true);
            }
        } catch (error) {
            console.error(error);
        }
    };

    const toggleMic = async () => {
        try {
            let audioTrack = localStream.current
                .getTracks()
                .find((track) => track.kind === 'audio');

            if (audioTrack.enabled) {
                audioTrack.enabled = false;
                setStateMic(false);
            } else {
                audioTrack.enabled = true;
                setStateMic(true);
            }
        } catch (error) {
            console.error(error);
        }
    };

    const copyLink = async () => {
        try {
            let link = `${envKeys.FRONTEND_URL}/call/${roomId}`;
            await navigator.clipboard.writeText(link);

            toast.success('Link Copied to clipboard');
        } catch (error) {
            console.error(error);
        }
    };

    const exitVideoCallRoom = () => {
        try {
            // close peer connection
            let peerConnection = refPeerConnection.current;
            peerConnection.close();

            // stop tracks
            localStream.current.getTracks().forEach(function (track) {
                track.stop();
            });

            let socketObj = refSocket.current;
            socketObj.disconnect();

            router.push('/');
        } catch (error) {
            console.error(error);
            router.push('/');
        }
    };

    // -----
    // renderFunctions
    const renderButtons = () => {
        return (
            <div>
                <div className={'py-3'}>
                    <button
                        className={'btn btn-primary rounded-0 me-2'}
                        onClick={() => {
                            toggleCamera();
                        }}
                    >
                        {stateCamera ? 'Stop ' : 'Start '}
                        Camera
                    </button>
                    <button
                        className={'btn btn-primary rounded-0 me-2'}
                        onClick={() => {
                            toggleMic();
                        }}
                    >
                        {stateMic ? 'Stop ' : 'Start '} Mic
                    </button>
                    <button
                        className={'btn btn-primary rounded-0 me-2'}
                        onClick={() => {
                            copyLink();
                        }}
                    >
                        Copy Link
                    </button>
                    <button
                        className={'btn btn-danger rounded-0 me-2'}
                        onClick={() => exitVideoCallRoom()}
                    >
                        Quit
                    </button>
                </div>
            </div>
        );
    };

    return (
        <div>
            <div className="container py-5">
                <h1>Homepage - {roomId}</h1>

                {/* p */}
                <div>
                    User lists
                </div>

                <div className="row">
                    <div className="col-12 col-lg-6">
                        <div>User 1</div>
                        <video
                            ref={refUser1}
                            className={styles.s__video1__container}
                            autoPlay
                            playsInline
                        ></video>
                    </div>
                    <div className="col-12 col-lg-6">
                        <div>User 2</div>
                        <video
                            ref={refUser2}
                            className={styles.s__video1__container}
                            autoPlay
                            playsInline
                        ></video>
                    </div>
                </div>

                {renderButtons()}
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
