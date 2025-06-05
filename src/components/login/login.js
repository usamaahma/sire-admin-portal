import React, { useState } from "react";
import { Button, Input, Form, message, Select, Row, Col } from "antd";
import { useNavigate, Link } from "react-router-dom";
import { login } from "../../utils/axios";

const { Option } = Select;

const Login = () => {
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();
  const [selectedRole, setSelectedRole] = useState("admin");

  const handleLogin = async (values) => {
    setLoading(true);
    try {
      const response = await login.post("/login", {
        email: values.email,
        password: values.password,
      });

      if (!response.data?.user?.role) {
        throw new Error("Invalid user data received");
      }

      if (response.data.user.role !== values.role) {
        throw new Error(
          `You are registered as ${response.data.user.role}, not ${values.role}`
        );
      }

      // Store user data
      localStorage.setItem("token", response.data.token);
      localStorage.setItem("username", response.data.user.name);
      localStorage.setItem("role", response.data.user.role);
      localStorage.setItem("userData", JSON.stringify(response.data.user));

      message.success(`Welcome ${response.data.user.name}! Redirecting...`);

      // Role-based redirection
      const redirectPaths = {
        admin: "/admin",
        marketing: "/marketing/analytics",
        seo: "/seo/reports",
      };

      setTimeout(
        () => navigate(redirectPaths[response.data.user.role] || "/"),
        1500
      );
    } catch (error) {
      console.error("Login Error:", error);

      let errorMessage = "Login failed. Please try again.";

      if (error.response) {
        // Handle HTTP errors
        errorMessage =
          error.response.data?.message || error.response.statusText;
      } else if (error.message.startsWith("You are registered as")) {
        errorMessage = error.message;
      }

      message.error(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="login-container">
      <Row className="login-box">
        {/* Left Section - Welcome Message */}
        <Col xs={0} md={12} className="welcome-section">
          <h1 className="welcome-title">
            Welcome to SirePrinting Admin Portal
          </h1>
          <p className="welcome-text">
            Please login to access the admin dashboard and manage your content.
          </p>
        </Col>

        {/* Right Section - Login Form */}
        <Col xs={24} md={12} className="form-section">
          <Form
            layout="vertical"
            onFinish={handleLogin}
            initialValues={{ role: "admin" }}
          >
            <h2 className="form-title">Login to Your Account</h2>

            <Form.Item
              name="email"
              rules={[
                { required: true, message: "Please enter your email!" },
                { type: "email", message: "Please enter a valid email!" },
              ]}
            >
              <Input placeholder="Email" size="large" className="form-input" />
            </Form.Item>

            <Form.Item
              name="password"
              rules={[
                { required: true, message: "Please enter your password!" },
                { min: 6, message: "Password must be at least 6 characters!" },
              ]}
            >
              <Input.Password
                placeholder="Password"
                size="large"
                className="form-input"
              />
            </Form.Item>

            <Form.Item
              name="role"
              rules={[{ required: true, message: "Please select your role!" }]}
            >
              <Select
                size="large"
                className="role-selector"
                onChange={(value) => setSelectedRole(value)}
              >
                <Option value="admin">Admin</Option>
                <Option value="marketing">Marketing</Option>
                <Option value="seo">SEO</Option>
              </Select>
            </Form.Item>

            <Form.Item>
              <Button
                type="primary"
                htmlType="submit"
                loading={loading}
                block
                size="large"
                className="login-button"
              >
                {loading ? "Logging in..." : "Login"}
              </Button>
            </Form.Item>

            <div className="signup-link">
              Don't have an account? <Link to="/signup">Sign up here</Link>
            </div>
          </Form>
        </Col>
      </Row>

      {/* CSS Styles */}
      <style jsx>{`
        .login-container {
          height: 100vh;
          background: linear-gradient(135deg, #0f2027, #203a43, #2c5364);
          display: flex;
          align-items: center;
          justify-content: center;
          padding: 20px;
        }

        .login-box {
          width: 100%;
          max-width: 1000px;
          background: white;
          border-radius: 20px;
          overflow: hidden;
          box-shadow: 0 8px 24px rgba(0, 123, 255, 0.3);
        }

        .welcome-section {
          background: #f9f9f9;
          padding: 60px 30px;
          display: flex;
          align-items: center;
          justify-content: center;
          flex-direction: column;
        }

        .welcome-title {
          font-size: 34px;
          font-weight: bold;
          background: linear-gradient(to right, #007bff, #00c6ff);
          -webkit-background-clip: text;
          -webkit-text-fill-color: transparent;
          text-align: center;
          margin-bottom: 20px;
        }

        .welcome-text {
          font-size: 18px;
          text-align: center;
          max-width: 320px;
          font-style: italic;
          color: #333;
        }

        .form-section {
          padding: 40px 30px;
        }

        .form-title {
          color: #007bff;
          text-align: center;
          margin-bottom: 30px;
          font-weight: 600;
        }

        .form-input {
          border-radius: 8px;
          border-color: #007bff !important;
        }

        .role-selector {
          width: 100%;
          border-radius: 8px;
        }

        .login-button {
          border-radius: 8px;
          font-weight: 600;
          background: #007bff;
          border-color: #007bff;
        }

        .signup-link {
          text-align: center;
          margin-top: 20px;
          color: #555;
        }

        .signup-link a {
          color: #007bff;
          font-weight: bold;
        }
      `}</style>
    </div>
  );
};

export default Login;
