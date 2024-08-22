import './More.css';

// Hooks to handle translation and navigation
import { useTranslation } from 'react-i18next';
import { useNavigate } from 'react-router-dom';

import { useLanguage } from '../../MultiLanguage/LanguageContext';  // Custom hook for language context

import ArrowForwardIosIcon from '@mui/icons-material/ArrowForwardIos';  // Icon for UI

/**
 * The More component provides options for navigation to other sections 
 * of the application, such as the subscription page and language settings.
 */
const More = () => {
    // Hook for translations to display text in different languages
    const { t } = useTranslation();

    // Hook for managing the current language (context from MultiLanguage provider)
    const { language } = useLanguage();

    // Hook for navigating between pages in the app
    const navigate = useNavigate();

    // Function to navigate to the Subscription page when the subscription button is clicked
    const handleSub = () => {
        navigate('/home/subscription');
    }

    // Function placeholder for handling language settings
    const handleLanguage = () => {
        navigate('/home/language');
    }

    return (
        <div className="morePage">
            {/* Button to navigate to the Subscription page */}
            <div className="moreButton" onClick={handleSub}>
                <ArrowForwardIosIcon className='arrow_icon' />
                <p className='buttonText'>{t('SubscriptionPlan')}</p>
            </div>

            {/* Button for managing language settings (currently no functionality) */}
            <div className="moreButton" onClick={handleLanguage}>
                <ArrowForwardIosIcon className='arrow_icon' />
                <p className='buttonText'>{t('Languages')}</p>
            </div>
        </div>
    );
}

export default More;