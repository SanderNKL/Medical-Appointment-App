import React from 'react';

const ErrorMessage: React.FC<{ error: string }> = ({ error }) => {
    return (
        <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded relative" role="alert">
            <strong className="font-bold">ERROR </strong>
            <span className="block sm:inline">{error}</span>
        </div>
    );
}

export default ErrorMessage;