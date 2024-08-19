// Import necessary dependencies and assets
import '../App.css';
import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import Sidebar from './Sidebar/Sidebar';
import Widgets from './Widgets/Widgets';
import { Outlet } from 'react-router-dom';
import auth from '../firebase.init';
import { useAuthState } from 'react-firebase-hooks/auth';
import { signOut } from 'firebase/auth';
import { Snackbar, Alert } from '@mui/material'; // Import MUI Snackbar and Alert for notifications

const Home = () => {
    // State to keep track of the authenticated user
    const [user] = useAuthState(auth);
    const navigate = useNavigate();

    // State to store the previous plan, alert message, and alert visibility
    const [prevPlan, setPrevPlan] = useState('');
    const [alertMessage, setAlertMessage] = useState(''); // Message to display in the alert
    const [openAlert, setOpenAlert] = useState(false); // Boolean to control the visibility of the alert

    /**
     * Effect that runs when the user state changes.
     * It checks the user's plan expiry and access time periodically.
     */
    useEffect(() => {
        if (user) {
            // Check if the user's plan has expired
            checkPlanExpiry();

            const interval = setInterval(() => {
                // Recheck plan expiry
                checkPlanExpiry();
                // Check access time restrictions
                checkAccessTime();
            }, 1000); // Run every second

            // Cleanup function to clear the interval when the component unmounts
            return () => clearInterval(interval);
        }
    }, [user]);

    /**
     * Function to check if the user's subscription plan has expired.
     * If expired, it downgrades the plan and notifies the user.
     */
    const checkPlanExpiry = async () => {
        try {
            // Fetch user data from the server based on email
            const response = await fetch(`http://localhost:5000/user?email=${user.email}`);
            const data = await response.json();
            const currentUser = data.find(u => u.email === user.email);

            // Extract plan and expiry date from the user's data
            const { plan, expiryDate } = currentUser;
            const currentDate = new Date(); // Current date and time
            const expirationDate = new Date(expiryDate); // Expiry date of the plan

            // If the plan has expired, downgrade the plan
            if (expirationDate < currentDate) {
                // Save the previous plan type
                setPrevPlan(plan);
                // Handle the plan downgrade
                await downgradePlan();
            }
        } catch (error) {
            // Log any errors that occur during the API call
            console.error('Error checking plan expiry:', error);
        }
    };

    /**
     * Function to downgrade the user's plan and show an alert if necessary.
     */
    const downgradePlan = async () => {
        try {
            // Make a POST request to downgrade the user's plan
            const response = await fetch('http://localhost:5000/downgradePlan', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({ email: user.email }),
            });

            // If the response is OK, show an alert about the downgrade
            if (response.ok) {
                // If plan was basic previously, don't show any alert message
                if (prevPlan !== 'basic') {
                    // Set alert message
                    setAlertMessage('Your plan has expired and has been downgraded to the basic plan.');
                    // Display the alert
                    setOpenAlert(true);
                }
            } else {
                // Log any errors that occur during the plan downgrade
                console.error('Failed to downgrade plan:', response.statusText);
            }
        } catch (error) {
            // Log any errors that occur during the API call
            console.error('Error downgrading plan:', error);
        }
    };

    /**
     * Function to check if the user is accessing the app outside allowed hours.
     * Shows an alert and logs out the user if access is restricted.
     */
    const checkAccessTime = async () => {
        try {
            // Fetch user data from the server based on email
            const response = await fetch(`http://localhost:5000/user?email=${user.email}`);
            const data = await response.json();
            const currentUser = data.find(u => u.email === user.email);

            // Extract the last device used from the user's data
            const { last_device } = currentUser;

            // If the user is on a mobile device, apply the time-based access control
            if (last_device.toLowerCase().includes('mobile')) {
                // Get current hour
                const currentHour = new Date().getHours();

                // If current hour is outside allowed access time (8:00 AM to 6:00 PM), show an alert
                if (currentHour < 8 || currentHour >= 18) {
                    // Set alert message
                    setAlertMessage('Access is restricted outside of 8:00 AM to 6:00 PM. You will be logged out.');
                    // Show the alert
                    setOpenAlert(true);
                    setTimeout(() => {
                        // Log out the user after a delay of 5s
                        handleLogout();
                    }, 5000);
                }
            }
        } catch (error) {
            // Log any errors that occur during the API call
            console.error('Error checking access time:', error);
        }
    };

    /** Function to handle user logout */
    const handleLogout = () => {
        signOut(auth);
        navigate('/login');
    };

    /** Function to close the alert */
    const handleCloseAlert = () => {
        setOpenAlert(false); // Close the alert
    };

    return (
        <div className='homePage'>
            <Sidebar
                className="homePage__sidebar"
                handleLogout={handleLogout}
                user={user}
            />
            <Outlet className="homePage__outlet"/>
            <Widgets className="homePage__widgets"/>

            {/* MUI Snackbar with Alert */}
            <Snackbar
                open={openAlert}
                autoHideDuration={6000}
                onClose={handleCloseAlert}
            >
                <Alert onClose={handleCloseAlert} severity="warning" sx={{ width: '100%' }}>
                    {alertMessage}
                </Alert>
            </Snackbar>
        </div>
    );
};

export default Home;