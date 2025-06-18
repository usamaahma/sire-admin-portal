import { useEffect, useState } from 'react';
import { Table, message, Popconfirm, Button } from 'antd';
import { dieline } from "../../utils/axios";
import './dielineform.css';

function Dielineform() {
  const [forms, setForms] = useState([]);
  const [loading, setLoading] = useState(false);

  // Delete function
  const handleDelete = async (id) => {
    try {
      setLoading(true);
      await dieline.delete(`/${id}`); // Assuming DELETE /:id is your API route
      setForms(forms.filter(form => form._id !== id));
      message.success('Form deleted successfully');
    } catch (err) {
      message.error('Failed to delete the form');
    } finally {
      setLoading(false);
    }
  };

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
    {
      title: 'Action',
      key: 'action',
      render: (_, record) => (
        <Popconfirm
          title="Are you sure to delete this form?"
          onConfirm={() => handleDelete(record._id)}
          okText="Yes"
          cancelText="No"
        >
          <Button danger type="link">Delete</Button>
        </Popconfirm>
      ),
    },
  ];

  // API call to fetch submissions
  const fetchForms = async () => {
    try {
      setLoading(true);
      const res = await dieline.get('/');
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
