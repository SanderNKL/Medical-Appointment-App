import React from 'react';

const BookingConfirmation = () => {
    return (
        <div className="pt-16 flex justify-center items-center">
            <div className="bg-white shadow-md rounded px-8 pt-6 pb-8 mb-4 w-full max-w-md">
                <h1 className="text-4xl text-center text-green-900 mb-8 pb-4 border-b-2 border-gray-300">Booking Success</h1>
                <p className="text-center text-lg text-green-700 mb-4">Your appointment has been successfully booked!</p>
                <div className="flex justify-center">
                    <a
                        className="bg-green-900 hover:bg-green-800 text-white font-bold py-2 px-4 rounded focus:outline-none focus:shadow-outline"
                        href="/"
                    >
                        Go to Home
                    </a>
                </div>
            </div>
        </div>
    );
};

export default BookingConfirmation;