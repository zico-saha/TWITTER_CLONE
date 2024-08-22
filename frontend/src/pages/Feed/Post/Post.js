import './Post.css';

import { useState } from "react";
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import { useAuthState } from "react-firebase-hooks/auth";
import auth from '../../../firebase.init';

// Material UI components for UI elements
import { Avatar } from "@mui/material";
import VerifiedUserIcon from "@mui/icons-material/VerifiedUser";
import ChatBubbleOutlineIcon from "@mui/icons-material/ChatBubbleOutline";
import RepeatIcon from "@mui/icons-material/Repeat";
import FavoriteBorderIcon from "@mui/icons-material/FavoriteBorder";
import FavoriteIcon from "@mui/icons-material/Favorite";
import PublishIcon from "@mui/icons-material/Publish";

// The Post component takes a post object `p` as a prop
const Post = ({ p }) => {
    // Destructure the post object properties for easier access
    const { _id, email, name, username, video, photo, post, profilePhoto, liked } = p;

    // Get the currently logged-in user's authentication state
    const [loggedInUser] = useAuthState(auth);

    // Check if the current user has already liked the post and store the state
    const [isLiked, setIsLiked] = useState(liked.includes(loggedInUser.email));

    // Store user data fetched from the server
    const [user, setUser] = useState(null);

    // useNavigate is used to programmatically navigate to different routes
    const navigate = useNavigate();

    // Function to handle liking/unliking a post
    const handleLike = async () => {
        try {
            // Send a PATCH request to update the like status of the post
            await axios.patch(`${process.env.REACT_APP_BACKEND_URL}/likePost/${_id}`, {
                postEmail: email,
                likedByEmail: loggedInUser.email,
            });

            // Toggle the `isLiked` state to update the UI
            setIsLiked(!isLiked);
        } catch (error) {
            console.error("Error liking the post:", error);
        }
    };

    // Function to handle the visit to a user's profile
    const handleProfileVisit = async () => {
        // If the logged-in user clicks on their own profile, navigate to their profile page
        if (loggedInUser && loggedInUser.email === email) {
            navigate('/home/profile');
        } else {
            try {
                // Fetch all users from the server and filter to find the specific user
                const response = await fetch(`${process.env.REACT_APP_BACKEND_URL}/user`);
                const data = await response.json();
                const specificUser = data.find(u => u.email === email);

                // Set the user data and navigate to the profile page with the user's data as state
                setUser(specificUser);
                navigate('/home/profile', { state: { user: specificUser } });
            } catch (error) {
                console.error("Error fetching user data:", error);
            }
        }
    };

    return (
        <div className="post">

            {/* Avatar section with a click handler to visit the profile */}
            <div className="post__avatar" onClick={handleProfileVisit}>
                <Avatar src={profilePhoto} onClick={handleProfileVisit} />
            </div>

            {/* Main post body content */}
            <div className="post__body">

                {/* Post header with the user's name and username */}
                <div className="post__header">
                    <div className="post__headerText">
                        <h3>{name}{" "}
                            <span className="post__headerSpecial">
                                {/* Verified icon and username */}
                                <VerifiedUserIcon className="post__badge" /> @{username}
                            </span>
                        </h3>
                    </div>

                    {/* Post description */}
                    <div className="post__headerDescription">
                        <p>{post}</p>
                    </div>
                </div>

                {/* Display photo if available */}
                {photo && <img src={photo} alt="" width='500' />}
                <br />
                {/* Display video if available */}
                {video && <video src={video} controls width='500'></video>}

                {/* Footer section with interactive icons */}
                <div className="post__footer">
                    <ChatBubbleOutlineIcon className="post__footer__icon" fontSize="small" />
                    <RepeatIcon className="post__footer__icon" fontSize="small" />

                    {/* Toggle between liked and unliked state */}
                    <div onClick={handleLike}>
                        {isLiked ? (
                            <FavoriteIcon className="post__footer__icon" fontSize="small" style={{ color: "red" }} />
                        ) : (
                            <FavoriteBorderIcon className="post__footer__icon" fontSize="small" />
                        )}
                    </div>

                    {/* Publish icon */}
                    <PublishIcon className="post__footer__icon" fontSize="small" />
                </div>

            </div>

        </div>
    );
}

// Export the Post component for use in other parts of the application
export default Post;