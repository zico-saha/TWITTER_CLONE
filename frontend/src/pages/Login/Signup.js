// Import necessary dependencies and assets
import './Login.css';
import { getUserInfo } from '../../utils/UserInfo';
import TwitterImage from '../../image/twitter.jpeg';
import TwitterIcon from '@mui/icons-material/Twitter';
import GoogleButton from 'react-google-button';
import { Button, Dialog, DialogActions, DialogContent, DialogTitle, TextField } from '@mui/material';
import { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import auth from '../../firebase.init';
import { useCreateUserWithEmailAndPassword, useSignInWithGoogle } from 'react-firebase-hooks/auth';
import axios from 'axios';
import { Snackbar, Alert } from '@mui/material';

const Signup = () => {
    /* State hooks for storing user input fields: username, name, email, and password */
    const [username, setUsername] = useState('');
    const [name, setName] = useState('');
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [snackbarMessage, setSnackbarMessage] = useState('');
    const [openSnackbar, setOpenSnackbar] = useState(false);
    const [snackbarSeverity, setSnackbarSeverity] = useState('info');

    // Used for navigation to different pages
    const navigate = useNavigate();

    /* State hooks for handling OTP dialog, storing OTP values (received and entered) */
    const [isOtpDialogOpen, setIsOtpDialogOpen] = useState(false);
    const [OTP, setOTP] = useState('');
    const [enteredOTP, setEnteredOTP] = useState('');

    /* Firebase hooks for creating user with email/password and signing in with Google */
    const [createUserWithEmailAndPassword, user, loading, error] = useCreateUserWithEmailAndPassword(auth);
    const [signInWithGoogle, googleUser, googleLoading, googleError] = useSignInWithGoogle(auth);

    /*
     * useEffect to handle Google sign-in after successful Google authentication.
     * Once googleUser is set, fetch current user, retrieve user info and IP address,
     * and either send OTP or complete registration based on device or browser.
     */
    useEffect(() => {
        const handleGoogleUserSignUp = async () => {
            if (googleUser) {
                const currentUser = auth.currentUser;
                const googleName = currentUser.email.split('@')[0];

                // Retrieve user info (device, browser, etc.) and fetch IP address
                const userInfo = getUserInfo();
                const ipResponse = await axios.get('https://api.ipify.org?format=json');
                const ip = ipResponse.data.ip;

                // Conditional OTP handling based on the user's device or browser
                if (userInfo.device === 'Mobile' || userInfo.browser === 'Edge') {
                    await sendOtp(currentUser.email);
                } else {
                    // Send registration data to backend and navigate to home
                    await axios.post('http://localhost:5000/register', {
                        email: currentUser.email,
                        name: googleName,
                        username: googleName,
                        userInfo: { ...userInfo, ip },
                    });
                    goToHome(); // Redirect user to home page
                }
            }
        };

        handleGoogleUserSignUp();
    }, [googleUser]); // Only run when googleUser changes

    // Function to navigate user to the home page
    const goToHome = () => {
        navigate('/');
    }

    /*
     * Function to send OTP via email using backend.
     * The OTP dialog is opened once the request is successful.
     */
    const sendOtp = async (toEmail) => {
        try {
            setIsOtpDialogOpen(true);
            const response = await axios.post('http://localhost:5000/otp', { email: toEmail });
            const { otp } = response.data;
            setOTP(otp);
        } catch (error) {
            setIsOtpDialogOpen(false);
            showSnackbar('Failed to send OTP', 'error'); // Handle errors in sending OTP
        }
    };

    /*
     * Function to handle OTP submission.
     * Checks if entered OTP matches the sent OTP and proceeds with registration.
     */
    const handleOtpSubmit = async () => {
        if (enteredOTP === OTP) {
            setIsOtpDialogOpen(false);

            // Reset OTP states after successful validation
            setEnteredOTP('');
            setOTP('');

            const userInfo = getUserInfo();
            const ipResponse = await axios.get('https://api.ipify.org?format=json');
            const ip = ipResponse.data.ip;

            const currentUser = auth.currentUser;
            const googleName = currentUser.email.split('@')[0];

            // Send registration data to backend and navigate to home
            await axios.post('http://localhost:5000/register', {
                email: currentUser.email || email,
                name: name || googleName,
                username: username || googleName,
                userInfo: { ...userInfo, ip },
            });
            goToHome(); // Redirect user to home page
        } else {
            setIsOtpDialogOpen(false);
            setEnteredOTP(''); // Reset OTP input fields
            setOTP('');
            showSnackbar("Invalid OTP", "error"); // Show error message for invalid OTP
        }
    };

    /*
     * Main function to handle signup or Google sign-in logic.
     * Checks for mobile device restrictions, sends OTP if required, and handles user registration.
     */
    const handleSignUpWithOtpCheck = async (loginFunc) => {
        const userInfo = getUserInfo();
        try {
            const ipResponse = await axios.get('https://api.ipify.org?format=json');
            const ip = ipResponse.data.ip;

            // Check for mobile-specific time restrictions before proceeding
            if (userInfo.device === 'Mobile') {
                const currentHour = new Date().getHours();

                if (currentHour < 8 || currentHour > 18) {
                    showSnackbar("Login/Sign-In through mobile device is only allowed between 8:00 AM and 6:00 PM.", "info");
                    return;
                }
            }

            if (loginFunc === 1) {
                // Sign up with email and password
                await createUserWithEmailAndPassword(email, password);

                // Send OTP if user is on mobile or Edge browser, otherwise proceed to register
                if (userInfo.device === 'Mobile' || userInfo.browser === 'Edge') {
                    sendOtp(email);
                } else {
                    await axios.post('http://localhost:5000/register', {
                        email: email,
                        name: name,
                        username: username,
                        userInfo: { ...userInfo, ip },
                    });
                    goToHome(); // Redirect user to home page
                }
            } else {
                // Sign in with Google
                await signInWithGoogle();
            }
        } catch (error) {
            console.log("Error: ", error);
        }
    };

    // Submit handler for sign up form
    const handleSubmit = (e) => {
        e.preventDefault();
        handleSignUpWithOtpCheck(1);
    };

    // Trigger Google sign-up process
    const handleGoogleSignUp = () => {
        handleSignUpWithOtpCheck(2);
    };

    const showSnackbar = (message, severity) => {
        setSnackbarMessage(message);
        setSnackbarSeverity(severity);
        setOpenSnackbar(true);
    };

    const handleSnackbarClose = () => {
        setOpenSnackbar(false);
    };

    return (
        <div className="signUpContainer">
            <div className="imageContainer">
                <img className="twitterImage" src={TwitterImage} alt='twitter' />
            </div>

            <div className="formContainer">
                <TwitterIcon className='twitterIcon' />
                <h1 className='welcomeMessage1'>Happening now</h1>
                <h2 className='welcomeMessage2'>Join Twitter Today!</h2>

                {/* Form for user input fields */}
                <form onSubmit={handleSubmit}>
                    <input
                        type='text'
                        className='username'
                        placeholder='@username'
                        onChange={(e) => setUsername(e.target.value)}
                    />
                    <input
                        type='text'
                        className='name'
                        placeholder='Full Name'
                        onChange={(e) => setName(e.target.value)}
                    />
                    <input
                        type='email'
                        className='email'
                        placeholder='Email address'
                        onChange={(e) => setEmail(e.target.value)}
                    />
                    <input
                        type='password'
                        className='password'
                        placeholder='Password'
                        onChange={(e) => setPassword(e.target.value)}
                    />
                    <div className='signUpButton'>
                        <button type='submit' className='button'>Sign Up</button>
                    </div>
                </form>

                {/* OTP Dialog for entering the OTP */}
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

                <hr />

                {/* Google sign-in button */}
                <div className='googleButtonContainer'>
                    <GoogleButton
                        className='googleButton'
                        type='light'
                        onClick={handleGoogleSignUp}
                    />
                </div>
                <div>
                    <p>Already have an account?</p>
                    <Link
                        to='/login'
                        style={{
                            textDecoration: 'none',
                            color: 'skyblue',
                            fontWeight: '600',
                            marginLeft: '5px'
                        }}
                    >
                        Login
                    </Link>
                </div>
            </div>

            {/* Alert Snackbar for alert messages */}
            <Snackbar
                open={openSnackbar}
                autoHideDuration={3000}
                onClose={handleSnackbarClose}
                anchorOrigin={{ vertical: 'top', horizontal: 'center' }}
            >
                <Alert onClose={handleSnackbarClose} severity={snackbarSeverity} sx={{ width: '100%' }}>
                    {snackbarMessage}
                </Alert>
            </Snackbar>
        </div>
    );
};

export default Signup;