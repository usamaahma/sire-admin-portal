import React, { useState } from 'react';
import { Table, Button, Space, Modal, Form, Input, Upload, message } from 'antd';
import { EyeOutlined, EditOutlined, DeleteOutlined, PlusOutlined } from '@ant-design/icons';
import { UploadOutlined } from '@ant-design/icons'; // Correct icon import

const Portfolio = () => {
  // State for portfolio data
  const [portfolio, setPortfolio] = useState([
    {
      id: 1,
      title: 'Project 1',
      image: 'https://via.placeholder.com/100',
      tag: 'Web Development',
    },
    {
      id: 2,
      title: 'Project 2',
      image: 'https://via.placeholder.com/100',
      tag: 'Mobile App',
    },
    {
      id: 3,
      title: 'Project 3',
      image: 'https://via.placeholder.com/100',
      tag: 'Design',
    },
  ]);

  // State for modal visibility
  const [isModalVisible, setIsModalVisible] = useState(false);
  
  // Form state for creating portfolio
  const [form] = Form.useForm();

  // Handle view button click
  const handleView = (id) => {
    console.log('View Portfolio Item ID:', id);
    // Add your view portfolio logic here
  };

  // Handle edit button click
  const handleEdit = (id) => {
    console.log('Edit Portfolio Item ID:', id);
    // Add your edit portfolio logic here
  };

  // Handle delete button click
  const handleDelete = (id) => {
    console.log('Delete Portfolio Item ID:', id);
    setPortfolio(portfolio.filter((item) => item.id !== id));
  };

  // Handle Create Portfolio button click
  const handleCreate = () => {
    form.validateFields().then(values => {
      const newPortfolio = {
        id: portfolio.length + 1,
        title: values.title,
        image: values.image[0]?.url || 'https://via.placeholder.com/100', // If no image selected, placeholder
        tag: values.tag,
      };

      setPortfolio([...portfolio, newPortfolio]);
      message.success('Portfolio created successfully!');
      setIsModalVisible(false);
      form.resetFields(); // Reset form fields after successful creation
    }).catch(info => {
      console.log('Validate Failed:', info);
    });
  };

  // Table columns definition
  const columns = [
    {
      title: 'Title',
      dataIndex: 'title',
      key: 'title',
    },
    {
      title: 'Image',
      dataIndex: 'image',
      key: 'image',
      render: (image) => <img src={image} alt="Portfolio" style={{ width: '100px' }} />, // Render image thumbnail
    },
    {
      title: 'Tag',
      dataIndex: 'tag',
      key: 'tag',
    },
    {
      title: 'Action',
      key: 'action',
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
        </Space>
      ),
    },
  ];

  return (
    <div>
      <h2>Portfolio Management</h2>
      {/* Create Portfolio Button */}
      <Button
        type="primary"
        icon={<PlusOutlined />}
        onClick={() => setIsModalVisible(true)}
        style={{ marginBottom: '20px' }}
      >
        Create Portfolio
      </Button>

      {/* Portfolio Table */}
      <Table
        columns={columns}
        dataSource={portfolio}
        rowKey="id"
        pagination={{ pageSize: 5 }}
      />

      {/* Modal for creating portfolio */}
      <Modal
        title="Create Portfolio"
        visible={isModalVisible}
        onCancel={() => setIsModalVisible(false)}
        footer={null}
      >
        <Form
          form={form}
          layout="vertical"
          onFinish={handleCreate}
        >
          <Form.Item
            label="Title"
            name="title"
            rules={[{ required: true, message: 'Please input the portfolio title!' }]}
          >
            <Input placeholder="Enter portfolio title" />
          </Form.Item>

          <Form.Item
            label="Relation Tag"
            name="tag"
            rules={[{ required: true, message: 'Please input a relation tag!' }]}
          >
            <Input placeholder="Enter relation tag (e.g., Web Development, Mobile App)" />
          </Form.Item>

          <Form.Item
            label="Image"
            name="image"
            valuePropName="fileList"
            getValueFromEvent={({ fileList }) => fileList}
            extra="Select an image to represent the portfolio."
          >
            <Upload
              name="image"
              listType="picture-card"
              action="/upload"
              showUploadList={{ showPreviewIcon: false }}
              accept="image/*"
              beforeUpload={() => false} // Prevent upload on submit
            >
              <div>
                <UploadOutlined />
                <div style={{ marginTop: 8 }}>Upload</div>
              </div>
            </Upload>
          </Form.Item>

          <Form.Item>
            <Space>
              <Button onClick={() => setIsModalVisible(false)}>Cancel</Button>
              <Button type="primary" htmlType="submit">
                Create Portfolio
              </Button>
            </Space>
          </Form.Item>
        </Form>
      </Modal>
    </div>
  );
};

export default Portfolio;
