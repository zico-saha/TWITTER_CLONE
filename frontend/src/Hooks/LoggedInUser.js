import { useEffect, useState } from "react";
import auth from '../firebase.init';
import { useAuthState } from 'react-firebase-hooks/auth';

const LoggedInUser = () => {
    const [user] = useAuthState(auth);
    const email = user?.email;
    const [loggedInUser, setLoggedInUser] = useState({});

    useEffect(() => {
        fetch(`${process.env.REACT_APP_BACKEND_URL}/loggedInUser?email=${email}`)
            .then(res => res.json())
            .then(data => setLoggedInUser(data));
    }, [email, loggedInUser]);

    return [loggedInUser, setLoggedInUser];
}

export default LoggedInUser;