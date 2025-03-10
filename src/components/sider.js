import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import Dashboard from "./dashboard";
import Products from "./product";
import Categories from "./categories";
import Quote from "./getaquote";
import Portfolio from "./portfolio";  // Placeholder for Portfolio
import ProductSorting from "./productsorting";  // Placeholder for Product Sorting
import SearchTracker from "./searchtracker";  // Placeholder for Search Tracker
import Testimonial from "./testimonial";  // Placeholder for Testimonial
import Faqs from "./faqs";  // Placeholder for FAQs
import BlogManagement from "./blogs/blogsmanagement";  // Placeholder for Blog Management
import About from "./about";  // Placeholder for About
import TermsConditions from "./terms";  // Placeholder for Terms and Conditions
import PrivacyPolicy from "./privacy";  // Placeholder for Privacy Policy
import { LogoutOutlined } from "@ant-design/icons";
import "./sider.css"; // Import your custom CSS

const AdminPortal = () => {
  const [activeContent, setActiveContent] = useState("Dashboard");
  const [displayText, setDisplayText] = useState(""); // State for animated text
  const navigate = useNavigate(); // Initialize useNavigate
  const username = localStorage.getItem("username");

  // Function to animate the text (typing effect)
  useEffect(() => {
    const text = `Hi, ${username}`;
    let index = 0;
    const interval = setInterval(() => {
      setDisplayText((prev) => prev + text[index]);
      index += 1;
      if (index === text.length) {
        clearInterval(interval);
      }
    }, 100); // Adjust the speed of typing (100 ms per character)
    return () => clearInterval(interval); // Clean up the interval
  }, [username]);

  // Function to render the active content
  const renderContent = () => {
    switch (activeContent) {
      case "Dashboard":
        return <Dashboard />;
      case "Products":
        return <Products />;
      case "Categories":
        return <Categories />;
      case "Get a Quote":
        return <Quote />;
      case "Portfolio":
        return <Portfolio />;
      case "Product Sorting":
        return <ProductSorting />;
      case "Search Tracker":
        return <SearchTracker />;
      case "Testimonial":
        return <Testimonial />;
      case "FAQs":
        return <Faqs />;
      case "Blog Management":
        return <BlogManagement />;
      case "About":
        return <About />;
      case "Terms and Conditions":
        return <TermsConditions />;
      case "Privacy Policy":
        return <PrivacyPolicy />;
      default:
        return <Dashboard />;
    }
  };

  const handleLogout = () => {
    // Remove token from localStorage
    localStorage.removeItem("token");
    // Redirect to login page
    navigate("/login");
  };

  return (
    <div className="admin-portal">
      {/* Sidebar */}
      <div className="sider">
        <div className="sider-header">
          <h3 style={{ fontStyle: "italic" }}>{displayText}</h3> {/* Animated text */}
        </div>
        <nav className="sider-links">
          {["Dashboard", "Products", "Categories", "Get a Quote", "Portfolio", "Product Sorting", "Search Tracker", "Testimonial", "FAQs", "Blog Management", "About", "Terms and Conditions", "Privacy Policy"].map((item) => (
            <a
              key={item}
              className={activeContent === item ? "active" : ""}
              onClick={() => setActiveContent(item)}
            >
              {item}
            </a>
          ))}
          <button className="logout-btn" onClick={handleLogout}>
            <LogoutOutlined /> Logout
          </button>
        </nav>
      </div>

      {/* Main Content */}
      <div className="main-content">
        <h1 className="content-heading">{activeContent}</h1>
        {renderContent()}
      </div>
    </div>
  );
};

export default AdminPortal;
