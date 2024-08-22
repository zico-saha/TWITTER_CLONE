// Importing styles for the Sidebar component
import './Sidebar.css';

// Importing necessary components and hooks
import SidebarOptions from './SidebarOptions';
import CustomLink from './CustomLink';
import LoggedInUser from '../../Hooks/LoggedInUser';
import { useLanguage } from '../../MultiLanguage/LanguageContext';

// Importing React and other dependencies
import { useState } from 'react';
import axios from 'axios';
import { useTranslation } from 'react-i18next';
import { useNavigate } from 'react-router-dom';

// Importing Material-UI icons and components
import TwitterIcon from '@mui/icons-material/Twitter';
import HomeIcon from '@mui/icons-material/Home';
import SearchIcon from '@mui/icons-material/Search';
import NotificationsIcon from '@mui/icons-material/Notifications';
import MailOutlineIcon from '@mui/icons-material/MailOutline';
import BookmarkBorderIcon from '@mui/icons-material/BookmarkBorder';
import ListAltIcon from '@mui/icons-material/ListAlt';
import PermIdentityIcon from '@mui/icons-material/PermIdentity';
import MoreIcon from '@mui/icons-material/More';
import MoreHorizIcon from '@mui/icons-material/MoreHoriz';
import DoneIcon from '@mui/icons-material/Done';
import {
    Avatar, Button, Divider, Dialog, DialogActions, DialogContent, DialogTitle,
    IconButton, ListItemIcon, Menu, MenuItem, Select, FormControl,
    TextField, Snackbar, Alert
} from '@mui/material';

