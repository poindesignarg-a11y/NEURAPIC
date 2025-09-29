/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
*/
import React, { useState, ChangeEvent, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { generateImage } from './services/geminiService';
import PolaroidCard from './components/PolaroidCard';
import Footer from './components/Footer';
import UploadButton from './components/UploadButton';
import SplashScreen from './components/SplashScreen';

// --- Internationalization ---
const translations = {
  en: {
    appName: 'NeuraPic',
    appSubtitle: 'Generate yourself through time and space.',
    uploadCaption: 'Upload Source Photos',
    startJourney: 'Click the box above to upload your photos and start your journey.',
    yourSourcePhotos: 'Your Source Photos',
    uploadMultiple: 'Upload multiple images to blend features or styles.',
    addMorePhotos: '+ Add More Photos',
    describeFinalImage: 'Describe the final image',
    promptPlaceholder: 'e.g., as astronauts on the moon, in a vibrant cyberpunk city...',
    startOver: 'Start Over',
    generate: 'Generate',
    generating: 'Generating your masterpiece...',
    generatingSimple: 'Generating...',
    yourCreation: 'Your Creation',
    generateAgain: 'Generate Again',
  },
  es: {
    appName: 'NeuraPic',
    appSubtitle: 'Genérate a ti mismo a través del tiempo y el espacio.',
    uploadCaption: 'Sube Fotos de Origen',
    startJourney: 'Haz clic en el recuadro para subir tus fotos y comenzar tu viaje.',
    yourSourcePhotos: 'Tus Fotos de Origen',
    uploadMultiple: 'Sube múltiples imágenes para mezclar rasgos o estilos.',
    addMorePhotos: '+ Añadir Más Fotos',
    describeFinalImage: 'Describe la imagen final',
    promptPlaceholder: 'ej: como astronautas en la luna, en una vibrante ciudad cyberpunk...',
    startOver: 'Empezar de Nuevo',
    generate: 'Generar',
    generating: 'Generando tu obra maestra...',
    generatingSimple: 'Generando...',
    yourCreation: 'Tu Creación',
    generateAgain: 'Generar de Nuevo',
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

type ImageStatus = 'pending' | 'done' | 'error';
interface GeneratedImage {
    status: ImageStatus;
    url?: string;
    error?: string;
}

const primaryButtonClasses = "font-sans font-bold text-lg text-center text-white bg-amber-500 py-3 px-8 rounded-md transform transition-all duration-300 ease-in-out hover:scale-105 hover:-rotate-2 hover:bg-amber-600 shadow-lg hover:shadow-xl";
const secondaryButtonClasses = "font-sans font-bold text-lg text-center text-stone-600 bg-transparent border-2 border-stone-400 py-3 px-8 rounded-md transform transition-all duration-300 ease-in-out hover:scale-105 hover:rotate-2 hover:bg-stone-200 hover:text-stone-800";


const useMediaQuery = (query: string) => {
    const [matches, setMatches] = useState(false);
    useEffect(() => {
        const media = window.matchMedia(query);
        if (media.matches !== matches) {
            setMatches(media.matches);
        }
        const listener = () => setMatches(media.matches);
        window.addEventListener('resize', listener);
        return () => window.removeEventListener('resize', listener);
    }, [matches, query]);
    return matches;
};

interface PhotoGalleryProps {
    images: string[];
    onRemove?: (index: number) => void;
    className?: string;
}

const PhotoGallery: React.FC<PhotoGalleryProps> = ({ images, onRemove, className = '' }) => (
    <div className={`w-full max-w-2xl p-2 bg-stone-200/50 rounded-lg border border-stone-300/50 backdrop-blur-sm ${className}`}>
        <div className="flex items-center gap-3 overflow-x-auto pb-2">
            {images.map((img, index) => (
                <div key={index} className="relative w-20 h-20 flex-shrink-0 group">
                    <div className="w-full h-full rounded-md overflow-hidden ring-1 ring-stone-300/50">
                        <img src={img} alt={`Uploaded thumbnail ${index + 1}`} className="w-full h-full object-cover" />
                    </div>
                    {onRemove && (
                         <button
                            onClick={() => onRemove(index)}
                            aria-label={`Remove photo ${index + 1}`}
                            className="absolute -top-1.5 -right-1.5 w-5 h-5 bg-red-600 rounded-full text-white flex items-center justify-center text-xs font-bold ring-2 ring-white/50 hover:bg-red-700 transition-all opacity-0 group-hover:opacity-100 scale-75 group-hover:scale-100"
                         >
                            &times;
                         </button>
                    )}
                </div>
            ))}
        </div>
    </div>
);


function App() {
    const [uploadedImages, setUploadedImages] = useState<string[]>([]);
    const [userPrompt, setUserPrompt] = useState<string>('');
    const [generatedImage, setGeneratedImage] = useState<GeneratedImage | null>(null);
    const [isLoading, setIsLoading] = useState<boolean>(false);
    const [appState, setAppState] = useState<'idle' | 'photos-selected' | 'generating' | 'results-shown'>('idle');
    const [showSplash, setShowSplash] = useState(true);
    const isMobile = useMediaQuery('(max-width: 768px)');


    const handleImageUpload = (e: ChangeEvent<HTMLInputElement>) => {
        if (e.target.files && e.target.files.length > 0) {
            const files = Array.from(e.target.files);
            // FIX: Explicitly type `file` as `File` to avoid potential type inference issues.
            const imagePromises = files.map((file: File) => {
                return new Promise<string>((resolve, reject) => {
                    const reader = new FileReader();
                    reader.onloadend = () => resolve(reader.result as string);
                    reader.onerror = reject;
                    reader.readAsDataURL(file);
                });
            });

            Promise.all(imagePromises).then(base64Images => {
                setUploadedImages(prevImages => [...prevImages, ...base64Images]);
                setAppState('photos-selected');
                setGeneratedImage(null); // Clear previous results
            }).catch(error => {
                console.error("Error reading files:", error);
                alert("Sorry, there was an error processing your photos. Please try again.");
            });

            // Reset the input value to allow re-uploading the same files
            e.target.value = '';
        }
    };

    const handleRemoveImage = (indexToRemove: number) => {
        setUploadedImages(prev => {
            const newImages = prev.filter((_, index) => index !== indexToRemove);
            if (newImages.length === 0) {
                setAppState('idle');
            }
            return newImages;
        });
    };
    
    const createFinalPrompt = (): string => {
        const baseInstruction = `**Primary Objective:** Recreate the exact person/people from the uploaded photos in a new, photorealistic image.`;

        const userScene = userPrompt.trim() 
            ? `**Scene Description:** ${userPrompt.trim()}.` 
            : '**Scene Description:** Create an interesting and creative photorealistic scene for the person/people in the photo.';

        const rules = `
            **Critical Rules (Non-negotiable):**
            1.  **Preserve Identity:** You MUST keep the faces of the people identical to the source photos. Do not alter their facial structure, features, or unique likeness. The final image must be of the *same people*.
            2.  **Photorealistic Output:** The final image must look like a real photograph, not a drawing or digital creation.
            3.  **Seamless Integration:** The people from the photos must be seamlessly integrated into the described scene with authentic lighting and shadows.
            4.  **Single Image:** Produce a single, cohesive final image.
        `;
        
        return `${baseInstruction} ${userScene} ${rules.replace(/\s\s+/g, ' ')}`.trim();
    };


    const handleGenerateClick = async () => {
        if (uploadedImages.length === 0) return;
        
        setIsLoading(true);
        setAppState('generating');
        setGeneratedImage({ status: 'pending' });

        try {
            const prompt = createFinalPrompt();
            const resultUrl = await generateImage(uploadedImages, prompt);
            setGeneratedImage({ status: 'done', url: resultUrl });
        } catch (err) {
            const errorMessage = err instanceof Error ? err.message : "An unknown error occurred.";
            setGeneratedImage({ status: 'error', error: errorMessage });
            console.error(`Failed to generate image:`, err);
        }

        setIsLoading(false);
        setAppState('results-shown');
    };
    
    const handleReset = () => {
        setUploadedImages([]);
        setGeneratedImage(null);
        setAppState('idle');
        setUserPrompt('');
    };
    
    const handleDownloadIndividualImage = () => {
        if (generatedImage?.status === 'done' && generatedImage.url) {
            const link = document.createElement('a');
            link.href = generatedImage.url;
            link.download = `neurapic-creation.jpg`;
            document.body.appendChild(link);
            link.click();
            document.body.removeChild(link);
        }
    };

    return (
        <main className="bg-stone-100 text-stone-800 min-h-screen w-full flex flex-col items-center justify-center p-4 pb-24 overflow-hidden relative">
            <div className="absolute inset-0 bg-gradient-to-br from-stone-50 via-amber-50 to-stone-100 -z-10"></div>
            
            <AnimatePresence>
                {showSplash && (
                    <SplashScreen onAnimationComplete={() => {
                        setTimeout(() => setShowSplash(false), 600); 
                    }} />
                )}
            </AnimatePresence>

            <motion.div 
                className="z-10 flex flex-col items-center justify-center w-full h-full flex-1 min-h-0"
                initial={{ opacity: 0 }}
                animate={{ opacity: showSplash ? 0 : 1 }}
                transition={{ duration: 0.8, delay: 0.2 }}
            >
                <div className="bg-[#ff4800] p-6 sm:p-8 rounded-lg shadow-lg mb-10 text-center">
                    <h1 className="text-5xl md:text-7xl font-sans font-black text-white uppercase tracking-widest">{t('appName')}</h1>
                    <p className="text-white/90 mt-2 text-lg tracking-wide">{t('appSubtitle')}</p>
                </div>

                {appState === 'idle' && (
                     <div className="relative flex flex-col items-center justify-center w-full">
                        <div className="flex flex-col items-center">
                            <label htmlFor="file-upload" className="cursor-pointer group">
                                 <UploadButton caption={t('uploadCaption')} />
                            </label>
                            <input id="file-upload" type="file" multiple className="hidden" accept="image/png, image/jpeg, image/webp" onChange={handleImageUpload} />
                            <p className="mt-8 text-stone-500 text-center max-w-xs text-lg">
                                {t('startJourney')}
                            </p>
                        </div>
                    </div>
                )}

                {appState === 'photos-selected' && uploadedImages.length > 0 && (
                    <motion.div 
                        className="flex flex-col items-center gap-4 w-full max-w-2xl"
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.5 }}
                    >
                        <div className="w-full text-center">
                            <h2 className="text-3xl font-bold text-stone-700">{t('yourSourcePhotos')}</h2>
                            <p className="text-stone-500 mt-1">{t('uploadMultiple')}</p>
                        </div>
                         <PhotoGallery
                            images={uploadedImages}
                            onRemove={handleRemoveImage}
                         />
                         <div className="w-full flex justify-center mt-2">
                            <label htmlFor="file-upload-more" className="text-lg font-semibold text-center text-amber-600 bg-stone-200/50 border-2 border-amber-500/50 py-2 px-6 rounded-md cursor-pointer transform transition-transform duration-200 hover:scale-105 hover:bg-amber-500 hover:text-white">
                                {t('addMorePhotos')}
                            </label>
                            <input id="file-upload-more" type="file" multiple className="hidden" accept="image/png, image/jpeg, image/webp" onChange={handleImageUpload} />
                        </div>
                         <div className="w-full max-w-lg text-center mt-4">
                             <label htmlFor="prompt-input" className="text-2xl font-bold text-stone-600">
                                 {t('describeFinalImage')}
                             </label>
                             <textarea
                                 id="prompt-input"
                                 value={userPrompt}
                                 onChange={(e) => setUserPrompt(e.target.value)}
                                 placeholder={t('promptPlaceholder')}
                                 className="w-full mt-2 p-3 bg-white/60 backdrop-blur-sm border-2 border-stone-300 rounded-md text-stone-800 font-sans text-base focus:ring-2 focus:ring-amber-500 focus:outline-none transition-all duration-200 resize-none shadow-inner"
                                 rows={3}
                                 aria-label="Creative prompt for image generation"
                             />
                         </div>
                         <div className="flex items-center gap-4 mt-2">
                            <button onClick={handleReset} className={secondaryButtonClasses}>
                                {t('startOver')}
                            </button>
                            <button onClick={handleGenerateClick} className={primaryButtonClasses}>
                                {t('generate')}
                            </button>
                         </div>
                    </motion.div>
                )}

                {(appState === 'generating' || appState === 'results-shown') && uploadedImages.length > 0 && (
                     <>
                        <PhotoGallery
                            images={uploadedImages}
                            className="mb-8"
                        />
                        <div className="flex-1 flex flex-col items-center justify-center w-full max-w-5xl mt-4">
                            {generatedImage && (
                                <motion.div
                                    key="single-result"
                                    className="flex justify-center"
                                    initial={{ opacity: 0, scale: 0.8 }}
                                    animate={{ opacity: 1, scale: 1 }}
                                    transition={{ type: 'spring', stiffness: 100, damping: 20 }}
                                >
                                    <PolaroidCard
                                        caption={t('yourCreation')}
                                        status={generatedImage.status}
                                        imageUrl={generatedImage.url}
                                        error={generatedImage.error}
                                        onShake={handleGenerateClick}
                                        onDownload={handleDownloadIndividualImage}
                                        isMobile={isMobile}
                                    />
                                </motion.div>
                            )}
                        </div>
                         <div className="h-20 mt-4 flex items-center justify-center">
                             {appState === 'generating' && (
                                <p className="text-lg text-stone-500 animate-pulse">
                                    {t('generating')}
                                </p>
                             )}
                            {appState === 'results-shown' && (
                                <div className="flex flex-col sm:flex-row items-center gap-4">
                                    <button 
                                        onClick={handleGenerateClick} 
                                        disabled={isLoading} 
                                        className={`${primaryButtonClasses} disabled:opacity-50 disabled:cursor-not-allowed`}
                                    >
                                        {isLoading ? t('generatingSimple') : t('generateAgain')}
                                    </button>
                                    <button onClick={handleReset} className={secondaryButtonClasses}>
                                        {t('startOver')}
                                    </button>
                                </div>
                            )}
                        </div>
                    </>
                )}
            </motion.div>
            <motion.div
                className="w-full"
                initial={{ opacity: 0 }}
                animate={{ opacity: showSplash ? 0 : 1 }}
                transition={{ duration: 0.8, delay: 0.2 }}
            >
                 <Footer />
            </motion.div>
        </main>
    );
}

export default App;
