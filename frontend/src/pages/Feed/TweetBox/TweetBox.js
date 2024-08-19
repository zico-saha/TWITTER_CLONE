// Importing necessary dependencies and assets
import './TweetBox.css';

import React, { useState, useEffect } from 'react';
import axios from 'axios';

import { Avatar, Button, Dialog, DialogActions, DialogContent, DialogTitle, DialogContentText, TextField } from '@mui/material';
import AddPhotoAlternateOutlinedIcon from '@mui/icons-material/AddPhotoAlternateOutlined';
import VideoFileIcon from '@mui/icons-material/VideoFile';
import UploadIcon from '@mui/icons-material/CloudUpload';
import CircularProgress from '@mui/material/CircularProgress';

import { useAuthState } from 'react-firebase-hooks/auth';
import auth from '../../../firebase.init';
import LoggedInUser from '../../../Hooks/LoggedInUser';

import { useTranslation } from 'react-i18next';
import { useLanguage } from '../../../MultiLanguage/LanguageContext';

const TweetBox = () => {
    // For translations and localization
    const { t } = useTranslation();
    const { language } = useLanguage();

    // States for managing inputs, media files, OTP, and loading indicators
    const [post, setPost] = useState('');
    const [image, setImage] = useState(null);
    const [video, setVideo] = useState(null);
    const [imageURL, setImageURL] = useState('');
    const [videoURL, setVideoURL] = useState('');
    const [OTP, setOTP] = useState('');
    const [enteredOTP, setEnteredOTP] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    const [isVideoLoaded, setIsVideoLoaded] = useState(false);
    const [isOtpDialogOpen, setIsOtpDialogOpen] = useState(false);
    const [isMediaDialogOpen, setIsMediaDialogOpen] = useState(false);
    const [alertDialogBoxOpen, setAlertDialogBoxOpen] = useState(false);
    const [postRemains, setPostRemains] = useState(0);

    // Hooks to get logged-in user data and authentication state
    const [loggedInUser] = LoggedInUser();
    const [user] = useAuthState(auth);

    // User email and profile picture (default if not set)
    const email = user?.email;
    const userProfilePic = loggedInUser[0]?.profileImage || "https://cdn.pixabay.com/photo/2016/08/08/09/17/avatar-1577909_960_720.png";

    // Fetch the number of posts remaining for the user
    useEffect(() => {
        const fetchPostRemains = async () => {
            if (email) {
                try {
                    const response = await axios.get(`http://localhost:5000/user/postRemains`, {
                        params: { email: email }
                    });
                    if (response.data) {
                        setPostRemains(response.data.post_remains);
                    } else {
                        console.error('User data not found');
                    }
                } catch (error) {
                    console.error('Error fetching post remains:', error);
                }
            }
        };
        fetchPostRemains();
    }, [email]);

    // Function to handle tweet submission
    const handleTweet = async (e) => {
        e.preventDefault();

        if (postRemains <= 0) {
            alert('You have reached your posting limit.');
            return;
        }

        await submitPost();
    };

    // Send OTP for video upload validation
    const sendOtp = async () => {
        try {
            const response = await axios.post('http://localhost:5000/otp', { email: email });
            const { otp } = response.data;
            setOTP(otp);
            setIsOtpDialogOpen(true);
        } catch (error) {
            console.log(error);
            alert('Failed to send OTP');
        }
    };

    // Handle OTP submission and validation
    const handleOtpSubmit = async () => {
        if (enteredOTP === OTP) {
            setIsOtpDialogOpen(false);
            setEnteredOTP('');
            setOTP('');
        } else {
            alert("Invalid OTP");
        }
    };

    // Handle uploading image/video files to Cloudinary
    const getURL = async () => {
        try {
            setIsVideoLoaded(false);
            setIsMediaDialogOpen(false);

            // If video is being uploaded, send OTP for validation
            if (video) {
                await sendOtp();
            }
            setIsLoading(true);

            // Upload image and video separately and set their URLs
            const imgUrl = await uploadFile('image');
            const vidUrl = await uploadFile('video');
            setImageURL(imgUrl);
            setVideoURL(vidUrl);

            setImage(null);
            setVideo(null);

            setIsLoading(false);
        } catch (error) {
            console.log(error);
            setIsLoading(false);
        }
    };

    // Function to handle file upload to Cloudinary
    const uploadFile = async (type) => {
        const formData = new FormData();
        formData.append('file', type === 'image' ? image : video);
        formData.append('upload_preset', type === 'image' ? 'images_preset' : 'videos_preset');
        try {
            const cloudName = process.env.REACT_APP_CLOUDINARY_CLOUD_NAME;
            const resourceType = (type === 'image') ? 'image' : 'video';
            const api = `https://api.cloudinary.com/v1_1/${cloudName}/${resourceType}/upload`;
            const res = await axios.post(api, formData);
            return res.data.secure_url;
        } catch (error) {
            console.log(error);
        }
    };

    // Function to handle post submission to backend and decrement remaining posts
    const submitPost = async () => {
        if (loggedInUser[0]?.email) {
            const userPost = {
                profilePhoto: userProfilePic,
                post: post,
                photo: imageURL,
                video: videoURL,
                username: loggedInUser[0]?.username || loggedInUser[0]?.email?.split('@')[0],
                name: loggedInUser[0]?.name || loggedInUser[0]?.email?.split('.')[0],
                email: email,
            };

            // Clear inputs after post submission
            setPost('');
            setImageURL('');
            setVideoURL('');

            try {
                await axios.post('http://localhost:5000/post', userPost);
                await axios.post('http://localhost:5000/user/decrementPostRemains', { email: email });
                setPostRemains(prev => prev - 1);
            } catch (error) {
                console.error('Error submitting post:', error);
            }
        }
    };

    // Handle image file selection
    const handleImageChange = (e) => {
        setImage(e.target.files[0]);
        setIsMediaDialogOpen(true);
    };

    // Handle video file selection and validate its length
    const handleVideoChange = (e) => {
        const vfile = e.target.files[0];
        const url = URL.createObjectURL(vfile);
        const vid = document.createElement('video');
        const MAX_VIDEO_LENGTH = 30;

        vid.preload = 'metadata';
        vid.src = url;
        vid.onloadedmetadata = () => {
            URL.revokeObjectURL(url);
            if (vid.duration > MAX_VIDEO_LENGTH) {
                setAlertDialogBoxOpen(true);
                setVideo(null);
            } else {
                setVideo(e.target.files[0]);
                setIsMediaDialogOpen(true);
            }
        };
    };

    return (
        <div className="tweetBox">
            <form onSubmit={handleTweet}>
                <div className="tweetBoxInput">
                    <Avatar src={userProfilePic} />

                    {/* Input for typing the tweet */}
                    <input
                        type="text"
                        placeholder={t("WsHappen")}
                        onChange={(e) => setPost(e.target.value)}
                        value={post}
                        required
                    />
                </div>

                <div className="FileIconTweetButton">
                    {/* Icon for uploading an image */}
                    <label htmlFor="image" className="imageIcon">
                        <AddPhotoAlternateOutlinedIcon />
                    </label>
                    <input
                        type="file"
                        id="image"
                        accept="image/*"
                        className="imageInput"
                        onChange={handleImageChange}
                    />
                    {/* Icon for uploading a video */}
                    <label htmlFor="video" className="videoIcon">
                        <VideoFileIcon />
                    </label>
                    <input
                        type="file"
                        id="video"
                        accept="video/*"
                        className="videoInput"
                        onChange={handleVideoChange}
                    />
                    {/* Display uploading message when loading */}
                    {isLoading && <p className="uploadingText">Uploading file...</p>}
                </div>

                {/* Button for submitting the tweet */}
                <Button
                    className="tweetButton"
                    type="submit"
                >
                    Tweet
                </Button>
            </form>

            {/* OTP Dialog for video upload validation */}
            <Dialog open={isOtpDialogOpen} onClose={() => setIsOtpDialogOpen(false)}>
                <DialogTitle>Enter OTP</DialogTitle>

                <DialogContent>
                    <TextField
                        autoFocus
                        margin="dense"
                        id="otp"
                        label="OTP"
                        type="number"
                        fullWidth
                        variant="standard"
                        value={enteredOTP}
                        onChange={(e) => setEnteredOTP(e.target.value)}
                    />
                </DialogContent>

                <DialogActions>
                    <Button onClick={() => setIsOtpDialogOpen(false)}>Cancel</Button>
                    <Button onClick={handleOtpSubmit}>Submit</Button>
                </DialogActions>
            </Dialog>

            {/* Dialog to preview uploaded image/video */}
            <Dialog
                open={isMediaDialogOpen}
                onClose={() => setIsMediaDialogOpen(false)}
            >
                <DialogTitle>Preview</DialogTitle>

                <DialogContent>
                    {image && (
                        <img
                            src={URL.createObjectURL(image)}
                            alt="Preview"
                            style={{
                                maxWidth: '100%',
                                maxHeight: '400px',
                                objectFit: 'contain'
                            }}
                        />
                    )}
                    {video && (isVideoLoaded ? (
                        <video
                            src={URL.createObjectURL(video)}
                            controls
                            style={{
                                maxWidth: '100%',
                                maxHeight: '400px',
                                objectFit: 'contain'
                            }}
                            onLoadedMetadata={() => setIsVideoLoaded(true)}
                        />
                    ) : (
                        <div style={{ textAlign: 'center', marginTop: '20px' }}>
                            <CircularProgress />
                        </div>
                    ))}
                </DialogContent>

                <DialogActions>
                    <Button onClick={() => setIsMediaDialogOpen(false)}>Cancel</Button>
                    <Button onClick={getURL}><UploadIcon /> Upload</Button>
                </DialogActions>
            </Dialog>

            {/* Alert Dialog if video exceeds maximum length */}
            <Dialog
                open={alertDialogBoxOpen}
                onClose={() => setAlertDialogBoxOpen(false)}
            >
                <DialogTitle>Alert</DialogTitle>

                <DialogContent>
                    <DialogContentText>
                        Video is too long. Maximum length is 30 seconds.
                    </DialogContentText>
                </DialogContent>

                <DialogActions>
                    <Button
                        onClick={() => setAlertDialogBoxOpen(false)}
                        color="primary"
                    >
                        OK
                    </Button>
                </DialogActions>
            </Dialog>
        </div>
    );
};

export default TweetBox;