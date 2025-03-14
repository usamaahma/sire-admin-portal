import React from "react";
import { BrowserRouter } from "react-router-dom";  // Import BrowserRouter
import AdminPortal from "./components/sider";  // Your Admin Portal Component
import "./App.css";

function App() {
  return (
    <BrowserRouter>  {/* Wrap the entire app in BrowserRouter */}
      <div className="App">
        <AdminPortal />  {/* Your Admin Portal */}
      </div>
    </BrowserRouter>
  );
}

export default App;
