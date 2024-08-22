import { Navigate } from 'react-router-dom';
import auth from '../firebase.init';
import { useAuthState } from 'react-firebase-hooks/auth';
import PageLoading from './PageLoading';

const ProtectedRoute = ({ children }) => {
    const [user, isLoading] = useAuthState(auth);

    if (isLoading) {
        return <PageLoading />
    }

    return (!user) ? <Navigate to='/login' /> : children;
}

export default ProtectedRoute;