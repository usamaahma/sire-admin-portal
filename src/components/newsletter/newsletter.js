import React, { useEffect, useState } from 'react';
import { Table, message, Popconfirm, Button } from 'antd';
import { newsletter } from "../../utils/axios";
import './newsletter.css';

function Newsletter() {
  const [emails, setEmails] = useState([]);
  const [loading, setLoading] = useState(false);

  // DELETE email
  const handleDelete = async (id) => {
    try {
      setLoading(true);
      await newsletter.delete(`/${id}`); // Assuming DELETE /:id works on backend
      setEmails(emails.filter(email => email._id !== id));
      message.success('Email deleted successfully');
    } catch (error) {
      message.error('Failed to delete the email');
    } finally {
      setLoading(false);
    }
  };

  // Table columns
  const columns = [
    {
      title: 'Email',
      dataIndex: 'email',
      key: 'email',
    },
    {
      title: 'Subscribed On',
      dataIndex: 'createdAt',
      key: 'createdAt',
      render: (date) => new Date(date).toLocaleString(),
    },
    {
      title: 'Action',
      key: 'action',
      render: (_, record) => (
        <Popconfirm
          title="Are you sure you want to delete this email?"
          onConfirm={() => handleDelete(record._id)}
          okText="Yes"
          cancelText="No"
        >
          <Button danger type="link">Delete</Button>
        </Popconfirm>
      ),
    },
  ];

  // Fetch newsletter emails
  const fetchEmails = async () => {
    try {
      setLoading(true);
      const response = await newsletter.get('/');
      setEmails(response.data);
    } catch (error) {
      message.error('Failed to load newsletter emails');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchEmails();
  }, []);

  return (
    <div className="newsletter-wrapper">
      <h2>Newsletter Subscriptions</h2>
      <Table
        columns={columns}
        dataSource={emails}
        rowKey="_id"
        loading={loading}
        pagination={{ pageSize: 10 }}
      />
    </div>
  );
}

export default Newsletter;
