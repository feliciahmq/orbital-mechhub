import {
  BrowserRouter as Router, Routes, Route
} from "react-router-dom";

import HomePage from "./pages/home/HomePage";
import LoginSignupForm from "./pages/registration/LoginSignupForm";
import UserProfile from "./pages/userprofile/UserProfile";

const App = () => {
  return (
    <div>
      <Router>
        <Routes>
          <Route path="/" element={<HomePage />} />
          <Route path="/account" element={<LoginSignupForm />} />
          <Route path="/profile" element={<UserProfile />} />
        </Routes>
      </Router>
    </div>
  );
}

export default App;