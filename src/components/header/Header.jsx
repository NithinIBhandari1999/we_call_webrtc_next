import Link from 'next/link';

import styles from './css/header.module.scss';

import { useScreenWidth, constantScreenList } from '../../hooks/useScreenWidth';
import { useAtomValue, useSetAtom } from 'jotai';
import { jotaiStateDarkMode } from '../../jotai/states/jotaiStateDarkMode';

import imgIconLightMode from './img/imgIconLightMode.svg';
import imgIconDarkMode from './img/imgIconDarkMode.svg';

const Header = () => {
    const [curScreen] = useScreenWidth();

    const objDarkMode = useAtomValue(jotaiStateDarkMode);
    const setDarkMode = useSetAtom(jotaiStateDarkMode);

    // -----
    // renderFunction
    const renderDarkModeToggle = () => {
        return (
            <div className={styles.s__cBtnDarkModeToggle__containerParent}>
                <div
                    {...objDarkMode}
                    className={styles.s__cBtnDarkModeToggle__container}
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
                    <img
                        {...objDarkMode}
                        src={
                            objDarkMode.darkMode === 'dark'
                                ? imgIconLightMode.src
                                : imgIconDarkMode.src
                        }
                        alt=""
                        className={styles.s__cBtnDarkModeToggle__img}
                    />
                    <div
                        {...objDarkMode}
                        className={styles.s__cBtnDarkModeToggle__txt}
                    >
                        Dark Mode
                    </div>
                </div>
            </div>
        );
    };

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
                <div className={'d-flex'}>
                    {renderDarkModeToggle()}
                    
                    {curScreen.basic === constantScreenList.sm && (
                        <div>Sm</div>
                    )}
                    
                    {curScreen.basic === constantScreenList.lg && (
                        <div>Lg</div>
                    )}
                </div>
            </div>
        </div>
    );
};

export default Header;
