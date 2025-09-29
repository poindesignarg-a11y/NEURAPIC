/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
*/
import React from 'react';
import { motion } from 'framer-motion';

// --- Internationalization (copied from App.tsx for consistency) ---
const translations = {
  en: {
    appName: 'NeuraPic',
  },
  es: {
    appName: 'NeuraPic',
  }
};

type TranslationKey = keyof typeof translations.en;

const getLanguage = (): 'en' | 'es' => {
  const lang = navigator.language.split('-')[0];
  return lang === 'es' ? 'es' : 'en';
};

const lang = getLanguage();
const t = (key: TranslationKey): string => {
  // Fallback to English if a key is missing in the current language
  return translations[lang]?.[key] || translations.en[key];
};
// --- End Internationalization ---

interface SplashScreenProps {
    onAnimationComplete: () => void;
}

const SplashScreen: React.FC<SplashScreenProps> = ({ onAnimationComplete }) => {
    return (
        <motion.div
            className="fixed inset-0 bg-gradient-to-br from-stone-50 via-amber-50 to-stone-100 flex flex-col items-center justify-center z-50"
            initial={{ opacity: 1 }}
            exit={{ opacity: 0, transition: { duration: 0.7, ease: 'easeInOut' } }}
        >
            <motion.h1
                className="text-5xl md:text-7xl font-sans font-black text-stone-900 uppercase tracking-widest"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 1.2, ease: [0.22, 1, 0.36, 1], delay: 0.2 }}
                onAnimationComplete={onAnimationComplete}
            >
                {t('appName')}
            </motion.h1>
        </motion.div>
    );
};

export default SplashScreen;