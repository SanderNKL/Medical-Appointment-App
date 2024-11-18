import React from 'react';

import Loading from '@/components/Loading';

const UnavailableMessage = () => {
    return (
        <div className="flex flex-col justify-center items-center min-h-screen">
            <h2 className="text-2xl text-center text-red-600 mb-4">This time and date is no longer available. Redirecting you back...</h2>
            <Loading />
        </div>
    );
};

export default UnavailableMessage;