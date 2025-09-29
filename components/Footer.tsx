/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
*/
import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

const REMIX_IDEAS = [
    "to try different hairstyles.",
    "to turn your pet into a cartoon character.",
    "to create a fantasy version of yourself.",
    "to design a superhero based on your photo.",
    "to place yourself in famous historical events.",
    "to generate a custom video game avatar.",
];

const Footer = () => {
    const [index, setIndex] = useState(0);

    useEffect(() => {
        const intervalId = setInterval(() => {
            setIndex(prevIndex => (prevIndex + 1) % REMIX_IDEAS.length);
        }, 3500); // Change text every 3.5 seconds

        return () => clearInterval(intervalId);
    }, []);

    return (
        <footer className="fixed bottom-0 left-0 right-0 bg-stone-100/80 backdrop-blur-sm p-3 z-50 text-stone-600 text-xs sm:text-sm border-t border-stone-200">
            <div className="max-w-screen-xl mx-auto flex justify-between items-center gap-4 px-4">
                {/* Left Side */}
                <div className="hidden md:flex items-center gap-4 text-stone-500 whitespace-nowrap">
                    {/* FIX: Simplified the "Powered by" text for better UX. */}
                    <p>Powered by Gemini</p>
                    <span className="text-stone-400" aria-hidden="true">|</span>
                    <p>
                        Created by{' '}
                        <a
                            href="https://www.instagram.com/jaycamelmusic"
                            target="_blank"
                            rel="noopener noreferrer"
                            className="text-stone-600 hover:text-amber-600 transition-colors duration-200"
                        >
                            JayCamel
                        </a>
                    </p>
                </div>

                {/* Right Side */}
                <div className="flex-grow flex justify-end items-center gap-4 sm:gap-6">
                    <div className="hidden lg:flex items-center gap-2 text-stone-500 text-right min-w-0">
                        <span className="flex-shrink-0">Remix this app...</span>
                        <div className="relative w-64 h-5">
                            <AnimatePresence mode="wait">
                                <motion.span
                                    key={index}
                                    initial={{ opacity: 0, y: 10 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    exit={{ opacity: 0, y: -10 }}
                                    transition={{ duration: 0.4, ease: "easeInOut" }}
                                    className="absolute inset-0 font-medium text-stone-700 whitespace-nowrap text-left"
                                >
                                    {REMIX_IDEAS[index]}
                                </motion.span>
                            </AnimatePresence>
                        </div>
                    </div>
                </div>
            </div>
        </footer>
    );
};

export default Footer;