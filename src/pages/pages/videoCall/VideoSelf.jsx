import { useEffect, useRef } from 'react';

const VideoSelf = () => {
    // -----
    // code
    const refUserLocalVideo = useRef(null);

    // -----
    // useStates

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
    const initConnection = async () => {
        try {
            const localStream = await navigator.mediaDevices.getUserMedia({
                video: true,
                audio: false,
            });

            refUserLocalVideo.current.srcObject = localStream;
        } catch (error) {
            console.error(error);
        }
    };

    return (
        <div className="p-2">
            <div
                className="border p-2"
                style={{
                    width: '200px',
                }}
            >
                <video
                    ref={refUserLocalVideo}
                    autoPlay
                    playsInline
                    style={{
                        width: '100%',
                        height: '200px',
                        backgroundColor: 'black',
                    }}
                ></video>
                <div>You</div>
            </div>
        </div>
    );
};

export default VideoSelf;
