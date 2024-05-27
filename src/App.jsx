import {
  BrowserRouter as Router, Routes, Route
} from "react-router-dom";

import HomePage from "./pages/home/HomePage";
import Login from "./pages/registration/Login";
import Signup from "./pages/registration/Signup";
import Profile from "./pages/registration/Profile";

const App = () => {
  return (
    <div>
      <Router>
        <Routes>
          <Route path="/" element={<HomePage />} />
          <Route path="/login" element={<Login />} />
          <Route path="/signup" element={<Signup />} />
          <Route path="/profile" element={<Profile />} />
        </Routes>
      </Router>
    </div>
  );
}

export default App;