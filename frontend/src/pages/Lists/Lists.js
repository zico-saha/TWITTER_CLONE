import '../Page.css';

import { useTranslation } from 'react-i18next';
import { useLanguage } from '../../MultiLanguage/LanguageContext';

const Lists = () => {
    const { t } = useTranslation();
    const { language } = useLanguage();

    return (
        <div className="page">
            <h2 className="pageTitle">{t("Welcome_to_Lists")}</h2>
        </div>
    );
}

export default Lists;