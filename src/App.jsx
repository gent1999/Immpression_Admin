import { BrowserRouter as Router, Routes, Route, Navigate } from "react-router-dom";
import Login from "./components/Login";
import Home from "./components/Home";
import ReviewArt from "./components/ReviewArt";
import UserBase from "./components/UserBase";
import ArtDetails from "./components/ArtDetails";
import UserDetails from "./components/UserDetails"; // ✅ Import UserDetails

// import global stylesheet
import './App.css';

function PrivateRoute({ children }) {
  const token = localStorage.getItem("token");
  return token ? children : <Navigate to="/login" replace />;
}

function App() {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<Navigate to="/login" replace />} />
        <Route path="/login" element={<Login />} />
        <Route path="/home" element={<PrivateRoute><Home /></PrivateRoute>} />
        <Route path="/review-art" element={<PrivateRoute><ReviewArt /></PrivateRoute>} />
        <Route path="/user-base" element={<PrivateRoute><UserBase /></PrivateRoute>} />
        <Route path="/art/:id" element={<ArtDetails />} />
        <Route path="/user/:id" element={<PrivateRoute><UserDetails /></PrivateRoute>} /> {/* ✅ New route */}
        <Route path="*" element={<h2>404 - Page Not Found</h2>} />
      </Routes>
    </Router>
  );
}

export default App;
