import { Fragment } from 'react';
import { Toaster } from 'react-hot-toast';
import { Provider } from 'jotai';

import '../src/assets/css/globals.scss';
import 'bootstrap/dist/css/bootstrap.min.css';

import Header from '../src/components/header/Header';

const MyApp = ({ Component, pageProps }) => {
    return (
        <Fragment>
            <Provider>
                <div>
                    <Header />
                    <Toaster position="top-right" />
                    <Component {...pageProps} />
                </div>
            </Provider>
        </Fragment>
    );
};

export default MyApp;
