import React from 'react';

interface Props {
    link: string;
}

const BackButton: React.FC<Props> = ({ link }) => {  return (
    <div>
        <a href={`${link}`} className=" text-center text-green-700 mb-4 block">
            &lt; Go Back
        </a>
    </div>
  );
}

export default BackButton;