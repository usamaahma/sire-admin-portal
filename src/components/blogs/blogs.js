import React, { useState } from 'react';
import { Table, Button, Modal, Form, Input, Select, Upload, message, Image } from 'antd';
import { PlusOutlined, EditOutlined, DeleteOutlined, EyeOutlined } from '@ant-design/icons';

const Blog = () => {
  const [isModalVisible, setIsModalVisible] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [selectedBlog, setSelectedBlog] = useState(null); // For editing
  const [form] = Form.useForm();

  // Sample Data for the table
  const blogs = [
    {
      key: '1',
      title: 'Blog 1',
      description: 'This is blog 1 description.',
      image: 'https://via.placeholder.com/150',
    },
    {
      key: '2',
      title: 'Blog 2',
      description: 'This is blog 2 description.',
      image: 'https://via.placeholder.com/150',
    },
  ];

  // Columns for the table
  const columns = [
    {
      title: 'Title',
      dataIndex: 'title',
      key: 'title',
    },
    {
      title: 'Description',
      dataIndex: 'description',
      key: 'description',
    },
    {
      title: 'Image',
      dataIndex: 'image',
      key: 'image',
      render: (text) => (
        <Image
          width={50}
          src={text}
          preview={{ src: text }}
          style={{ cursor: 'pointer' }}
        />
      ),
    },
    {
      title: 'Action',
      key: 'action',
      render: (_, record) => (
        <span>
          <Button icon={<EyeOutlined />} onClick={() => viewBlog(record)} style={{ marginRight: 8 }} />
          <Button icon={<EditOutlined />} onClick={() => editBlog(record)} style={{ marginRight: 8 }} />
          <Button icon={<DeleteOutlined />} onClick={() => deleteBlog(record)} />
        </span>
      ),
    },
  ];

  const showModal = () => {
    setIsModalVisible(true);
    form.resetFields();
    setIsEditing(false); // Reset the editing state
  };

  const handleCancel = () => {
    setIsModalVisible(false);
  };

  const handleOk = () => {
    form
      .validateFields()
      .then((values) => {
        message.success(isEditing ? 'Blog updated successfully' : 'Blog created successfully');
        setIsModalVisible(false);
      })
      .catch((error) => {
        console.log('Failed to submit:', error);
      });
  };

  const editBlog = (blog) => {
    setSelectedBlog(blog);
    setIsEditing(true);
    form.setFieldsValue(blog);
    setIsModalVisible(true);
  };

  const viewBlog = (blog) => {
    message.info(`Viewing ${blog.title}`);
  };

  const deleteBlog = (blog) => {
    message.success(`Deleted ${blog.title}`);
  };

  return (
    <div>
      <h2>Blogs</h2>
      <Button type="primary" icon={<PlusOutlined />} onClick={showModal} style={{ marginBottom: 16 }}>
        Create Blog
      </Button>
      <Table columns={columns} dataSource={blogs} />

      <Modal
        title={isEditing ? 'Edit Blog' : 'Create Blog'}
        visible={isModalVisible}
        onOk={handleOk}
        onCancel={handleCancel}
        footer={[
          <Button key="back" onClick={handleCancel}>
            Cancel
          </Button>,
          <Button key="submit" type="primary" onClick={handleOk}>
            {isEditing ? 'Update' : 'Create'}
          </Button>,
        ]}
      >
        <Form form={form} layout="vertical" name="blog_form" initialValues={{ remember: true }}>
          <Form.Item
            label="Select Category"
            name="category"
            rules={[{ required: true, message: 'Please select a category!' }]}
          >
            <Select placeholder="Select category">
              <Select.Option value="tech">Tech</Select.Option>
              <Select.Option value="lifestyle">Lifestyle</Select.Option>
              <Select.Option value="health">Health</Select.Option>
            </Select>
          </Form.Item>

          <Form.Item
            label="Title"
            name="title"
            rules={[{ required: true, message: 'Please input the title of the blog!' }]}
          >
            <Input />
          </Form.Item>

          <Form.Item
            label="Description"
            name="description"
            rules={[{ required: true, message: 'Please input the description!' }]}
          >
            <Input.TextArea />
          </Form.Item>

          <Form.Item
            label="Tags"
            name="tags"
            rules={[{ required: true, message: 'Please input the tags!' }]}
          >
            <Input />
          </Form.Item>

          <Form.Item
            label="Related Tags"
            name="relatedTags"
            rules={[{ required: true, message: 'Please input the related tags!' }]}
          >
            <Input />
          </Form.Item>

          <Form.Item label="Image" name="image">
            <Upload action="/upload" listType="picture-card" showUploadList={false}>
              <div>
                <PlusOutlined />
                <div style={{ marginTop: 8 }}>Upload Image</div>
              </div>
            </Upload>
          </Form.Item>

          <Form.Item
            label="SEO Heading"
            name="seoHeading"
            rules={[{ required: true, message: 'Please input the SEO heading!' }]}
          >
            <Input />
          </Form.Item>

          <Form.Item
            label="SEO Title"
            name="seoTitle"
            rules={[{ required: true, message: 'Please input the SEO title!' }]}
          >
            <Input />
          </Form.Item>

          <Form.Item
            label="SEO Description"
            name="seoDescription"
            rules={[{ required: true, message: 'Please input the SEO description!' }]}
          >
            <Input.TextArea />
          </Form.Item>

          <Form.Item
            label="SEO Keywords"
            name="seoKeywords"
            rules={[{ required: true, message: 'Please input the SEO keywords!' }]}
          >
            <Input />
          </Form.Item>
        </Form>
      </Modal>
    </div>
  );
};

export default Blog;
