import { atom } from 'jotai';

export const constantDarkModeList = {
    dark: 'dark',
    light: 'light',
};

export const jotaiStateDarkMode = atom({
    darkMode: constantDarkModeList.dark
});