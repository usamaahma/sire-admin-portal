import React, { useState } from "react";
import {
  Table,
  Button,
  Space,
  Modal,
  message,
  Input,
  Rate,
  Upload,
  Form,
  Image,  // Import Image from Ant Design
} from "antd";
import { DeleteOutlined, EyeOutlined, PlusOutlined } from "@ant-design/icons";
import { UploadOutlined } from "@ant-design/icons";

const Testimonial = () => {
  // State for storing testimonial data and selected testimonial for modal
  const [testimonials, setTestimonials] = useState([
    {
      key: "1",
      name: "John Doe",
      description: "Great service, really satisfied with the experience!",
      image: "https://via.placeholder.com/100",
      rating: 5,
    },
    {
      key: "2",
      name: "Jane Smith",
      description: "Good experience, will come back again.",
      image: "https://via.placeholder.com/100",
      rating: 4,
    },
  ]);
  const [isModalVisible, setIsModalVisible] = useState(false);
  const [isAddModalVisible, setIsAddModalVisible] = useState(false);
  const [selectedTestimonial, setSelectedTestimonial] = useState(null);
  const [imagePreviewVisible, setImagePreviewVisible] = useState(false);
  const [imagePreviewUrl, setImagePreviewUrl] = useState("");
  const [form] = Form.useForm(); // Ant Design Form hook

  // Handle view testimonial modal
  const handleViewTestimonial = (testimonial) => {
    setSelectedTestimonial(testimonial);
    setIsModalVisible(true);
  };

  // Handle delete testimonial action
  const handleDeleteTestimonial = (key) => {
    setTestimonials(
      testimonials.filter((testimonial) => testimonial.key !== key)
    );
    message.success("Testimonial deleted successfully!");
  };

  // Table columns
  const columns = [
    {
      title: "Name",
      dataIndex: "name",
      key: "name",
    },
    {
      title: "Description",
      dataIndex: "description",
      key: "description",
    },
    {
      title: "Image",
      dataIndex: "image",
      key: "image",
      render: (text) => (
        <Image
          width={50}
          height={50}
          src={text}
          alt="testimonial"
          preview={{ visible: false }} // Disable default preview
          onClick={() => handleImagePreview(text)} // Open custom image preview
        />
      ),
    },
    {
      title: "Actions",
      key: "actions",
      render: (text, record) => (
        <Space size="middle">
          <Button
            type="primary"
            icon={<EyeOutlined />}
            onClick={() => handleViewTestimonial(record)} // Open modal for view
          >
            View
          </Button>
          <Button
            danger
            icon={<DeleteOutlined />}
            onClick={() => handleDeleteTestimonial(record.key)} // Delete testimonial
          >
            Delete
          </Button>
        </Space>
      ),
    },
  ];

  // Handle modal close
  const handleModalClose = () => {
    setIsModalVisible(false);
    setSelectedTestimonial(null);
  };

  // Handle image preview
  const handleImagePreview = (imageUrl) => {
    setImagePreviewUrl(imageUrl);
    setImagePreviewVisible(true);
  };

  // Handle image preview modal close
  const handleImagePreviewClose = () => {
    setImagePreviewVisible(false);
  };

  // Handle adding testimonial form submission
  const handleAddTestimonial = (values) => {
    const newTestimonial = {
      key: (testimonials.length + 1).toString(),
      ...values,
    };
    setTestimonials([...testimonials, newTestimonial]);
    message.success("Testimonial added successfully!");
    setIsAddModalVisible(false);
    form.resetFields(); // Reset form fields
  };

  return (
    <div>
      <h2>Testimonial</h2>
      <p>
        This is the Testimonial section where we display feedback from users.
      </p>

      {/* Add Testimonial Button */}
      <Button
        type="primary"
        icon={<PlusOutlined />}
        onClick={() => setIsAddModalVisible(true)}
        style={{ marginBottom: "20px" }}
      >
        Add Testimonial
      </Button>

      {/* Table to display testimonials */}
      <Table
        columns={columns}
        dataSource={testimonials}
        rowKey="key"
        pagination={{ pageSize: 5 }} // Optional: Limit the number of rows per page
        scroll={{ x: "max-content" }} // Horizontal scroll for larger content
        bordered // Add borders around the table
        responsive // Automatically adjust table layout based on screen size
        style={{ width: "80%", margin: "0 auto" }} // Adjust the table width and center it
      />

      {/* Modal to view testimonial details */}
      <Modal
        title="Testimonial Details"
        visible={isModalVisible}
        onCancel={handleModalClose}
        footer={null} // No footer buttons
      >
        {selectedTestimonial && (
          <div>
            <p>
              <strong>Name:</strong> {selectedTestimonial.name}
            </p>
            <p>
              <strong>Rating:</strong> {selectedTestimonial.rating} stars
            </p>
            <p>
              <strong>Description:</strong> {selectedTestimonial.description}
            </p>
            <img
              src={selectedTestimonial.image}
              alt="testimonial"
              style={{ width: "100%", height: "auto" }}
            />
          </div>
        )}
      </Modal>

      {/* Modal for image preview */}
      <Modal
        visible={imagePreviewVisible}
        footer={null}
        onCancel={handleImagePreviewClose}
        width={800} // Adjust width of modal for image preview
      >
        <img
          src={imagePreviewUrl}
          alt="Image Preview"
          style={{ width: "100%", height: "auto" }}
        />
      </Modal>

      {/* Modal for Adding Testimonial */}
      <Modal
        title="Add Testimonial"
        visible={isAddModalVisible}
        onCancel={() => setIsAddModalVisible(false)}
        footer={null}
      >
        <Form
          form={form}
          onFinish={handleAddTestimonial}
          layout="vertical"
          initialValues={{ rating: 5 }}
        >
          <Form.Item
            label="Client Name"
            name="name"
            rules={[{ required: true, message: "Please enter the client's name!" }]}
          >
            <Input />
          </Form.Item>

          <Form.Item
            label="Rating"
            name="rating"
            rules={[{ required: true, message: "Please select a rating!" }]}
          >
            <Rate />
          </Form.Item>

          <Form.Item
            label="Description"
            name="description"
            rules={[{ required: true, message: "Please enter the description!" }]}
          >
            <Input.TextArea rows={4} />
          </Form.Item>

          <Form.Item
            label="Client Image"
            name="image"
            rules={[{ required: true, message: "Please upload the client's image!" }]}
          >
            <Upload
              action="/upload" // Set your upload endpoint here
              listType="picture-card"
              showUploadList={false}
              customRequest={({ file, onSuccess }) => {
                setTimeout(() => {
                  onSuccess("ok");
                }, 0);
              }}
            >
              <Button icon={<UploadOutlined />}>Upload</Button>
            </Upload>
          </Form.Item>

          <Form.Item>
            <Button type="primary" htmlType="submit" style={{ width: "100%" }}>
              Create Testimonial
            </Button>
          </Form.Item>
        </Form>
      </Modal>
    </div>
  );
};

export default Testimonial;
