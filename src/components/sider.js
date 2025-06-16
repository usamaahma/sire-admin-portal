import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import {
  DownOutlined,
  UpOutlined,
  LogoutOutlined,
  DashboardOutlined,
  ShoppingOutlined,
  AppstoreOutlined,
  FormOutlined,
  PictureOutlined,
  SortAscendingOutlined,
  MessageOutlined,
  QuestionCircleOutlined,
  ReadOutlined,
  FolderOutlined,
  InfoCircleOutlined,
  FileTextOutlined,
  LockOutlined,
  MenuOutlined,
  UserOutlined,
  RocketOutlined,
  MailOutlined, // Added for Newsletter icon
  TagsOutlined, // Added for Dielineform icon
} from "@ant-design/icons";

import Dashboard from "./dashboard";
import Products from "./product";
import Categories from "./categories";
import Quote from "./getaquote";
import Portfolio from "./portfolio";
import ProductSorting from "./productsorting";
import Testimonial from "./testimonial";
import Faqs from "./faqs";
import Blog from "./blogs/blogs";
import Blogcategory from "./blogs/blogcategory";
import About from "./about";
import TermsConditions from "./terms";
import PrivacyPolicy from "./privacy";
import Navbarcategory from "./navbarcategory";
import Subcategory from "./sub-category";
import "./sider.css";
import Contact from "./contactus";
import Blogauthor from "./blogs/blogauthor";
import Instantquote from "./instantquote/instantquote";
import Newsletter from "./newsletter/newsletter";
import Dielineform from "./dieline-form/dielineform";

