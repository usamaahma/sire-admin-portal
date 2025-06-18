import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import Login from "../login/login";
import Signup from "../login/signup";
import AdminPortal from "../sider";
import ProtectedRoute from "./protectedroute"; 

const AppRoutes = () => {
  return (
    <Router>
      <Routes>
        <Route path="/login" element={<Login />} />
        <Route path="/signup" element={<Signup />} />
        {/* Protect /admin route */}
        <Route
          path="/admin"
          element={
            <ProtectedRoute>
              <AdminPortal />
            </ProtectedRoute>
          }
        />
        <Route path="*" element={<Login />} /> {/* Default route */}
      </Routes>
    </Router>
  );
};

export default AppRoutes;
