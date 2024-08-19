import './Subscriptions.css';
import TwitterImageLogo from '../../image/Twitter_Image_logo.png';
import React, { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { useNavigate } from 'react-router-dom';
import { v4 as uuidv4 } from 'uuid';
import { useLanguage } from '../../MultiLanguage/LanguageContext';
import { useAuthState } from 'react-firebase-hooks/auth';
import auth from '../../firebase.init';
import ArrowBackIcon from '@mui/icons-material/ArrowBack';

// MUI components for Snackbar and Alert
import Snackbar from '@mui/material/Snackbar';
import Alert from '@mui/material/Alert';

const SubscriptionPlans = () => {
    const { t } = useTranslation();
    const { language } = useLanguage();
    const [loggedInUser] = useAuthState(auth);
    const navigate = useNavigate();

    // State for managing success and error messages
    const [successMessage, setSuccessMessage] = useState('');
    const [errorMessage, setErrorMessage] = useState('');

    // State for controlling Snackbar visibility
    const [openSnackbar, setOpenSnackbar] = useState(false);

    const plans = [
        {
            type: t('Monthly'),
            priceTxt: t('MonthlyCharge'),
            price: "49900",  // Monthly price in cents
            benefits: [
                t("MonthlyPostingLimit"),
                t("PremiumFeatureAccess"),
                t("AdFree"),
                t("CustomerSupport"),
            ],
        },
        {
            type: t('Yearly'),
            priceTxt: t('YearlyCharge'),
            price: "499900",  // Yearly price in cents
            benefits: [
                t("YearlyPostingLimit"),
                t("PremiumFeatureAccess"),
                t("AdFree"),
                t("CustomerSupport"),
            ],
        },
    ];

    const handleBack = () => {
        navigate('/home/more');
    };

    // Function to handle closing of the Snackbar
    const handleCloseSnackbar = () => {
        setOpenSnackbar(false);
    };

    const handleTransaction = async (e, price, planType) => {
        const amount = price;
        const currency = 'INR';
        const receiptID = uuidv4();

        try {
            const response = await fetch('http://localhost:5000/payment', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({ amount, currency, receipt: receiptID })
            });

            const order = await response.json();

            var options = {
                key: "",  // Razorpay key
                amount,
                currency,
                name: "Twitter Clone",
                description: "Subscription Transaction",
                image: TwitterImageLogo,
                order_id: order.id,
                handler: async function (response) {
                    // On successful payment
                    setSuccessMessage("Transaction Successful!");
                    setOpenSnackbar(true);

                    await fetch('http://localhost:5000/paymentSuccess', {
                        method: 'POST',
                        headers: {
                            'Content-Type': 'application/json'
                        },
                        body: JSON.stringify({
                            email: loggedInUser.email,
                            plan: planType,
                        })
                    });
                },
                prefill: {
                    name: "",
                    email: "",
                    contact: "",
                },
                theme: {
                    color: "#3399cc",
                },
            };

            var rzp = new Razorpay(options);
            rzp.open();
            e.preventDefault();

        } catch (error) {
            // Handle payment failure
            setErrorMessage("Transaction failed! Please try again.");
            setOpenSnackbar(true);
        }
    };

    return (
        <div className="subscription-page">
            <ArrowBackIcon onClick={handleBack} />
            <h1>{t('SubscriptionPlan')}</h1>

            <div className="plans-container">
                {plans.map((plan, index) => (
                    <div
                        key={index}
                        className="plan-card"
                        onClick={(e) => handleTransaction(e, plan.price, plan.type.toLowerCase())}
                    >
                        <h2>{plan.type}</h2>
                        <p className="price">{plan.priceTxt}</p>
                        <ul className="benefits">
                            {plan.benefits.map((benefit, index) => (
                                <li key={index}>{benefit}</li>
                            ))}
                        </ul>
                    </div>
                ))}
            </div>

            {/* Snackbar for showing success or error messages */}
            <Snackbar
                open={openSnackbar}
                autoHideDuration={6000}
                onClose={handleCloseSnackbar}
            >
                {successMessage ? (
                    <Alert onClose={handleCloseSnackbar} severity="success" sx={{ width: '100%' }}>
                        {successMessage}
                    </Alert>
                ) : (
                    <Alert onClose={handleCloseSnackbar} severity="error" sx={{ width: '100%' }}>
                        {errorMessage}
                    </Alert>
                )}
            </Snackbar>
        </div>
    );
}

export default SubscriptionPlans;