import './MainProfile.css';

import EditProfile from '../EditProfile/EditProfile';
import useLoggedInUser from '../../../Hooks/LoggedInUser';
import Post from './Post/Post';
import { useLanguage } from '../../../MultiLanguage/LanguageContext';

import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from "axios";
import { useTranslation } from 'react-i18next';

import ArrowBackIcon from '@mui/icons-material/ArrowBack';
import CenterFocusWeakIcon from '@mui/icons-material/CenterFocusWeak';
import LockResetIcon from '@mui/icons-material/LockReset';
import MyLocationIcon from '@mui/icons-material/MyLocation';
import AddLinkIcon from '@mui/icons-material/AddLink';
import { Dialog } from '@mui/material';

import activeBirdBadge from '../../../image/active-bird-badge.png';
import newbieBadge from '../../../image/newbie-badge.png';
import popularBadge from '../../../image/popular-badge.png';
import socialBadge from '../../../image/social-badge.png';

const badgeImages = {
    '5_posts_badge': newbieBadge,
    '100_posts_badge': activeBirdBadge,
    '100_likes_badge': popularBadge,
    '1_follower_badge': socialBadge,
};

const MainProfile = ({ user }) => {
    const { t } = useTranslation();
    const { language } = useLanguage();

    const navigate = useNavigate();
    const [isLoading, setIsLoading] = useState(false);
    const [loggedInUser] = useLoggedInUser();
    const [posts, setPosts] = useState([]);
    const [points, setPoints] = useState(0);
    const [badgeContainerOpen, setBadgeContainerOpen] = useState(false);
    const [badges, setBadges] = useState([]);
    const [followerCount, setFollowerCount] = useState(0);
    const [followingCount, setFollowingCount] = useState(0);

    const username = user?.email?.split('@')[0];

    useEffect(() => {
        fetch(`${process.env.REACT_APP_BACKEND_URL}/userPost?email=${user?.email}`)
            .then(res => res.json())
            .then(data => {
                setPosts(data);
            });

        fetch(`${process.env.REACT_APP_BACKEND_URL}/userBadges?email=${user?.email}`)
            .then(res => res.json())
            .then(data => {
                setBadges(data);
            });

        if (loggedInUser) {
            fetch(`${process.env.REACT_APP_BACKEND_URL}/user?email=${user?.email}`)
                .then(res => res.json())
                .then(data => {
                    const currentUser = data.find(u => u.email === user?.email);
                    setFollowerCount(currentUser.followers?.length || 0);
                    setFollowingCount(currentUser.following?.length || 0);
                    setPoints(currentUser.points || 0);
                });
        }
    }, [user?.email, loggedInUser]);

    const handleUploadCoverImage = async (e) => {
        setIsLoading(true);
        const image = e.target.files[0];

        const formData = new FormData();
        formData.append('file', image);
        formData.append('upload_preset', 'images_preset');

        try {
            const cloudName = process.env.REACT_APP_CLOUDINARY_CLOUD_NAME;
            const resourceType = 'image';
            const api = `https://api.cloudinary.com/v1_1/${cloudName}/${resourceType}/upload`;
            const res = await axios.post(api, formData);

            const url = res.data.secure_url;
            const userCoverImage = {
                email: user?.email,
                coverImage: url,
            }

            if (url) {
                axios.patch(`${process.env.REACT_APP_BACKEND_URL}/userUpdates/${user?.email}`, userCoverImage);
            }
        } catch (error) {
            console.log("Failed uploading cover-image: ", error);
        }
    };

    const handleUploadProfileImage = async (e) => {
        setIsLoading(true);
        const image = e.target.files[0];

        const formData = new FormData();
        formData.append('file', image);
        formData.append('upload_preset', 'images_preset');

        try {
            const cloudName = process.env.REACT_APP_CLOUDINARY_CLOUD_NAME;
            const resourceType = 'image';
            const api = `https://api.cloudinary.com/v1_1/${cloudName}/${resourceType}/upload`;
            const res = await axios.post(api, formData);

            const url = res.data.secure_url;
            const userProfileImage = {
                email: user?.email,
                profileImage: url,
            }

            if (url) {
                axios.patch(`${process.env.REACT_APP_BACKEND_URL}/userUpdates/${user?.email}`, userProfileImage);
            }
        } catch (error) {
            console.log("Failed uploading profile-image: ", error);
        }
    };

    return (
        <div>
            <ArrowBackIcon className='arrow-icon' onClick={() => navigate('/')} />
            <h4 className='heading-4'>{username}</h4>
            <div className='mainprofile'>
                <div className='profile-bio'>
                    <div>

                        <div className='coverImageContainer'>
                            <img
                                src={
                                    loggedInUser[0]?.coverImage ?
                                        loggedInUser[0]?.coverImage
                                        :
                                        'https://www.proactivechannel.com/Files/BrandImages/Default.jpg'
                                }
                                alt=""
                                className='coverImage'
                            />
                            <div className='hoverCoverImage'>
                                <div className="imageIcon_tweetButton">
                                    <label htmlFor='image' className="imageIcon">
                                        {
                                            isLoading ?
                                                <LockResetIcon className='photoIcon photoIconDisabled' />
                                                :
                                                <CenterFocusWeakIcon className='photoIcon' />
                                        }
                                    </label>
                                    <input
                                        type="file"
                                        id='image'
                                        className="imageInput"
                                        onChange={handleUploadCoverImage}
                                    />
                                </div>
                            </div>
                        </div>

                        <div className='avatar-img'>
                            <div className='avatarContainer'>
                                <img
                                    src={
                                        loggedInUser[0]?.profileImage ?
                                            loggedInUser[0]?.profileImage
                                            :
                                            "https://cdn.pixabay.com/photo/2016/08/08/09/17/avatar-1577909_960_720.png"
                                    }
                                    alt=''
                                    className="avatar"
                                />
                                <div className='hoverAvatarImage'>
                                    <div className="imageIcon_tweetButton">
                                        <label htmlFor='profileImage' className="imageIcon">
                                            {
                                                isLoading ?
                                                    <LockResetIcon className='photoIcon photoIconDisabled' />
                                                    :
                                                    <CenterFocusWeakIcon className='photoIcon' />
                                            }
                                        </label>
                                        <input
                                            type="file"
                                            id='profileImage'
                                            className="imageInput"
                                            onChange={handleUploadProfileImage}
                                        />
                                    </div>
                                </div>
                            </div>

                            <div className='userInfo'>

                                <div>
                                    <div className='name-and-point'>
                                        <h3 className='heading-3'>
                                            {
                                                loggedInUser[0]?.name ?
                                                    loggedInUser[0].name
                                                    :
                                                    user && user.displayName
                                            }
                                        </h3>
                                    </div>
                                    <p className='usernameSection'>@{username}</p>
                                </div>

                                <EditProfile user={user} loggedInUser={loggedInUser} />

                            </div>

                            <div className='infoContainer'>
                                {loggedInUser[0]?.bio ? <p>{loggedInUser[0].bio}</p> : ''}

                                <div className='locationAndLink'>
                                    {
                                        loggedInUser[0]?.location ?
                                            <p className='subInfo'><MyLocationIcon /> {loggedInUser[0].location}</p>
                                            :
                                            ''
                                    }
                                    {
                                        loggedInUser[0]?.website ?
                                            <p className='subInfo link'><AddLinkIcon /> {loggedInUser[0].website}</p>
                                            :
                                            ''
                                    }
                                </div>

                                <div className='follower__following__count'>
                                    <p>{followingCount} {t("following")}</p>
                                    <p>{followerCount} {t("followers")}</p>
                                </div>

                                <h3 className='pointSection'>pt. {points}</h3>
                            </div>

                            <button
                                className='badgeSection'
                                onClick={() => setBadgeContainerOpen(true)}
                            >
                                Badges
                            </button>

                            <h4 className='tweetsText'>Tweets</h4>

                            <hr />

                            <Dialog open={badgeContainerOpen} onClose={() => setBadgeContainerOpen(false)}>
                                <div className='badgeContainer'>
                                    {/* Check if there are any badges; if not, display a message */}
                                    {badges.length > 0 ? (
                                        badges.map((badge, index) => (
                                            <img
                                                key={index}
                                                src={badgeImages[badge.badge]}
                                                alt={badge.badge}
                                                className='badgeImage'
                                            />
                                        ))
                                    ) : (
                                        <p className='badgeMessage'>{t("NothingToFlex")}</p>
                                    )}
                                </div>
                            </Dialog>

                        </div>

                        {posts.map(p => <Post key={p._id} p={p} />)}
                    </div>
                </div>
            </div>
        </div>
    );
};

export default MainProfile;