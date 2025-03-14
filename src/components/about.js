import React, { useState } from "react";
import { Table, Button, Input, Modal, Form } from "antd";
import { EditOutlined, DeleteOutlined } from "@ant-design/icons";
import ReactQuill from "react-quill"; // Import ReactQuill editor
import "react-quill/dist/quill.snow.css"; // Import the default theme for Quill

const About = () => {
  const [data, setData] = useState([]);
  const [isModalVisible, setIsModalVisible] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [currentRecord, setCurrentRecord] = useState(null);
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");

  // Handle Add About Us click
  const handleAddClick = () => {
    setIsModalVisible(true);
    setIsEditing(false); // Reset to Add mode
    setTitle("");
    setDescription("");
  };

  // Handle Edit About Us click
  const handleEditClick = (record) => {
    setIsModalVisible(true);
    setIsEditing(true); // Set Edit mode
    setCurrentRecord(record);
    setTitle(record.title);
    setDescription(record.description);
  };

  // Save About Us (Add or Edit)
  const handleSave = () => {
    if (isEditing && currentRecord) {
      // Edit existing record
      const updatedData = data.map((item) =>
        item.key === currentRecord.key ? { ...item, title, description } : item
      );
      setData(updatedData);
    } else {
      // Add new record
      const newRecord = {
        key: Math.random(), // Random key to simulate unique ID
        title,
        description,
      };
      setData([newRecord]);
    }
    setIsModalVisible(false); // Close modal
  };

  // Handle Delete About Us
  const handleDelete = (key) => {
    const updatedData = data.filter((item) => item.key !== key);
    setData(updatedData);
  };

  // Columns for the Ant Design table
  const columns = [
    {
      title: "Title",
      dataIndex: "title",
      key: "title",
      render: (text) => <span>{text}</span>,
    },
    {
      title: "Description",
      dataIndex: "description",
      key: "description",
      render: (text) => <span>{text.slice(0, 50)}...</span>, // Show a snippet of the description
    },
    {
      title: "Action",
      key: "action",
      render: (_, record) => (
        <span>
          <Button
            icon={<EditOutlined />}
            onClick={() => handleEditClick(record)}
            disabled={data.length === 0} // Disable edit if no data
          />
          <Button
            icon={<DeleteOutlined />}
            onClick={() => handleDelete(record.key)}
            disabled={data.length === 0} // Disable delete if no data
            style={{ marginLeft: 8 }}
          />
        </span>
      ),
    },
  ];

  return (
    <div>
      {/* Add About Us Button */}
      {data.length === 0 && (
        <Button type="primary" onClick={handleAddClick}>
          Add About Us
        </Button>
      )}

      {/* Table for displaying About Us content */}
      <Table
        columns={columns}
        dataSource={data}
        pagination={false}
        rowKey="key"
        style={{ marginTop: 20 }}
      />

      {/* Modal for Adding/Editing About Us */}
      <Modal
        title={isEditing ? "Edit About Us" : "Add About Us"}
        visible={isModalVisible}
        onOk={handleSave}
        onCancel={() => setIsModalVisible(false)}
        okText={isEditing ? "Save Changes" : "Save"}
        cancelText="Cancel"
        width="80%" // Adjust width to your preference
      >
        <Form>
          <Form.Item label="Title">
            <Input
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="Enter title"
            />
          </Form.Item>
          <Form.Item label="Description">
            <ReactQuill
              value={description}
              onChange={setDescription}
              placeholder="Enter description"
            />
          </Form.Item>
        </Form>
      </Modal>
    </div>
  );
};

export default About;
