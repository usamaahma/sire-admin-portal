import React, { useEffect, useState } from "react";
import { Table, message, Modal, Button, Input, Form } from "antd";
import { contact } from "../utils/axios"; // Make sure this points to your axios instance
import { EyeOutlined, DeleteOutlined } from "@ant-design/icons";

const AdminPortal = () => {
  const [contacts, setContacts] = useState([]);
  const [loading, setLoading] = useState(false);
  const [viewModalVisible, setViewModalVisible] = useState(false);
  const [selectedContact, setSelectedContact] = useState(null);

  // Fetch data from backend
  const fetchContacts = async () => {
    setLoading(true);
    try {
      const res = await contact.get("/");
      setContacts(res.data);
    } catch (error) {
      message.error("Failed to load contacts");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchContacts();
  }, []);

  // Delete a contact
  const handleDelete = async (id) => {
    try {
      await contact.delete(`/${id}`);
      message.success("Contact deleted successfully");
      fetchContacts();
    } catch (error) {
      message.error("Failed to delete contact");
    }
  };

  // View a contact
  const handleView = (record) => {
    setSelectedContact(record);
    setViewModalVisible(true);
  };

  // Define table columns
  const columns = [
    {
      title: "Full Name",
      dataIndex: "fullName",
      key: "fullName",
    },
    {
      title: "Email",
      dataIndex: "email",
      key: "email",
    },
    {
      title: "Phone Number",
      dataIndex: "phoneNumber",
      key: "phoneNumber",
    },
    {
      title: "Message",
      dataIndex: "message",
      key: "message",
      ellipsis: true,
    },
    {
      title: "Actions",
      key: "actions",
      fixed: "right",
      render: (_, record) => (
        <div style={{ display: "flex", gap: 8 }}>
          <Button icon={<EyeOutlined />} onClick={() => handleView(record)} />
          <Button
            icon={<DeleteOutlined />}
            danger
            onClick={() => handleDelete(record._id)}
          />
        </div>
      ),
    },
  ];

  return (
    <div style={{ padding: 20 }}>
      <h2>Admin Portal - Contact List</h2>

      <Table
        columns={columns}
        dataSource={contacts}
        rowKey={(record) => record._id}
        loading={loading}
        bordered
        pagination={{ pageSize: 10 }}
        scroll={{ x: "max-content" }}
      />

      <Modal
        title="Contact Details"
        open={viewModalVisible}
        onCancel={() => setViewModalVisible(false)}
        footer={<Button onClick={() => setViewModalVisible(false)}>Close</Button>}
        width={600}
      >
        {selectedContact && (
          <Form layout="vertical">
            <Form.Item label="Full Name">
              <Input value={selectedContact.fullName} disabled />
            </Form.Item>
            <Form.Item label="Email">
              <Input value={selectedContact.email} disabled />
            </Form.Item>
            <Form.Item label="Phone Number">
              <Input value={selectedContact.phoneNumber} disabled />
            </Form.Item>
            <Form.Item label="Message">
              <Input.TextArea
                value={selectedContact.message}
                disabled
                autoSize={{ minRows: 4 }}
              />
            </Form.Item>
          </Form>
        )}
      </Modal>
    </div>
  );
};

export default AdminPortal;
