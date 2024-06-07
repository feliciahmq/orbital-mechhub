import {
  BrowserRouter as Router, Routes, Route
} from "react-router-dom";

import { Toaster } from 'react-hot-toast';

import LandingPage from "./pages/landing/LandingPage";
import { AuthProvider } from './Auth';
import LoginSignupForm from "./pages/registration/LoginSignupForm";
import UserProfile from "./pages/userprofile/UserProfile";
import SearchPage from "./pages/search/SearchPage";
import ListingPage from "./pages/listing/Listing";

const App = () => {
  return (
    <AuthProvider>
      <Toaster />
      <Router>
        <Routes>
          <Route path="/" element={<LandingPage />} />
          <Route path="/account" element={<LoginSignupForm />} />
          <Route path="/profile" element={<UserProfile />} />
          <Route path="/search" element={<SearchPage />} />
          <Route path="/listing" element={<ListingPage />} />
        </Routes>
      </Router>
    </AuthProvider>
  );
}

export default App;