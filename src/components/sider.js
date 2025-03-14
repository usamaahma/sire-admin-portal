import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { DownOutlined, UpOutlined } from "@ant-design/icons";  // Importing the down and up icons
import Dashboard from "./dashboard";
import Products from "./product";
import Categories from "./categories";
import Quote from "./getaquote";
import Portfolio from "./portfolio";  // Placeholder for Portfolio
import ProductSorting from "./productsorting";  // Placeholder for Product Sorting
import SearchTracker from "./searchtracker";  // Placeholder for Search Tracker
import Testimonial from "./testimonial";  // Placeholder for Testimonial
import Faqs from "./faqs";  // Placeholder for FAQs
import Blog from "./blogs/blogs";  // Placeholder for Blogs
import Blogcategory from "./blogs/blogcategory";  // Placeholder for Blog Categories
import About from "./about";  // Placeholder for About
import TermsConditions from "./terms";  // Placeholder for Terms and Conditions
import PrivacyPolicy from "./privacy";  // Placeholder for Privacy Policy
import { LogoutOutlined } from "@ant-design/icons";
import "./sider.css"; // Import your custom CSS

const AdminPortal = () => {
  const [activeContent, setActiveContent] = useState("Dashboard");
  const [activeTab, setActiveTab] = useState("Blogs"); // State for the active tab in Blog Management
  const [isBlogManagementOpen, setIsBlogManagementOpen] = useState(false);  // State to toggle Blog Management tabs
  const navigate = useNavigate(); // Initialize useNavigate
  
  // Hardcoded username instead of fetching from localStorage
  const username = "Sire Khan"; // Hardcoded username

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
        return (
          <div>
            {/* Render the correct content based on the active tab */}
            <div className="blog-tabs">
              <a
                className={activeTab === "Blogs" ? "active-tab" : ""}
                onClick={() => setActiveTab("Blogs")}
              >
                Blogs
              </a>
              <a
                className={activeTab === "Blog Categories" ? "active-tab" : ""}
                onClick={() => setActiveTab("Blog Categories")}
              >
                Blog Categories
              </a>
            </div>
            {activeTab === "Blogs" ? <Blog /> : <Blogcategory />}
          </div>
        );
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

  // Toggle the Blog Management tab (expand/collapse)
  const toggleBlogManagement = () => {
    setIsBlogManagementOpen((prev) => !prev);
  };

  return (
    <div className="admin-portal">
      {/* Sidebar */}
      <div className="sider">
        <div className="sider-header">
          <h3 style={{ fontStyle: "italic" }}>Hi, {username}</h3> {/* Direct text display */}
        </div>
        <nav className="sider-links">
          {["Dashboard", "Products", "Categories", "Get a Quote", "Portfolio", "Product Sorting", "Search Tracker", "Testimonial", "FAQs", "About", "Terms and Conditions", "Privacy Policy"].map((item) => (
            <a
              key={item}
              className={activeContent === item ? "active" : ""}
              onClick={() => setActiveContent(item)}
            >
              {item}
            </a>
          ))}
          
          {/* Blog Management Tab */}
          <div className="blog-management">
            <a
              className={activeContent === "Blog Management" ? "active" : ""}
              onClick={() => {
                setActiveContent("Blog Management");
                toggleBlogManagement();  // Toggle sub-tabs when clicked
              }}
            >
              Blog Management
              {isBlogManagementOpen ? <UpOutlined /> : <DownOutlined />}  {/* Switch icon based on state */}
            </a>
            
            {/* Show the sub-tabs under Blog Management */}
            {isBlogManagementOpen && (
              <div className="blog-tabs">
                <a
                  className={activeTab === "Blogs" ? "active-tab" : ""}
                  onClick={() => setActiveTab("Blogs")}
                >
                  Blogs
                </a>
                <a
                  className={activeTab === "Blog Categories" ? "active-tab" : ""}
                  onClick={() => setActiveTab("Blog Categories")}
                >
                  Blog Categories
                </a>
              </div>
            )}
          </div>

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
