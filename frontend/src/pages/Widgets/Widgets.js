// Importing styles for the Widgets component
import './Widgets.css';

// Importing components and hooks from libraries
import { TwitterTimelineEmbed, TwitterTweetEmbed } from "react-twitter-embed";
import { useTranslation } from 'react-i18next';
import { useLanguage } from '../../MultiLanguage/LanguageContext';

import SearchIcon from "@mui/icons-material/Search";

// Widgets component definition
const Widgets = () => {
    // Hook for translation
    const { t } = useTranslation();

    // Hook for getting the current language
    const { language } = useLanguage();

    return (
        <div className='widgets'>
            {/* Input section for searching on Twitter */}
            <div className='widgets__input'>
                <SearchIcon className="widgets__searchIcon" />
                {/* Placeholder text is translated */}
                <input placeholder={t("Search_Twitter")} type="text" />
            </div>

            <div className="widgets__widgetContainer">
                {/* Header for the widget container */}
                <h2>{t("WHappen")}</h2>

                {/* Embed a specific tweet */}
                <TwitterTweetEmbed tweetId={"1557187138352861186"} />

                {/* Embed a Twitter timeline for a specific user */}
                <TwitterTimelineEmbed
                    sourceType="profile"
                    screenName="elonmusk"
                    options={{ height: 400 }}
                />
            </div>
        </div>
    );
}

// Exporting the Widgets component
export default Widgets;