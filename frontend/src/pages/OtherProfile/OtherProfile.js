import './Otherprofile.css';

import Post from '../Profile/MainProfile/Post/Post';
import { useLanguage } from '../../MultiLanguage/LanguageContext';

import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuthState } from 'react-firebase-hooks/auth';
import auth from '../../firebase.init';
import axios from 'axios';
import { useTranslation } from 'react-i18next';

import ArrowBackIcon from '@mui/icons-material/ArrowBack';
import MyLocationIcon from '@mui/icons-material/MyLocation';
import AddLinkIcon from '@mui/icons-material/AddLink';
import { Dialog, Button } from '@mui/material';

import activeBirdBadge from '../../image/active-bird-badge.png';
import newbieBadge from '../../image/newbie-badge.png';
import popularBadge from '../../image/popular-badge.png';
import socialBadge from '../../image/social-badge.png';

const badgeImages = {
    '5_posts_badge': newbieBadge,
    '100_posts_badge': activeBirdBadge,
    '100_likes_badge': popularBadge,
    '1_follower_badge': socialBadge,
};

const OtherProfile = ({ user }) => {
    const { t } = useTranslation();
    const { language } = useLanguage();

    const { _id, email, name, username, bio, location, website, profileImage, coverImage } = user;
    const navigate = useNavigate();
    const [loggedInUser] = useAuthState(auth);
    const [posts, setPosts] = useState([]);
    const [points, setPoints] = useState(0);
    const [badgeContainerOpen, setBadgeContainerOpen] = useState(false);
    const [badges, setBadges] = useState([]);
    const [isFollowing, setIsFollowing] = useState(false);
    const [followerCount, setFollowerCount] = useState(0);
    const [followingCount, setFollowingCount] = useState(0);
    const [transferStatus, setTransferStatus] = useState(false);
    const [pointTransferOpen, setPointTransferOpen] = useState(false);

    useEffect(() => {
        fetch(`http://localhost:5000/userPost?email=${email}`)
            .then(res => res.json())
            .then(data => setPosts(data));

        fetch(`http://localhost:5000/userBadges?email=${email}`)
            .then(res => res.json())
            .then(data => setBadges(data));

        if (loggedInUser) {
            fetch(`http://localhost:5000/user?email=${email}`)
                .then(res => res.json())
                .then(data => {
                    const currentUser = data.find(u => u.email === email);
                    setFollowerCount(currentUser.followers?.length || 0);
                    setFollowingCount(currentUser.following?.length || 0);
                    setIsFollowing(currentUser?.followers?.includes(loggedInUser.email));
                    setPoints(currentUser.points || 0);
                });
        }
    }, [email, loggedInUser, _id]);

    const handleFollow = async () => {
        try {
            const followerEmail = loggedInUser.email;
            const response = await axios.patch(`http://localhost:5000/followUser/${email}`, { followerEmail });
            console.log("Follow/Unfollow successful!", response.data);
            setIsFollowing(!isFollowing);
        } catch (error) {
            console.error("Error following/unfollowing the user:", error);
        }
    };

    const handlePointTransfer = async () => {
        try {
            const response = await axios.post('http://localhost:5000/transferPoints', {
                senderEmail: loggedInUser.email,
                receiverEmail: email
            });
            setTransferStatus('Transfer successful!');
        } catch (error) {
            if (error.response && error.response.status === 400) {
                setTransferStatus(error.response.data.message);
            } else {
                setTransferStatus('Transfer failed. Please try again later.');
            }
        }
        setPointTransferOpen(true);
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
                                    coverImage ?
                                        coverImage
                                        :
                                        'https://www.proactivechannel.com/Files/BrandImages/Default.jpg'
                                }
                                alt=""
                                className='coverImage'
                            />
                        </div>

                        <div className='avatar-img'>

                            <div className='avatarContainer'>
                                <img
                                    src={
                                        profileImage ?
                                            profileImage
                                            :
                                            "https://cdn.pixabay.com/photo/2016/08/08/09/17/avatar-1577909_960_720.png"
                                    }
                                    alt=''
                                    className="avatar"
                                />
                            </div>

                            <div className='userInfo'>

                                <div>
                                    <div className='name-and-point'>
                                        <h3 className='heading-3'>
                                            {
                                                name ?
                                                    name
                                                    :
                                                    user && user.displayName
                                            }
                                        </h3>
                                    </div>

                                    <p className='usernameSection'>@{username}</p>
                                </div>

                                <button
                                    className={`followButton ${isFollowing ? 'following' : ''}`}
                                    onClick={handleFollow}
                                >
                                    {isFollowing ? t('Following') : t('Follow')}
                                </button>

                            </div>

                            <div className='infoContainer'>

                                {bio ?
                                    <p>{bio}</p>
                                    :
                                    ''
                                }

                                <div className='locationAndLink'>
                                    {
                                        location ?
                                            <p className='subInfo'><MyLocationIcon /> {location}</p>
                                            :
                                            ''
                                    }
                                    {
                                        website ?
                                            <p className='subInfo link'><AddLinkIcon /> {website}</p>
                                            :
                                            ''
                                    }
                                </div>

                                <div className='follower__following__count'>
                                    <p>{followingCount} {t("following")}</p>
                                    <p>{followerCount} {t("followers")}</p>
                                </div>

                            </div>

                            <button
                                className='badgeSection'
                                onClick={() => setBadgeContainerOpen(true)}
                            >
                                Badges
                            </button>

                            <button
                                className='pointTransfer'
                                onClick={() => setPointTransferOpen(true)}
                            >
                                {t("Point_Transfer")}
                            </button>

                            <Dialog open={pointTransferOpen} onClose={() => setPointTransferOpen(false)}>
                                <div className='pointTransferContainer' style={{ padding: '20px', textAlign: 'center' }}>
                                    <h2>{t("Point_Transfer")}</h2>
                                    {transferStatus ? (
                                        <p>{transferStatus}</p>
                                    ) : (
                                        <p>{t("Point_Transfer_msg")} {username}?</p>
                                    )}
                                    <div style={{ marginTop: '20px' }}>
                                        {!transferStatus && (
                                            <Button
                                                variant="contained"
                                                color="primary"
                                                onClick={handlePointTransfer}
                                                style={{ marginRight: '10px' }}
                                            >
                                                {t("Confirm")}
                                            </Button>
                                        )}
                                        <Button
                                            variant="outlined"
                                            color="secondary"
                                            onClick={() => setPointTransferOpen(false)}
                                        >
                                            {t("Close")}
                                        </Button>
                                    </div>
                                </div>
                            </Dialog>

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

export default OtherProfile;