// Sidebar component definition
const Sidebar = ({ handleLogout, user }) => {
    // State hooks for managing UI and data
    const [anchorElement, setAnchorElement] = useState(null);
    const [loggedInUser] = LoggedInUser();

    const [OTP, setOTP] = useState('');
    const [enteredOTP, setEnteredOTP] = useState('');
    const [selectedLanguage, setSelectedLanguage] = useState('');

    const [isOtpDialogOpen, setIsOtpDialogOpen] = useState(false);
    const [isLanguageMenuOpen, setIsLanguageMenuOpen] = useState(false);
    const [openSnackbar, setOpenSnackbar] = useState(false);
    const [snackbarMessage, setSnackbarMessage] = useState('');
    const [snackbarSeverity, setSnackbarSeverity] = useState('info');


    const [language, setLanguage] = useLanguage();
    const navigate = useNavigate();

    const { t } = useTranslation(); // Translation function from i18next

    // Check if the menu is open
    const openMenu = Boolean(anchorElement);

    // Default user profile picture if none is provided
    const userProfilePic = loggedInUser[0]?.profileImage
        ? loggedInUser[0]?.profileImage
        : "https://cdn.pixabay.com/photo/2016/08/08/09/17/avatar-1577909_960_720.png";

    // Handle menu button click
    const handleClick = (e) => {
        setAnchorElement(e.currentTarget);
    }

    // Close the menu
    const handleClose = () => {
        setAnchorElement(null);
    }

    // Handle language change and send OTP for verification
    const handleLanguageChange = async (event) => {
        setSelectedLanguage(event.target.value);
        await sendOtp();
    }

    // Send OTP to the user's email
    const sendOtp = async () => {
        try {
            setIsLanguageMenuOpen(false);
            handleClose();
            setIsOtpDialogOpen(true);
            const response = await axios.post(`${process.env.REACT_APP_BACKEND_URL}/otp`, { email: loggedInUser[0].email });
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
                await axios.patch(`${process.env.REACT_APP_BACKEND_URL}/userUpdates/${loggedInUser[0].email}`, {
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

    // Visit to user profile
    const handleProfileVisit = () => {
        navigate('/home/profile');
    }

    const showSnackbar = (message, severity) => {
        setSnackbarMessage(message);
        setSnackbarSeverity(severity);
        setOpenSnackbar(true);
    };

    const handleSnackbarClose = () => {
        setOpenSnackbar(false);
    };


    // Get the username or default to part of email
    const result = loggedInUser[0]?.username || loggedInUser[0]?.email?.split('@')[0];

    return (
        <div className='sidebar'>
            {/* Twitter icon */}
            <TwitterIcon className='sidebar__twitterIcon' />

            {/* Sidebar options with links */}
            <CustomLink to='/home/feed'>
                <SidebarOptions active Icon={HomeIcon} text={t('Home')} />
            </CustomLink>
            <CustomLink to='/home/explore'>
                <SidebarOptions active Icon={SearchIcon} text={t('Explore')} />
            </CustomLink>
            <CustomLink to='/home/notifications'>
                <SidebarOptions active Icon={NotificationsIcon} text={t('Notifications')} />
            </CustomLink>
            <CustomLink to='/home/messages'>
                <SidebarOptions active Icon={MailOutlineIcon} text={t('Messages')} />
            </CustomLink>
            <CustomLink to='/home/bookmarks'>
                <SidebarOptions active Icon={BookmarkBorderIcon} text={t('Bookmarks')} />
            </CustomLink>
            <CustomLink to='/home/lists'>
                <SidebarOptions active Icon={ListAltIcon} text={t('Lists')} />
            </CustomLink>
            <CustomLink to='/home/profile'>
                <SidebarOptions active Icon={PermIdentityIcon} text={t('Profile')} />
            </CustomLink>
            <CustomLink to='/home/more'>
                <SidebarOptions active Icon={MoreIcon} text={t('More')} />
            </CustomLink>

            {/* Button to create a new tweet */}
            <Button
                variant='outlined'
                className='sidebar__tweet'
            >
                Tweet
            </Button>

            <div className='Profile__info'>

                {/* User profile information */}
                <Avatar
                    src={userProfilePic}
                    onClick={handleProfileVisit}
                />

                <div className='user__info'>
                    <h4>
                        {loggedInUser[0]?.name ? loggedInUser[0].name : user && user.displayName}
                    </h4>
                    <h5>@{result}</h5>
                </div>

                {/* Menu button for additional options */}
                <IconButton
                    size='small'
                    sx={{ ml: 2 }}
                    aria-controls={openMenu ? 'basic-menu' : undefined}
                    aria-haspopup='true'
                    aria-expanded={openMenu ? 'true' : undefined}
                    onClick={handleClick}
                >
                    <MoreHorizIcon />
                </IconButton>

                {/* Menu for user options */}
                <Menu
                    id='basic-menu'
                    anchorEl={anchorElement}
                    open={openMenu || isLanguageMenuOpen}
                    onClick={handleClose}
                    onClose={handleClose}
                >
                    <MenuItem className='menuProfileInfo'>
                        <Avatar src={userProfilePic} />
                        <div className='user__info subUser__info'>
                            <div className='menuUserInfo'>
                                <h4>
                                    {loggedInUser[0]?.name ? loggedInUser[0].name : user && user.displayName}
                                </h4>
                                <h5>@{result}</h5>
                            </div>
                            <ListItemIcon className='doneIcon'><DoneIcon /></ListItemIcon>
                        </div>
                    </MenuItem>
                    <Divider />
                    <MenuItem onClick={handleClose}>{t("add_an_existing_account")}</MenuItem>
                    <MenuItem onClick={handleLogout}>{t("log_out")} @{result}</MenuItem>
                    <Divider />

                    {/* Language selection menu */}
                    <MenuItem>
                        <FormControl fullWidth>
                            <Select
                                value={language}
                                onChange={handleLanguageChange}
                                displayEmpty
                                inputProps={{ 'aria-label': 'Without label' }}
                            >
                                <MenuItem value='en'>English</MenuItem>
                                <MenuItem value='es'>Español</MenuItem>
                                <MenuItem value='hi'>हिन्दी</MenuItem>
                                <MenuItem value='pt'>Português</MenuItem>
                                <MenuItem value='ta'>தமிழ்</MenuItem>
                                <MenuItem value='bn'>বাংলা</MenuItem>
                                <MenuItem value='fr'>Français</MenuItem>
                            </Select>
                        </FormControl>
                    </MenuItem>
                </Menu>

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
                        <Button onClick={() => { setIsOtpDialogOpen(false); setIsLanguageMenuOpen(false); }}>{t("Cancel")}</Button>
                        <Button onClick={handleOtpSubmit}>{t("Submit")}</Button>
                    </DialogActions>

                </Dialog>

            </div>

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

export default Sidebar;
