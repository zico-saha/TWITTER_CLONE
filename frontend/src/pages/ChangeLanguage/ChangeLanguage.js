import './ChangeLanguage.css';

import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import { useTranslation } from 'react-i18next';

import LoggedInUser from '../../Hooks/LoggedInUser';
import { useLanguage } from '../../MultiLanguage/LanguageContext';

import ArrowBackIcon from '@mui/icons-material/ArrowBack';
import {
    Button, Dialog, DialogActions, DialogContent,
    DialogTitle, TextField, Snackbar, Alert
} from '@mui/material';

const ChangeLanguage = () => {
    const navigate = useNavigate();
    const [loggedInUser] = LoggedInUser();
    const [OTP, setOTP] = useState('');
    const [enteredOTP, setEnteredOTP] = useState('');
    const [selectedLanguage, setSelectedLanguage] = useState('');

    const [isOtpDialogOpen, setIsOtpDialogOpen] = useState(false);
    const [snackbarMessage, setSnackbarMessage] = useState('');
    const [openSnackbar, setOpenSnackbar] = useState(false);
    const [snackbarSeverity, setSnackbarSeverity] = useState('info');

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

    const handleBack = () => {
        navigate('/home/more');
    }

    const handleLanguageSelection = (langCode) => {
        setSelectedLanguage(langCode);
        sendOtp();
    };

    const sendOtp = async () => {
        try {
            setIsOtpDialogOpen(true);
            const response = await axios.post('http://localhost:5000/otp', { email: loggedInUser[0].email });
            const { otp } = response.data;
            setOTP(otp);
        } catch (error) {
            setIsOtpDialogOpen(false);
            showSnackbar('Failed to send OTP', 'error');
        }
    };

    const handleOtpSubmit = async () => {
        if (enteredOTP === OTP) {
            setLanguage(selectedLanguage);

            try {
                await axios.patch(`http://localhost:5000/userUpdates/${loggedInUser[0].email}`, {
                    language: selectedLanguage
                });
                showSnackbar('Language updated successfully', 'success');
            } catch (error) {
                showSnackbar('Error updating language', 'error');
            }

        } else {
            showSnackbar("Invalid OTP", "error");
        }
        setIsOtpDialogOpen(false);
        setEnteredOTP('');
        setOTP('');
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
        <div className='language-page'>
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
}

export default ChangeLanguage;