import React, { useState } from "react";
import {
  Table,
  Button,
  Space,
  Modal,
  message,
  Form,
  Input,
  Upload,
  Image,
  Row,
  Col,
} from "antd";
import {
  EyeOutlined,
  EditOutlined,
  DeleteOutlined,
  ArrowsAltOutlined,
  PlusOutlined,
} from "@ant-design/icons";
import "./categories.css";

const Categories = () => {
  // Example categories data
  const [categories, setCategories] = useState([
    {
      id: 1,
      shortTitle: "Electronics",
      slug: "electronics",
      description: "All kinds of electronic products",
      image: "https://via.placeholder.com/50",
    },
    {
      id: 2,
      shortTitle: "Furniture",
      slug: "furniture",
      description: "Modern and vintage furniture",
      image: "https://via.placeholder.com/50",
    },
  ]);
  const [isModalVisible, setIsModalVisible] = useState(false);
  const [form] = Form.useForm(); // Ant Design Form hook

  // Function to handle the "view" button
  const handleView = (id) => {
    const category = categories.find((category) => category.id === id);
    console.log("View Category:", category);
    // You can display a detailed view or modal here
  };

  // Function to handle the "edit" button
  const handleEdit = (id) => {
    const category = categories.find((category) => category.id === id);
    console.log("Edit Category:", category);
    // You can open an edit form/modal here
  };

  // Function to handle the "delete" button
  const handleDelete = (id) => {
    Modal.confirm({
      title: "Are you sure you want to delete this category?",
      onOk: () => {
        setCategories(categories.filter((category) => category.id !== id));
        message.success("Category deleted successfully");
      },
    });
  };

  // Function to handle "sort products" button
  const handleSortProducts = (id) => {
    const category = categories.find((category) => category.id === id);
    console.log("Sort Products in Category:", category);
    // You can open a modal to sort products inside this category
  };

  // Function to open the Add Category modal
  const handleAddCategory = () => {
    setIsModalVisible(true);
  };

  // Handle form submission
  const handleSubmit = (values) => {
    const newCategory = {
      id: categories.length + 1,
      ...values,
      image: values.categoryImage ? values.categoryImage.fileList[0].url : "",
      pageImage: values.pageImage ? values.pageImage.fileList[0].url : "",
    };
    setCategories([...categories, newCategory]);
    message.success("Category added successfully!");
    setIsModalVisible(false);
    form.resetFields(); // Reset form fields
  };

  // Table columns configuration
  const columns = [
    {
      title: "ID",
      dataIndex: "id",
      key: "id",
    },
    {
      title: "Short Title",
      dataIndex: "shortTitle",
      key: "shortTitle",
    },
    {
      title: "Slug",
      dataIndex: "slug",
      key: "slug",
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
      render: (text) => <Image src={text} width={50} height={50} />,
    },
    {
      title: "Action",
      key: "action",
      render: (text, record) => (
        <Space size="middle">
          <Button
            type="primary"
            icon={<EyeOutlined />}
            onClick={() => handleView(record.id)}
          >
            View
          </Button>
          <Button
            type="default"
            icon={<EditOutlined />}
            onClick={() => handleEdit(record.id)}
          >
            Edit
          </Button>
          <Button
            danger
            icon={<DeleteOutlined />}
            onClick={() => handleDelete(record.id)}
          >
            Delete
          </Button>
          <Button
            type="dashed"
            icon={<ArrowsAltOutlined />}
            onClick={() => handleSortProducts(record.id)}
          >
            Sort Products
          </Button>
        </Space>
      ),
    },
  ];

  return (
    <div>
      <p>Manage your product categories here.</p>

      {/* Button to open the Add Category Modal */}
      <Button
        type="primary"
        icon={<PlusOutlined />}
        onClick={handleAddCategory}
        style={{ marginBottom: "20px" }}
      >
        Add Category
      </Button>

      {/* Table for Categories */}
      <Table
        columns={columns}
        dataSource={categories}
        rowKey="id"
        pagination={{ pageSize: 5 }} // Optional: Limit the number of rows per page
        scroll={{ x: "max-content" }} // Horizontal scroll for larger content
        bordered // Add borders around the table
        responsive // Automatically adjust table layout based on screen size
        style={{ width: "90%", margin: "0 auto" }} // Adjust the table width and center it
      />

      {/* Modal for Adding Category */}
      <Modal
        title="Add Category"
        visible={isModalVisible}
        onCancel={() => setIsModalVisible(false)}
        footer={null}
      >
        <Form
          form={form}
          onFinish={handleSubmit}
          layout="vertical"
          initialValues={{ rating: 5 }}
        >
          <Form.Item
            label="Category Title"
            name="shortTitle"
            rules={[
              { required: true, message: "Please enter the category title!" },
            ]}
            style={{ textAlign: "left" }} // Align label to the left
          >
            <Input />
          </Form.Item>

          <Form.Item
            label="Page Title"
            name="slug"
            rules={[
              { required: true, message: "Please enter the page title!" },
            ]}
            style={{ textAlign: "left" }} // Align label to the left
          >
            <Input />
          </Form.Item>

          <Form.Item
            label="Description Title"
            name="descriptionTitle"
            rules={[
              {
                required: true,
                message: "Please enter the description title!",
              },
            ]}
            style={{ textAlign: "left" }} // Align label to the left
          >
            <Input />
          </Form.Item>

          <Form.Item
            label="Description"
            name="description"
            rules={[
              { required: true, message: "Please enter the description!" },
            ]}
            style={{ textAlign: "left" }} // Align label to the left
          >
            <Input.TextArea rows={4} />
          </Form.Item>

          <Form.Item
            label="Category Image"
            name="categoryImage"
            rules={[
              { required: true, message: "Please upload the category image!" },
            ]}
            style={{ textAlign: "left" }} // Align label to the left
          >
            <Upload
              action="/upload" // Set your upload endpoint here
              listType="picture"
              showUploadList={false}
              customRequest={({ file, onSuccess }) => {
                setTimeout(() => {
                  onSuccess("ok");
                }, 0);
              }}
            >
              <Button>Upload Image</Button>
            </Upload>
          </Form.Item>

          <Form.Item
            label="Page Image"
            name="pageImage"
            rules={[
              { required: true, message: "Please upload the page image!" },
            ]}
            style={{ textAlign: "left" }} // Align label to the left
          >
            <Upload
              action="/upload" // Set your upload endpoint here
              listType="picture"
              showUploadList={false}
              customRequest={({ file, onSuccess }) => {
                setTimeout(() => {
                  onSuccess("ok");
                }, 0);
              }}
            >
              <Button>Upload Page Image</Button>
            </Upload>
          </Form.Item>

          <Form.Item
            label="SEO Description"
            name="seoDescription"
            rules={[
              { required: true, message: "Please enter the SEO description!" },
            ]}
            style={{ textAlign: "left" }} // Align label to the left
          >
            <Input.TextArea rows={4} />
          </Form.Item>

          <Form.Item
            label="SEO Keywords"
            name="seoKeywords"
            rules={[{ required: true, message: "Please enter SEO keywords!" }]}
            style={{ textAlign: "left" }} // Align label to the left
          >
            <Input />
          </Form.Item>

          <Form.Item>
            <Button type="primary" htmlType="submit" style={{ width: "100%" }}>
              Create Category
            </Button>
          </Form.Item>
        </Form>
      </Modal>
    </div>
  );
};

export default Categories;
