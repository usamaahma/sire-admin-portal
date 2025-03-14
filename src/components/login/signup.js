import React, { useState } from "react";
import { Button, Input, Form, message } from "antd"; // Import Ant Design message
import { useNavigate, Link } from "react-router-dom";
import { signup } from "../../utils/axios";

const Signup = () => {
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const handleSignup = async (values) => {
    setLoading(true);
    try {
      const response = await signup.post("/register", values);
      console.log("Signup Successful:", response.data);

      // Save token (optional)
      localStorage.setItem("token", response.data.token);

      // Show success message
      message.success("Account successfully created! Redirecting to login...");

      // Redirect to Login page after 1 second
      setTimeout(() => navigate("/login"), 1000);
    } catch (error) {
      console.error("Signup Failed:", error.response?.data || error.message);

      // Show error message
      message.error("Signup failed! Please try again.");
    }
    setLoading(false);
  };

  return (
    <div
      style={{
        display: "flex",
        justifyContent: "center",
        alignItems: "center",
        height: "100vh",
        background: "black",
      }}
    >
      <Form
        onFinish={handleSignup}
        style={{
          width: 300,
          padding: 20,
          borderRadius: 10,
          background: "#1a1a1a",
          boxShadow: "0px 4px 10px rgba(255, 255, 0, 0.5)",
        }}
      >
        <h2 style={{ color: "yellow", textAlign: "center" }}>Signup</h2>
        <Form.Item
          name="name"
          rules={[{ required: true, message: "Please enter your name!" }]}
        >
          <Input
            placeholder="Name"
            style={{ background: "#333", color: "white" }}
          />
        </Form.Item>
        <Form.Item
          name="email"
          rules={[{ required: true, message: "Please enter your email!" }]}
        >
          <Input
            placeholder="Email"
            style={{ background: "#333", color: "white" }}
          />
        </Form.Item>
        <Form.Item
          name="password"
          rules={[{ required: true, message: "Please enter your password!" }]}
        >
          <Input.Password
            placeholder="Password"
            style={{ background: "#333", color: "white" }}
          />
        </Form.Item>
        <Form.Item>
          <Button
            type="primary"
            htmlType="submit"
            loading={loading}
            style={{ width: "100%", background: "yellow", color: "black" }}
          >
            Signup
          </Button>
        </Form.Item>
        <Form.Item>
          <p style={{ textAlign: "center", color: "white" }}>
            Already have an account?{" "}
            <Link to="/login" style={{ color: "yellow" }}>
              Login
            </Link>
          </p>
        </Form.Item>
      </Form>
    </div>
  );
};

export default Signup;
