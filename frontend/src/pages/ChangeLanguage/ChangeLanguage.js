import './ChangeLanguage.css';

import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import { useTranslation } from 'react-i18next';

import LoggedInUser from '../../Hooks/LoggedInUser';
import { useLanguage } from '../../MultiLanguage/LanguageContext';

import ArrowBackIcon from '@mui/icons-material/ArrowBack';
import { Button, Dialog, DialogActions, DialogContent, DialogTitle, TextField } from '@mui/material';

const ChangeLanguage = () => {
    const navigate = useNavigate();
    const [loggedInUser] = LoggedInUser();
    const [OTP, setOTP] = useState('');
    const [enteredOTP, setEnteredOTP] = useState('');
    const [selectedLanguage, setSelectedLanguage] = useState('');

    const [isOtpDialogOpen, setIsOtpDialogOpen] = useState(false);

    const [language, setLanguage] = useLanguage('');
    const { t } = useTranslation();

    const languages = [
        { name: "English", code: "en" },
        { name: "Español", code: "es" },
        { name: "हिन्दी", code: "hi" },
        { name: "Português", code: "pt" },
        { name: "தமிழ்", code: "ta" },
        { name: "বাংলা", code: "bn" },
        { name: "Français", code: "fr" }
    ];

    // Function to navigate back to the previous page
    const handleBack = () => {
        navigate('/home/more');
    }

    // Function to handle language selection and trigger OTP sending
    const handleLanguageSelection = (langCode) => {
        setSelectedLanguage(langCode);
        sendOtp();
    };

    // Send OTP to the user's email
    const sendOtp = async () => {
        try {
            setIsOtpDialogOpen(true);
            const response = await axios.post('http://localhost:5000/otp', { email: loggedInUser[0].email });
            const { otp } = response.data;
            setOTP(otp);
        } catch (error) {
            console.log(error);
            alert('Failed to send OTP');
        }
    };

    // Handle OTP submission and update language
    const handleOtpSubmit = async () => {
        if (enteredOTP === OTP) {
            setLanguage(selectedLanguage);

            try {
                await axios.patch(`http://localhost:5000/userUpdates/${loggedInUser[0].email}`, {
                    language: selectedLanguage
                });
            } catch (error) {
                console.error('Error updating language:', error);
            }

            setIsOtpDialogOpen(false);

            setEnteredOTP('');
            setOTP('');
        } else {
            alert("Invalid OTP");
        }
    };

    return (
        <div className='language-page'>
            {/* Back button to return to the previous page */}
            <ArrowBackIcon onClick={handleBack} />

            <div className="language-container">
                {languages.map((lang, index) => (
                    <button
                        key={index}
                        className="language-button"
                        onClick={() => handleLanguageSelection(lang.code)}
                    >
                        {lang.name}
                    </button>
                ))}
            </div>

            {/* Dialog for OTP input */}
            <Dialog open={isOtpDialogOpen} onClose={() => setIsOtpDialogOpen(false)}>

                <DialogTitle>{t("Enter")} OTP</DialogTitle>

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
                    <Button onClick={() => setIsOtpDialogOpen(false)}>{t("Cancel")}</Button>
                    <Button onClick={handleOtpSubmit}>{t("Submit")}</Button>
                </DialogActions>

            </Dialog>
        </div>
    );
}

export default ChangeLanguage;