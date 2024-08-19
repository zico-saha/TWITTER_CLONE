import * as React from 'react';

import './EditProfile.css';

import { useLanguage } from '../../../MultiLanguage/LanguageContext';

import axios from 'axios';
import { useTranslation } from 'react-i18next';

import Box from '@mui/material/Box';
import Button from '@mui/material/Button';
import CloseIcon from '@mui/icons-material/Close';
import Modal from '@mui/material/Modal';
import TextField from '@mui/material/TextField';
import ChevronRightIcon from '@mui/icons-material/ChevronRight';
import { IconButton } from "@mui/material";

const style = {
    position: 'absolute',
    top: '50%',
    left: '50%',
    transform: 'translate(-50%, -50%)',
    width: 600,
    height: 600,
    bgcolor: 'background.paper',
    boxShadow: 24,
    borderRadius: 8,
};

function EditChild({ dob, setDob }) {
    const { t } = useTranslation();
    const { language } = useLanguage();

    const [open, setOpen] = React.useState(false);


    const handleOpen = () => {
        setOpen(true);
    };
    const handleClose = () => {
        setOpen(false);
    };

    return (
        <React.Fragment>
            <div className='birthdate-section' onClick={handleOpen}>
                <text>{t("Edit")}</text>
            </div>
            <Modal
                hideBackdrop
                open={open}
                onClose={handleClose}
                aria-labelledby="child-modal-title"
                aria-describedby="child-modal-description"
            >
                <Box sx={{ ...style, width: 300, height: 400 }}>
                    <div className='text'>
                        <h2>{t("Edit_DOB")}</h2>
                        <p>
                            {t("Edit_DOB_p1")}<br />
                            {t("Edit_DOB_p2")}<br />
                            {t("Edit_DOB_p3")}
                        </p>
                        <input
                            type="date"
                            onChange={e => setDob(e.target.value)}
                        />
                        <Button className='e-button' onClick={() => { setOpen(false); }}>{t("Cancel")}</Button>
                    </div>
                </Box>
            </Modal>
        </React.Fragment>
    );
}

export default function EditProfile({ user, loggedInUser }) {
    const { t } = useTranslation();
    const { language } = useLanguage();

    const [open, setOpen] = React.useState(false);
    const [name, setName] = React.useState('');
    const [bio, setBio] = React.useState('');
    const [location, setLocation] = React.useState('');
    const [website, setWebsite] = React.useState('');
    const [dob, setDob] = React.useState('');


    const HandleSave = () => {
        const editedInfo = {
            name,
            bio,
            location,
            website,
            dob,
        }
        if (editedInfo) {
            axios.patch(`http://localhost:5000/userUpdates/${user?.email}`, editedInfo);
            setOpen(false);
        }
    }

    return (
        <div >
            <button
                className="Edit-profile-btn"
                onClick={() => { setOpen(true) }}
            >
                {t("Edit_Profile")}
            </button>

            <Modal
                open={open}

                aria-labelledby="modal-modal-title"
                aria-describedby="modal-modal-description"
            >
                <Box sx={style} className="modal">

                    <div className='header'>
                        <IconButton onClick={() => { setOpen(false); }} ><CloseIcon /></IconButton>
                        <h2 className='header-title'> {t("Edit_Profile")}</h2>
                        <button className='save-btn' onClick={HandleSave}>{t("Save")}</button>
                    </div>

                    <form className='fill-content'>
                        <TextField
                            className='text-field'
                            fullWidth label={t("Name")}
                            id="fullWidth"
                            variant='filled'
                            onChange={(e) => setName(e.target.value)}
                            defaultValue={loggedInUser[0]?.name ? loggedInUser[0].name : ''}
                        />
                        <TextField
                            className='text-field'
                            fullWidth label={t("Bio")}
                            id="fullWidth"
                            variant='filled'
                            onChange={(e) => setBio(e.target.value)}
                            defaultValue={loggedInUser[0]?.bio ? loggedInUser[0].bio : ''}
                        />
                        <TextField
                            className='text-field'
                            fullWidth label={t("Location")}
                            id="fullWidth"
                            variant='filled'
                            onChange={(e) => setLocation(e.target.value)}
                            defaultValue={loggedInUser[0]?.location ? loggedInUser[0].location : ''}
                        />
                        <TextField
                            className='text-field'
                            fullWidth label={t("Website")}
                            id="fullWidth"
                            variant='filled'
                            onChange={(e) => setWebsite(e.target.value)}
                            defaultValue={loggedInUser[0]?.website ? loggedInUser[0].website : ''}
                        />
                    </form>

                    <div className='birthdate-section'>
                        <p>{t("Birth_Date")}</p>
                        <p>.</p>
                        <EditChild dob={dob} setDob={setDob} />
                    </div>

                    <div className='last-section'>
                        {
                            loggedInUser[0]?.dob ?
                                <h2>{loggedInUser[0].dob}</h2> :
                                <h2>
                                    {
                                        dob ?
                                            dob
                                            :
                                            t("Add_DOB")
                                    }
                                </h2>
                        }
                        <div className='last-btn'>
                            <h2>{t("Switch_to_Prof")}</h2>
                            <ChevronRightIcon />
                        </div>
                    </div>

                </Box>
            </Modal>

        </div>
    );
}