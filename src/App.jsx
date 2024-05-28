import {
  BrowserRouter as Router, Routes, Route
} from "react-router-dom";

import HomePage from "./pages/home/HomePage";
import LoginSignupForm from "./pages/registration/LoginSignupForm"
import Profile from "./pages/registration/Profile";

const App = () => {
  return (
    <div>
      <Router>
        <Routes>
          <Route path="/" element={<HomePage />} />
          <Route path="/profile" element={<Profile />} />
          <Route path="/account" element={<LoginSignupForm />} />
        </Routes>
      </Router>
    </div>
  );
}

export default App;