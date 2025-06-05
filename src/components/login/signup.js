import React, { useState } from "react";
import { Button, Input, Form, message, Select, Row, Col } from "antd";
import { useNavigate, Link } from "react-router-dom";
import { signup } from "../../utils/axios";

const { Option } = Select;

const Signup = () => {
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const handleSignup = async (values) => {
    setLoading(true);
    try {
      const response = await signup.post("/register", values);
      console.log("Signup Successful:", response.data);

      localStorage.setItem("token", response.data.token);

      message.success("Account successfully created! Redirecting to login...");
      setTimeout(() => navigate("/login"), 1000);
    } catch (error) {
      console.error("Signup Failed:", error.response?.data || error.message);
      message.error("Signup failed! Please try again.");
    }
    setLoading(false);
  };

  return (
    <div
      style={{
        height: "100vh",
        background: "linear-gradient(135deg, #0f2027, #203a43, #2c5364)",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        padding: 20,
      }}
    >
      <Row
        style={{
          width: "100%",
          maxWidth: 1000,
          background: "white",
          borderRadius: 20,
          overflow: "hidden",
          boxShadow: "0 8px 24px rgba(0, 123, 255, 0.3)",
        }}
      >
        {/* LEFT COLUMN */}
        <Col
          xs={0}
          md={12}
          style={{
            background: "#f9f9f9",
            padding: "60px 30px",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            flexDirection: "column",
            transition: "all 0.5s ease-in-out",
          }}
        >
          <h1
            style={{
              fontSize: "34px",
              fontWeight: "bold",
              background: "linear-gradient(to right, #007BFF, #00c6ff)",
              WebkitBackgroundClip: "text",
              WebkitTextFillColor: "transparent",
              textAlign: "center",
              marginBottom: 20,
            }}
          >
            Welcome to SirePrinting Admin Portal
          </h1>
          <p
            style={{
              fontSize: "18px",
              textAlign: "center",
              maxWidth: 320,
              fontStyle: "italic",
              color: "#333",
            }}
          >
            Sign up your account to access the portal.
          </p>
        </Col>

        {/* RIGHT COLUMN - SIGNUP FORM */}
        <Col xs={24} md={12} style={{ padding: "40px 30px" }}>
          <Form onFinish={handleSignup}>
            <h2
              style={{
                color: "#007BFF",
                textAlign: "center",
                marginBottom: 30,
                fontWeight: 600,
              }}
            >
              Create an Account
            </h2>

            <Form.Item
              name="name"
              rules={[{ required: true, message: "Please enter your name!" }]}
            >
              <Input
                placeholder="Name"
                style={{
                  borderRadius: 8,
                  borderColor: "#007BFF",
                  height: 40,
                }}
              />
            </Form.Item>

            <Form.Item
              name="email"
              rules={[{ required: true, message: "Please enter your email!" }]}
            >
              <Input
                placeholder="Email"
                style={{
                  borderRadius: 8,
                  borderColor: "#007BFF",
                  height: 40,
                }}
              />
            </Form.Item>

            <Form.Item
              name="password"
              rules={[{ required: true, message: "Please enter your password!" }]}
            >
              <Input.Password
                placeholder="Password"
                style={{
                  borderRadius: 8,
                  borderColor: "#007BFF",
                  height: 40,
                }}
              />
            </Form.Item>

            <Form.Item
              name="role"
              rules={[{ required: true, message: "Please select your role!" }]}
            >
              <Select
                placeholder="Select Role"
                style={{
                  borderRadius: 8,
                  height: 40,
                }}
              >
                <Option value="admin">Admin</Option>
                <Option value="marketing">Digital Marketer</Option>
                <Option value="seo">SEO Expert</Option>
              </Select>
            </Form.Item>

            <Form.Item>
              <Button
                type="primary"
                htmlType="submit"
                loading={loading}
                style={{
                  width: "100%",
                  background: "#007BFF",
                  borderColor: "#007BFF",
                  borderRadius: 8,
                  height: 40,
                  fontWeight: 600,
                }}
              >
                Signup
              </Button>
            </Form.Item>

            <Form.Item style={{ textAlign: "center", marginTop: 10 }}>
              <span style={{ color: "#555" }}>Already have an account? </span>
              <Link to="/login" style={{ color: "#007BFF", fontWeight: "bold" }}>
                Login
              </Link>
            </Form.Item>
          </Form>
        </Col>
      </Row>
    </div>
  );
};

export default Signup;
