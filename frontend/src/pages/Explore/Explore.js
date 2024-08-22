import '../Page.css';

import { useTranslation } from 'react-i18next';
import { useLanguage } from '../../MultiLanguage/LanguageContext';

const Explore = () => {
    const { t } = useTranslation();
    const { language } = useLanguage();

    return (
        <div className="page">
            <h2 className="pageTitle">{t("Welcome_to_Explore")}</h2>
        </div>
    );
}

export default Explore;