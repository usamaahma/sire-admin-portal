import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { DownOutlined, UpOutlined, LogoutOutlined } from "@ant-design/icons";
import Dashboard from "./dashboard";
import Products from "./product";
import Categories from "./categories";
import Quote from "./getaquote";
import Portfolio from "./portfolio";
import ProductSorting from "./productsorting";
import SearchTracker from "./searchtracker";
import Testimonial from "./testimonial";
import Faqs from "./faqs";
import Blog from "./blogs/blogs";
import Blogcategory from "./blogs/blogcategory";
import About from "./about";
import TermsConditions from "./terms";
import PrivacyPolicy from "./privacy";
import "./sider.css";

const AdminPortal = () => {
  const [activeContent, setActiveContent] = useState("Dashboard");
  const [activeTab, setActiveTab] = useState("Blogs");
  const [isBlogManagementOpen, setIsBlogManagementOpen] = useState(false);
  const [username, setUsername] = useState("User"); // Default user
  const navigate = useNavigate();

  // Fetch the username from localStorage on component mount
  useEffect(() => {
    const storedUsername = localStorage.getItem("username");
    if (storedUsername) {
      setUsername(storedUsername);
    }
  }, []);

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
    // Remove token and username from localStorage
    localStorage.removeItem("token");
    localStorage.removeItem("username");

    // Redirect to login page
    navigate("/login");
  };

  const toggleBlogManagement = () => {
    setIsBlogManagementOpen((prev) => !prev);
  };

  return (
    <div className="admin-portal">
      {/* Sidebar */}
      <div className="sider">
        <div className="sider-header">
          <h3 style={{ fontStyle: "italic" }}>Hi, {username}</h3>{" "}
          {/* Dynamic username */}
        </div>
        <nav className="sider-links">
          {[
            "Dashboard",
            "Products",
            "Categories",
            "Get a Quote",
            "Portfolio",
            "Product Sorting",
            "Search Tracker",
            "Testimonial",
            "FAQs",
            "About",
            "Terms and Conditions",
            "Privacy Policy",
          ].map((item) => (
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
                toggleBlogManagement();
              }}
            >
              Blog Management
              {isBlogManagementOpen ? <UpOutlined /> : <DownOutlined />}
            </a>

            {isBlogManagementOpen && (
              <div className="blog-tabs">
                <a
                  className={activeTab === "Blogs" ? "active-tab" : ""}
                  onClick={() => setActiveTab("Blogs")}
                >
                  Blogs
                </a>
                <a
                  className={
                    activeTab === "Blog Categories" ? "active-tab" : ""
                  }
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