const AdminPortal = () => {
  const [activeContent, setActiveContent] = useState("Dashboard");
  const [activeTab, setActiveTab] = useState("Blog Categories");
  const [isBlogManagementOpen, setIsBlogManagementOpen] = useState(false);
  const [username, setUsername] = useState("User");
  const navigate = useNavigate();

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
        return <Categories setActiveContent={setActiveContent} />;
      case "Navbar Categories":
        return <Navbarcategory />;
      case "Get a Quote":
        return <Quote />;
      case "Instant Quote":
        return <Instantquote />;
      case "Portfolio":
        return <Portfolio />;
      case "Product Sorting":
        return <ProductSorting />;
      case "Testimonial":
        return <Testimonial />;
      case "FAQs":
        return <Faqs />;
      case "Newsletter": // Added case for Newsletter
        return <Newsletter />;
      case "Dieline Form": // Added case for Dieline Form
        return <Dielineform />;
      case "Blog Management":
        return (
          <div className="blog-content-container">
            <div className="blog-tabs">
              <button
                className={`tab-button ${
                  activeTab === "Blog Categories" ? "active-tab" : ""
                }`}
                onClick={() => setActiveTab("Blog Categories")}
              >
                <FolderOutlined /> Categories
              </button>
              <button
                className={`tab-button ${
                  activeTab === "Blog Authors" ? "active-tab" : ""
                }`}
                onClick={() => setActiveTab("Blog Authors")}
              >
                <UserOutlined /> Authors
              </button>
              <button
                className={`tab-button ${
                  activeTab === "Blogs" ? "active-tab" : ""
                }`}
                onClick={() => setActiveTab("Blogs")}
              >
                <ReadOutlined /> Blogs
              </button>
            </div>
            <div className="tab-content">
              {activeTab === "Blog Categories" && <Blogcategory />}
              {activeTab === "Blog Authors" && <Blogauthor />}
              {activeTab === "Blogs" && <Blog />}
            </div>
          </div>
        );
      case "About":
        return <About />;
      case "Terms and Conditions":
        return <TermsConditions />;
      case "Contact Us":
        return <Contact />;
      case "Privacy Policy":
        return <PrivacyPolicy />;
      case "Subcategory":
        return <Subcategory />;
      default:
        return <Dashboard />;
    }
  };

  const handleLogout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("username");
    navigate("/login");
  };

  const toggleBlogManagement = () => {
    setIsBlogManagementOpen((prev) => !prev);
    if (!isBlogManagementOpen) {
      setActiveContent("Blog Management");
    }
  };

  const menuItems = [
    { name: "Dashboard", icon: <DashboardOutlined /> },
    { name: "Products", icon: <ShoppingOutlined /> },
    { name: "Navbar Categories", icon: <MenuOutlined /> },
    { name: "Categories", icon: <AppstoreOutlined /> },
    { name: "Get a Quote", icon: <FormOutlined /> },
    { name: "Instant Quote", icon: <RocketOutlined /> },
    { name: "Portfolio", icon: <PictureOutlined /> },
    { name: "Product Sorting", icon: <SortAscendingOutlined /> },
    { name: "Testimonial", icon: <MessageOutlined /> },
    { name: "FAQs", icon: <QuestionCircleOutlined /> },
    { name: "Newsletter", icon: <MailOutlined /> }, // Added Newsletter menu item
    { name: "Dieline Form", icon: <TagsOutlined /> }, // Added Dieline Form menu item
    { name: "About", icon: <InfoCircleOutlined /> },
    { name: "Terms and Conditions", icon: <FileTextOutlined /> },
    { name: "Privacy Policy", icon: <LockOutlined /> },
    { name: "Contact Us", icon: <FormOutlined /> },
  ];

  return (
    <div className="admin-portal">
      <div className="sider">
        <div className="sider-header">
          <h3 className="welcome-message">
            <span className="welcome-text">Welcome,</span>
            <span className="username">{username}</span>
          </h3>
        </div>
        <nav className="sider-links">
          {menuItems.map((item) => (
            <button
              key={item.name}
              className={`sider-link ${
                activeContent === item.name ? "active" : ""
              }`}
              onClick={() => {
                setActiveContent(item.name);
                if (item.name === "Blog Management") {
                  toggleBlogManagement();
                } else {
                  setIsBlogManagementOpen(false);
                }
              }}
            >
              <span className="link-icon">{item.icon}</span>
              <span className="link-text">{item.name}</span>
            </button>
          ))}

          <div className="blog-management">
            <button
              className={`sider-link dropdown-toggle ${
                activeContent === "Blog Management" ? "active" : ""
              }`}
              onClick={toggleBlogManagement}
            >
              <span className="link-icon">
                <ReadOutlined />
              </span>
              <span className="link-text">Blog Management</span>
              <span className="dropdown-icon">
                {isBlogManagementOpen ? <UpOutlined /> : <DownOutlined />}
              </span>
            </button>

            {isBlogManagementOpen && (
              <div className="blog-submenu">
                <button
                  className={`submenu-link ${
                    activeTab === "Blog Categories" ? "active-submenu" : ""
                  }`}
                  onClick={() => setActiveTab("Blog Categories")}
                >
                  <FolderOutlined /> Categories
                </button>
                <button
                  className={`submenu-link ${
                    activeTab === "Blog Authors" ? "active-submenu" : ""
                  }`}
                  onClick={() => setActiveTab("Blog Authors")}
                >
                  <UserOutlined /> Authors
                </button>
                <button
                  className={`submenu-link ${
                    activeTab === "Blogs" ? "active-submenu" : ""
                  }`}
                  onClick={() => setActiveTab("Blogs")}
                >
                  <ReadOutlined /> Blogs
                </button>
              </div>
            )}
          </div>

          <button className="logout-btn" onClick={handleLogout}>
            <LogoutOutlined /> <span>Logout</span>
          </button>
        </nav>
      </div>

      <div className="main-content">
        <h1 className="content-heading">
          {menuItems.find((item) => item.name === activeContent)?.icon}
          {activeContent}
        </h1>
        <div className="content-container">{renderContent()}</div>
      </div>
    </div>
  );
};

export default AdminPortal;