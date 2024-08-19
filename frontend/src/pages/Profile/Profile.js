import '../Page.css';

import MainProfile from './MainProfile/MainProfile';
import OtherProfile from '../OtherProfile/OtherProfile';

import { useLocation } from 'react-router-dom';
import auth from '../../firebase.init';
import { useAuthState } from "react-firebase-hooks/auth";

/**
 * The Profile component is responsible for displaying either the main profile 
 * (for the authenticated user) or another user's profile based on the routing state.
 */
function Profile() {
    // useLocation retrieves the current location object, which contains information passed via navigation state
    const location = useLocation();

    // Destructure user from the location's state, if any exists
    const { user: locationUser } = location.state || {};

    // Retrieve the current authenticated user using Firebase authentication state
    const [authUser] = useAuthState(auth);

    return (
        <div className='profilePage'>
            {/* 
              Conditionally render either the OtherProfile component (for another user)
              or the MainProfile component (for the authenticated user).
            */}
            {(locationUser) ? <OtherProfile user={locationUser} /> : <MainProfile user={authUser} />}
        </div>
    );
}

export default Profile;