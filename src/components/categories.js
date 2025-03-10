import React, { useState } from 'react';
import { Table, Button, Space, Modal, message, Image } from 'antd';
import { EyeOutlined, EditOutlined, DeleteOutlined, ArrowsAltOutlined } from '@ant-design/icons';

const Categories = () => {
  // Example categories data
  const [categories, setCategories] = useState([
    {
      id: 1,
      shortTitle: 'Electronics',
      slug: 'electronics',
      description: 'All kinds of electronic products',
      image: 'https://via.placeholder.com/50',
    },
    {
      id: 2,
      shortTitle: 'Furniture',
      slug: 'furniture',
      description: 'Modern and vintage furniture',
      image: 'https://via.placeholder.com/50',
    },
  ]);

  // Function to handle the "view" button
  const handleView = (id) => {
    const category = categories.find((category) => category.id === id);
    console.log('View Category:', category);
    // You can display a detailed view or modal here
  };

  // Function to handle the "edit" button
  const handleEdit = (id) => {
    const category = categories.find((category) => category.id === id);
    console.log('Edit Category:', category);
    // You can open an edit form/modal here
  };

  // Function to handle the "delete" button
  const handleDelete = (id) => {
    Modal.confirm({
      title: 'Are you sure you want to delete this category?',
      onOk: () => {
        setCategories(categories.filter((category) => category.id !== id));
        message.success('Category deleted successfully');
      },
    });
  };

  // Function to handle "sort products" button
  const handleSortProducts = (id) => {
    const category = categories.find((category) => category.id === id);
    console.log('Sort Products in Category:', category);
    // You can open a modal to sort products inside this category
  };

  // Table columns configuration
  const columns = [
    {
      title: 'ID',
      dataIndex: 'id',
      key: 'id',
    },
    {
      title: 'Short Title',
      dataIndex: 'shortTitle',
      key: 'shortTitle',
    },
    {
      title: 'Slug',
      dataIndex: 'slug',
      key: 'slug',
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
      render: (text) => <Image src={text} width={50} height={50} />,
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

      {/* Table for Categories */}
      <Table
        columns={columns}
        dataSource={categories}
        rowKey="id"
        pagination={{ pageSize: 5 }}
      />
    </div>
  );
};

export default Categories;
