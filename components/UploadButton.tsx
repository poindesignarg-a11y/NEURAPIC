/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
*/
import React from 'react';

interface UploadButtonProps {
    caption: string;
}

const UploadButton: React.FC<UploadButtonProps> = ({ caption }) => {
    return (
        <div className="
            w-64 h-64 sm:w-80 sm:h-80
            bg-white/70 backdrop-blur-sm 
            rounded-3xl
            shadow-lg hover:shadow-2xl
            border border-stone-200/50
            flex flex-col items-center justify-center 
            text-stone-500
            cursor-pointer 
            group-hover:text-amber-600
            transition-all duration-300 ease-in-out
            transform group-hover:scale-105
        ">
            <svg xmlns="http://www.w3.org/2000/svg" className="h-16 w-16 sm:h-20 sm:w-20 mb-4 text-stone-400 group-hover:text-amber-500 transition-colors duration-300" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M12 4.5v15m7.5-7.5h-15" />
            </svg>
            <span className="font-bold text-2xl sm:text-3xl text-center px-4">{caption}</span>
        </div>
    );
};

export default UploadButton;