import '../Page.css';

import { useTranslation } from 'react-i18next';
import { useLanguage } from '../../MultiLanguage/LanguageContext';

const Notifications = () => {
    const { t } = useTranslation();
    const { language } = useLanguage();

    return (
        <div className="page">
            <h2 className="pageTitle">{t("Welcome_to_Notifications")}</h2>
        </div>
    );
}

export default Notifications;