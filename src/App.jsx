import {
  BrowserRouter as Router, Routes, Route
} from "react-router-dom";

import { Toaster } from 'react-hot-toast';

import LandingPage from "./pages/landing/LandingPage";
import { AuthProvider } from './Auth';
import LoginSignupForm from "./pages/registration/LoginSignupForm";
import UserProfile from "./pages/userprofile/UserProfile";

const App = () => {
  return (
    <AuthProvider>
      <Toaster />
      <Router>
        <Routes>
          <Route path="/" element={<LandingPage />} />
          <Route path="/account" element={<LoginSignupForm />} />
          <Route path="/profile" element={<UserProfile />} />
        </Routes>
      </Router>
    </AuthProvider>
  );
}

export default App;