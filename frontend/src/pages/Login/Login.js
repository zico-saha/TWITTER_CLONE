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
import { useSignInWithEmailAndPassword, useSignInWithGoogle } from 'react-firebase-hooks/auth';
import axios from 'axios';
import { Snackbar, Alert } from '@mui/material';

const Login = () => {
    /**
     * State variables to handle user inputs and OTP validation.
     * - email: Stores the user's email input.
     * - password: Stores the user's password input.
     * - isOtpDialogOpen: Controls whether the OTP dialog is visible.
     * - OTP: Stores the OTP received from the server.
     * - enteredOTP: Stores the OTP entered by the user for verification.
     */
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [isOtpDialogOpen, setIsOtpDialogOpen] = useState(false);
    const [OTP, setOTP] = useState('');
    const [enteredOTP, setEnteredOTP] = useState('');
    const [snackbarMessage, setSnackbarMessage] = useState('');
    const [openSnackbar, setOpenSnackbar] = useState(false);
    const [snackbarSeverity, setSnackbarSeverity] = useState('info');

    // Hook for navigating between routes programmatically
    const navigate = useNavigate();

    // Firebase authentication hooks to handle sign-in with email/password and Google authentication
    const [signInWithEmailAndPassword, user, loading, error] = useSignInWithEmailAndPassword(auth);
    const [signInWithGoogle, googleUser, googleLoading, googleError] = useSignInWithGoogle(auth);

    /**
     * useEffect hook to handle the side effect of successful Google sign-in.
     * If the user is authenticated via Google, check their device/browser information,
     * then either send an OTP for additional verification or log them in directly.
     */
    useEffect(() => {
        const handleGoogleUserSignUp = async () => {
            if (googleUser) {
                const currentUser = auth.currentUser;

                // Get user info (device, browser) and user's IP address
                const userInfo = getUserInfo();
                const ipResponse = await axios.get('https://api.ipify.org?format=json');
                const ip = ipResponse.data.ip;

                // Check if OTP is needed based on device or browser type
                if (userInfo.device === 'Mobile' || userInfo.browser === 'Edge') {
                    await sendOtp(currentUser.email);
                } else {
                    // Log user in without OTP if device/browser conditions are not met
                    await axios.post('http://localhost:5000/login', {
                        email: currentUser.email,
                        userInfo: { ...userInfo, ip },
                    });
                    goToHome(); // Redirect user to home page
                }
            }
        };

        // Trigger the Google user sign-up flow if Google authentication succeeds
        handleGoogleUserSignUp();
    }, [googleUser]);

    // Helper function to navigate to the home page
    const goToHome = () => {
        navigate('/');
    };

    /**
     * Function to send an OTP to the specified email address.
     * Opens the OTP dialog and makes an API call to send the OTP.
     * @param {string} toEmail - The email address to send the OTP to.
     */
    const sendOtp = async (toEmail) => {
        try {
            setIsOtpDialogOpen(true); // Show the OTP dialog
            const response = await axios.post('http://localhost:5000/otp', { email: toEmail });
            const { otp } = response.data;
            setOTP(otp); // Store the OTP received from the server
        } catch (error) {
            setIsOtpDialogOpen(false);
            showSnackbar('Failed to send OTP', 'error'); // Handle errors in sending OTP
        }
    };

    /**
     * Function to handle OTP submission.
     * Verifies whether the entered OTP matches the one sent to the user's email.
     * If valid, logs the user in and navigates to the home page.
     */
    const handleOtpSubmit = async () => {
        if (enteredOTP === OTP) {
            setIsOtpDialogOpen(false); // Close the OTP dialog
            setEnteredOTP(''); // Reset OTP input fields
            setOTP('');

            // Get user info and IP address again for logging
            const userInfo = getUserInfo();
            const ipResponse = await axios.get('https://api.ipify.org?format=json');
            const ip = ipResponse.data.ip;
            const currentUser = auth.currentUser;

            // Log user into the system
            await axios.post('http://localhost:5000/login', {
                email: currentUser.email || email,
                userInfo: { ...userInfo, ip },
            });

            goToHome(); // Navigate to the home page
        } else {
            setIsOtpDialogOpen(false);
            setEnteredOTP(''); // Reset OTP input fields
            setOTP('');
            showSnackbar("Invalid OTP", "error"); // Show error message for invalid OTP
        }
    };

    /**
     * Main function to handle login with email/password or Google sign-in.
     * Determines whether to send an OTP or log the user in directly based on the device and time restrictions.
     * @param {number} loginFunc - Determines the login method (1 for email/password, 2 for Google).
     */
    const handleLoginWithOtpCheck = async (loginFunc) => {
        const userInfo = getUserInfo(); // Fetch user info (device, browser)
        try {
            const ipResponse = await axios.get('https://api.ipify.org?format=json');
            const ip = ipResponse.data.ip;

            // Restrict mobile users from logging in outside allowed time ranges (8 AM - 6 PM)
            if (userInfo.device === 'Mobile') {
                const currentHour = new Date().getHours();

                if (currentHour < 8 || currentHour > 18) {
                    showSnackbar("Login/Sign-In through mobile device is only allowed between 8:00 AM and 6:00 PM.", "info");
                    return;
                }
            }

            // If loginFunc is 1, handle email/password sign-in
            if (loginFunc === 1) {
                await signInWithEmailAndPassword(email, password); // Sign in with email/password

                // Check if OTP is needed based on device/browser
                if (userInfo.device === 'Mobile' || userInfo.browser === 'Edge') {
                    sendOtp(email); // Send OTP to email
                } else {
                    // Log user in without OTP
                    await axios.post('http://localhost:5000/login', {
                        email: email,
                        userInfo: { ...userInfo, ip },
                    });
                    goToHome(); // Navigate to the home page
                }
            } else {
                // If loginFunc is 2, handle Google sign-in
                await signInWithGoogle(); // Sign in with Google
            }
        } catch (error) {
            console.log("Error: ", error); // Handle errors during login
        }
    };

    // Form submission handler for email/password login
    const handleSubmit = (e) => {
        e.preventDefault(); // Prevent default form submission behavior
        handleLoginWithOtpCheck(1); // Trigger login flow with email/password
    };

    // Handler for Google sign-in button click
    const handleGoogleSignIn = () => {
        handleLoginWithOtpCheck(2); // Trigger login flow with Google
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
        <div className="LoginContainer">
            <div className="imageContainer">
                <img className="twitterImage" src={TwitterImage} alt='twitter' /> {/* Twitter image */}
            </div>

            <div className="formContainer">
                <TwitterIcon className='twitterIcon' /> {/* Twitter icon */}
                <h1 className='welcomeMessage1'>Happening now</h1> {/* Login heading */}

                <form className='formBox' onSubmit={handleSubmit}>
                    <input
                        type='email'
                        className='email'
                        placeholder='Email address'
                        onChange={(e) => setEmail(e.target.value)} // Update email state
                    />
                    <input
                        type='password'
                        className='password'
                        placeholder='Password'
                        onChange={(e) => setPassword(e.target.value)} // Update password state
                    />
                    <div className='loginButton'>
                        <button type='submit' className='button'>Login</button> {/* Login button */}
                    </div>
                </form>

                {/* OTP dialog for OTP verification */}
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
                            onChange={(e) => setEnteredOTP(e.target.value)} // Update entered OTP state
                        />
                    </DialogContent>
                    <DialogActions>
                        <Button onClick={() => setIsOtpDialogOpen(false)}>Cancel</Button>
                        <Button onClick={handleOtpSubmit}>Submit</Button> {/* Submit OTP */}
                    </DialogActions>
                </Dialog>

                <hr />

                {/* Google sign-in button */}
                <div className='googleButtonContainer'>
                    <GoogleButton
                        className='googleButton'
                        type='light'
                        onClick={handleGoogleSignIn} // Trigger Google sign-in
                    />
                </div>

                <Link to='/signup' className='newToTwitter'>New to Twitter? Sign up now</Link> {/* Signup link */}
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

export default Login;