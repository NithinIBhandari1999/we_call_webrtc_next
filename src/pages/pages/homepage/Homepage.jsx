import Link from 'next/link';
import { useAtomValue } from 'jotai';

import {
    jotaiStateDarkMode,
} from '../../../jotai/states/jotaiStateDarkMode';

import styles from './css/homepage.module.scss';

import imgVideoCallAdd from './img/imgVideoCallAdd.svg';

const Homepage = () => {
    const objDarkMode = useAtomValue(jotaiStateDarkMode);

    const getRandomNumber = () => {
        return Math.floor(Math.random() * 1000000000);
    };
    
    return (
        <div className={styles.s__container} {...objDarkMode}>
            <div className="container py-5 text-center">
                <h1 className={styles.s__heading} {...objDarkMode}>
                    We Call
                </h1>

                <p className={styles.s__pInfo} {...objDarkMode}>
                    A secure, free video call service is a great way to keep in
                    touch with your friends and family. You can use it to make
                    video calls to anyone in the world, and it&apos;s a great
                    way to stay connected with your loved ones.
                </p>

                <div className={styles.s__cBtnCallNow__containerParent}>
                    <Link
                        href={`/call/${getRandomNumber()}`}
                        className={styles.s__cBtnCallNow__containerLink}
                    >
                        <div
                            className={styles.s__cBtnCallNow__container}
                            {...objDarkMode}
                        >
                            <img
                                src={imgVideoCallAdd.src}
                                alt="Video Call Now"
                                className={styles.s__cBtnCallNow__imgIcon}
                                {...objDarkMode}
                            />
                            <div
                                className={styles.s__cBtnCallNow__txt}
                                {...objDarkMode}
                            >
                                Call Now
                            </div>
                        </div>
                    </Link>
                </div>
            </div>
        </div>
    );
};

/*
Steps:
1. Create Offer -> Then send connection to other users.
2. Listen connection -> Get offer from other user -> Create answer -> send to other user -> 
*/

export default Homepage;
