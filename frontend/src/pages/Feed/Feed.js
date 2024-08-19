import './Feed.css';

import TweetBox from "./TweetBox/TweetBox";
import Post from './Post/Post';
import { useLanguage } from '../../MultiLanguage/LanguageContext';

import { useEffect, useState } from "react";
import { useTranslation } from 'react-i18next';

// The Feed component displays the main content feed of posts and a tweet box
const Feed = () => {
    // Initialize the translation function from react-i18next
    const { t } = useTranslation();

    // Access the current language setting from the context
    const { language } = useLanguage();

    // State to hold the list of posts fetched from the server
    const [posts, setPosts] = useState([]);

    // useEffect hook to fetch posts when the component mounts or when the `posts` state changes
    useEffect(() => {
        // Fetch posts from the server
        fetch('http://localhost:5000/post')
            .then(res => res.json())
            .then(data => setPosts(data));
    }, [posts]);

    return (
        <div className='feed'>
            {/* Header section of the feed */}
            <div className="feed__header">
                {/* Display the title of the feed, localized using react-i18next */}
                <h1>{t("Home")}</h1>
            </div>

            {/* Component for creating new tweets */}
            <TweetBox />

            {/* Map over the posts array to render each post */}
            {
                posts.map(p => <Post key={p._id} p={p} />)
            }
        </div>
    );
}

// Export the Feed component for use in other parts of the application
export default Feed;