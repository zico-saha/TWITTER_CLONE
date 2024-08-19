// Import necessary dependencies and assets
import LoggedInUser from '../Hooks/LoggedInUser';
import React, { createContext, useContext, useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import axios from 'axios';

// Create a context for managing language state
const LanguageContext = createContext();

// Custom hook to use the LanguageContext
export const useLanguage = () => useContext(LanguageContext);

export const LanguageProvider = ({ children }) => {
    const { i18n } = useTranslation();
    const [language, setLanguage] = useState(null);
    const [loggedInUser] = LoggedInUser();

    useEffect(() => {
        /**
         * Fetch the user's preferred language from the backend.
         * Updates the language state and changes the i18n language.
         */
        const fetchLanguage = async () => {
            try {
                const response = await axios.get('http://localhost:5000/user/language', {
                    params: { email: loggedInUser[0]?.email }
                });
                if (response.data.language) {
                    setLanguage(response.data.language);
                    i18n.changeLanguage(response.data.language);
                }
            } catch (error) {
                // Fallback to 'en' if there is an error fetching the language
                setLanguage('en');
                i18n.changeLanguage('en');
                console.error('Error fetching language:', error);
            }
        };

        fetchLanguage();
    }, [loggedInUser, i18n]);

    useEffect(() => {
        /**
         * Update the body class based on the selected language.
         * Removes all possible language classes and adds the current language class.
         */
        if (language) {
            document.body.classList.remove('en', 'es', 'hi', 'pt', 'ta', 'bn', 'fr');
            document.body.classList.add(language);
        }
    }, [language]);

    return (
        <LanguageContext.Provider value={[language, setLanguage]}>
            {children}
        </LanguageContext.Provider>
    );
};