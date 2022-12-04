import Link from 'next/link';

import styles from './css/header.module.scss';

import { useScreenWidth, constantScreenList } from '../../hooks/useScreenWidth';
import { useAtomValue, useSetAtom } from 'jotai';
import { jotaiStateDarkMode } from '../../jotai/states/jotaiStateDarkMode';

const Header = () => {
    const [curScreen] = useScreenWidth();

    const objDarkMode = useAtomValue(jotaiStateDarkMode);
    const setDarkMode = useSetAtom(jotaiStateDarkMode);

    return (
        <div className={styles.s__containerParent} {...objDarkMode}>
            <div className={styles.s__container}>
                <div>
                    <Link
                        {...objDarkMode}
                        href={'/'}
                        className={styles.s__header}
                    >
                        We Call
                    </Link>
                </div>
                <div>
                    <button
                        onClick={() => {
                            if (objDarkMode.darkMode === 'dark') {
                                setDarkMode({
                                    darkMode: 'light',
                                });
                            } else {
                                setDarkMode({
                                    darkMode: 'dark',
                                });
                            }
                        }}
                    >
                        C
                    </button>
                    {curScreen.basic === constantScreenList.sm && (
                        <div>Options Sm</div>
                    )}
                    {curScreen.basic === constantScreenList.lg && (
                        <div>Options Lg</div>
                    )}
                </div>
            </div>
        </div>
    );
};

export default Header;
