import  { useEffect, useState } from 'react';
import { Table, message } from 'antd';
import { dieline } from "../../utils/axios";
import './dielineform.css';

function Dielineform() {
  const [forms, setForms] = useState([]);
  const [loading, setLoading] = useState(false);

  // AntD Table columns
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
      title: 'Phone Number',
      dataIndex: 'phoneNumber',
      key: 'phoneNumber',
    },
    {
      title: 'Message',
      dataIndex: 'message',
      key: 'message',
      render: (text) => (
        <div style={{ maxWidth: 300, whiteSpace: 'pre-wrap' }}>{text}</div>
      ),
    },
    {
      title: 'Submitted At',
      dataIndex: 'createdAt',
      key: 'createdAt',
      render: (date) => new Date(date).toLocaleString(),
    },
  ];

  // API call to fetch submissions
  const fetchForms = async () => {
    try {
      setLoading(true);
      const res = await dieline.get('/'); // Change to actual API route if different
      setForms(res.data);
    } catch (err) {
      message.error('Failed to fetch dieline form submissions');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchForms();
  }, []);

  return (
    <div className="dielineform-wrapper">
      <h2>Dieline Form Submissions</h2>
      <Table
        columns={columns}
        dataSource={forms}
        rowKey="_id"
        loading={loading}
        pagination={{ pageSize: 15 }}
        scroll={{ x: true }}
      />
    </div>
  );
}

export default Dielineform;
