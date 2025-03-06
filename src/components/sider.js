import React, { useState } from "react";
import { useNavigate } from "react-router-dom"; // Import useNavigate
import { Dropdown, Menu } from "antd";
import { LogoutOutlined, DownOutlined } from "@ant-design/icons";
import Dashboard from "./dashboard";
import Products from "./product";
import Categories from "./categories";
import Quote from "./getaquote";
import { Link } from "react-router-dom"; // Link import for navigation

import "./sider.css";

const AdminPortal = () => {
  const [activeContent, setActiveContent] = useState("Dashboard");
  const navigate = useNavigate(); // Initialize useNavigate
  const username = localStorage.getItem("username");

  const menu = (
    <Menu>
      <Menu.Item key="1">
        <Link onClick={() => setActiveContent("All Clothing")}>All Clothing</Link>
      </Menu.Item>
      <Menu.Item key="2">
        <Link onClick={() => setActiveContent("All Hang Tags")}>All Hang Tags</Link>
      </Menu.Item>
    </Menu>
  );

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
      <aside className="sidebar">
        <div className="sidebar-header">
          <h4>Hi, {username}</h4>
        </div>
        <nav className="sidebar-links">
          <a onClick={() => setActiveContent("Dashboard")}>Dashboard</a>
          <a onClick={() => setActiveContent("Products")}>Products</a>
          <a onClick={() => setActiveContent("Categories")}>Categories</a>
          <a onClick={() => setActiveContent("Get a Quote")}>Get a Quote</a>
          <Dropdown overlay={menu} trigger={["click"]} className="products-dropdown">
            <a className="ant-dropdown-link" onClick={(e) => e.preventDefault()}>
              Products <DownOutlined />
            </a>
          </Dropdown>
          <button className="logout-btn" onClick={handleLogout}>
            <LogoutOutlined /> Logout
          </button>
        </nav>
      </aside>

      {/* Main Content */}
      <main className="main-content">
        <h1>{activeContent}</h1>
        {renderContent()}
      </main>
    </div>
  );
};

export default AdminPortal;
