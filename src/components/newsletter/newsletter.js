import React, { useEffect, useState } from 'react';
import { Table, message } from 'antd';
import { newsletter } from "../../utils/axios";
import './newsletter.css';

function Newsletter() {
  const [emails, setEmails] = useState([]);
  const [loading, setLoading] = useState(false);

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
      render: (date) => new Date(date).toLocaleString(), // Format date
    },
  ];

  // Fetch newsletter emails
  const fetchEmails = async () => {
    try {
      setLoading(true);
      const response = await newsletter.get('/'); // Adjust your backend route if needed
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
