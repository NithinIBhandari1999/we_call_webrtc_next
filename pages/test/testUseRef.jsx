import { useRef } from 'react';

const Test = () => {
    const usersListUseRef = useRef('helo');

    return (
        <div>
            <h1>Test Use Ref</h1>
            <div>
                {usersListUseRef.current}

                
            </div>
        </div>
    );
};

export default Test;


/*

Users
1 - 
    User 1 will send the stream to all other 2,3,4
2 - 
3 - 
4 - 

*/