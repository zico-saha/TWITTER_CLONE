import { useState } from "react";
import axios from "axios";
import { useAuthState } from "react-firebase-hooks/auth";
import auth from '../../../../firebase.init';

import { Avatar } from "@mui/material";
import VerifiedUserIcon from "@mui/icons-material/VerifiedUser"
import ChatBubbleOutlineIcon from "@mui/icons-material/ChatBubbleOutline";
import RepeatIcon from "@mui/icons-material/Repeat";
import FavoriteBorderIcon from "@mui/icons-material/FavoriteBorder";
import FavoriteIcon from "@mui/icons-material/Favorite";
import PublishIcon from "@mui/icons-material/Publish";

function Post({ p }) {
    const { _id, email, name, username, video, photo, post, profilePhoto, liked } = p;
    const [loggedInUser] = useAuthState(auth);
    const [isLiked, setIsLiked] = useState(liked.includes(loggedInUser.email));

    const handleLike = async () => {
        try {
            await axios.patch(`http://localhost:5000/likePost/${_id}`, {
                postEmail: email,
                likedByEmail: loggedInUser.email,
            });
            setIsLiked(!isLiked);
        } catch (error) {
            console.error("Error liking the post:", error);
        }
    };

    return (
        <div className="post">

            <div className="post__avatar">
                <Avatar src={profilePhoto} />
            </div>

            <div className="post__body">

                <div className="post__header">
                    <div className="post__headerText">
                        <h3>{name}{" "}
                            <span className="post__headerSpecial">
                                <VerifiedUserIcon className="post__badge" /> @{username}
                            </span>
                        </h3>
                    </div>

                    <div className="post__headerDescription">
                        <p>{post}</p>
                    </div>
                </div>

                {photo && <img src={photo} alt="" width='500' />}
                <br />
                {video && <video src={video} controls width='500'></video>}

                <div className="post__footer">
                    <ChatBubbleOutlineIcon className="post__footer__icon" fontSize="small" />
                    <RepeatIcon className="post__footer__icon" fontSize="small" />
                    <div onClick={handleLike}>
                        {
                            isLiked ?
                                <FavoriteIcon className="postFooterIcon" fontSize="small" style={{ color: "red" }} />
                                :
                                <FavoriteBorderIcon className="postFooterIcon" fontSize="small" />
                        }
                    </div>
                    <PublishIcon className="post__footer__icon" fontSize="small" />
                </div>

            </div>

        </div>
    );
}

export default Post;