import React, { useState } from 'react';
import { Table, Button, Space, Modal, message } from 'antd';
import { EyeOutlined, DeleteOutlined } from '@ant-design/icons';

const Quote = () => {
  // State for managing the data of quotes
  const [quotes, setQuotes] = useState([
    {
      id: 1,
      name: 'John Doe',
      email: 'john@example.com',
      phone: '+1234567890',
      productname: 'Product A',
      message: 'Looking for a quote for Product A',
      createdAt: '2025-03-01',
    },
    {
      id: 2,
      name: 'Jane Smith',
      email: 'jane@example.com',
      phone: '+1987654321',
      productname: 'Product B',
      message: 'Interested in purchasing Product B',
      createdAt: '2025-03-02',
    },
  ]);

  // Function to handle view button click
  const handleView = (id) => {
    const quote = quotes.find(quote => quote.id === id);
    console.log('View Quote:', quote);
    // You can display detailed information about the quote here
  };

  // Function to handle delete button click with confirmation
  const handleDelete = (id) => {
    Modal.confirm({
      title: 'Are you sure you want to delete this quote?',
      onOk: () => {
        setQuotes(quotes.filter(quote => quote.id !== id));
        message.success('Quote deleted successfully');
      },
    });
  };

  // Table columns definition
  const columns = [
    {
      title: 'Name',
      dataIndex: 'name',
      key: 'name',
    },
    {
      title: 'Email',
      dataIndex: 'email',
      key: 'email',
    },
    {
      title: 'Phone',
      dataIndex: 'phone',
      key: 'phone',
    },
    {
      title: 'Product Name',
      dataIndex: 'productname',
      key: 'productname',
    },
    {
      title: 'Message',
      dataIndex: 'message',
      key: 'message',
    },
    {
      title: 'Created At',
      dataIndex: 'createdAt',
      key: 'createdAt',
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
      <p>Here you can view and manage the quotes you have received.</p>

      {/* Table to display quotes */}
      <Table
        columns={columns}
        dataSource={quotes}
        rowKey="id"
        pagination={{ pageSize: 5 }}
      />
    </div>
  );
};

export default Quote;
