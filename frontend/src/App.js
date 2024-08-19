import './App.css';  // Importing global styles

// Importing necessary components from react-router-dom for routing
import { BrowserRouter, Routes, Route } from 'react-router-dom';

// Importing page components
import Home from './pages/Home';
import Login from './pages/Login/Login';
import Signup from './pages/Login/Signup';
import ProtectedRoute from './pages/ProtectedRoute';  // Component to protect routes
import PageLoading from './pages/PageLoading';  // Page loading component
import Feed from './pages/Feed/Feed';
import Explore from './pages/Explore/Explore';
import Notifications from './pages/Notifications/Notifications';
import Messages from './pages/Messages/Messages';
import Bookmarks from './pages/Bookmarks/Bookmarks';
import Lists from './pages/Lists/Lists';
import Profile from './pages/Profile/Profile';
import More from './pages/More/More';
import Subscriptions from './pages/Subscriptions/Subscriptions';
import ChangeLanguage from './pages/ChangeLanguage/ChangeLanguage';

function App() {
    return (
        <div className="App">
            {/* BrowserRouter enables routing in the app */}
            <BrowserRouter>
                <Routes>
                    {/* Protecting the root path '/' to ensure only authenticated users can access it */}
                    <Route
                        path='/'
                        element={
                            <ProtectedRoute>
                                <Home />  {/* Rendering Home component as a protected route */}
                            </ProtectedRoute>
                        }
                    >
                        {/* Nested routes for different sections, with Feed as the default route */}
                        <Route index element={<Feed />} />
                    </Route>

                    {/* Main /home route protected by ProtectedRoute, contains nested routes for the app sections */}
                    <Route
                        path='/home'
                        element={
                            <ProtectedRoute>
                                <Home />
                            </ProtectedRoute>
                        }
                    >
                        {/* Subroutes within the home section */}
                        <Route path='feed' element={<Feed />} />
                        <Route path='explore' element={<Explore />} />
                        <Route path='notifications' element={<Notifications />} />
                        <Route path='messages' element={<Messages />} />
                        <Route path='bookmarks' element={<Bookmarks />} />
                        <Route path='lists' element={<Lists />} />
                        <Route path='profile' element={<Profile />} />
                        <Route path='more' element={<More />} />
                        <Route path='subscription' element={<Subscriptions />} />
                        <Route path='language' element={<ChangeLanguage />}/>
                    </Route>

                    {/* Route for the login page */}
                    <Route
                        path='/login'
                        element={<Login />}
                    />

                    {/* Route for the signup page */}
                    <Route
                        path='/signup'
                        element={<Signup />}
                    />

                    {/* Route for the page loading indicator */}
                    <Route
                        path='/pageloading'
                        element={<PageLoading />}
                    />
                </Routes>
            </BrowserRouter>
        </div>
    );
}

export default App;