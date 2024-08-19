import CircularProgress from '@mui/material/CircularProgress';

const PageLoading = () => {
    return (
        <div
            style={{
                display: 'flex',
                minHeight: '100vh',
                justifyContent: 'center',
                alignItems: 'center'
            }}
        >
            <CircularProgress size={80} />
        </div>
    );
}

export default PageLoading;