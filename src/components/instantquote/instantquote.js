import { useEffect, useState } from "react";
import { Table, Spin, message, Modal, Button, Card } from "antd";
import { instantquot } from "../../utils/axios";
import "./instantquote.css";
import { ExclamationCircleOutlined, DeleteOutlined } from '@ant-design/icons';

const { confirm } = Modal;

function Instantquote() {
  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = () => {
    setLoading(true);
    instantquot
      .get("/")
      .then((response) => {
        setData(response.data);
      })
      .catch((error) => {
        message.error("Failed to load data");
        console.error(error);
      })
      .finally(() => setLoading(false));
  };

  const handleDelete = (id) => {
    confirm({
      title: 'Are you sure you want to delete this quote?',
      icon: <ExclamationCircleOutlined />,
      content: 'This action cannot be undone',
      okText: 'Yes, delete it',
      okType: 'danger',
      cancelText: 'No, cancel',
      onOk() {
        return new Promise((resolve, reject) => {
          instantquot.delete(`/${id}`)
            .then(() => {
              message.success('Quote deleted successfully');
              fetchData();
              resolve();
            })
            .catch(error => {
              message.error('Failed to delete quote');
              console.error(error);
              reject();
            });
        });
      },
      onCancel() {
        console.log('Deletion cancelled');
      },
    });
  };

  const columns = [
    {
      title: "Name",
      dataIndex: "name",
      key: "name",
      width: 150,
      fixed: 'left',
    },
    {
      title: "Email",
      dataIndex: "email",
      key: "email",
      width: 200,
    },
    {
      title: "Phone",
      dataIndex: "phonenumber",
      key: "phonenumber",
      width: 150,
    },
    {
      title: "Dimensions",
      key: "dimensions",
      width: 200,
      render: (_, record) => (
        <div className="dimensions-cell">
          <span>L: {record.length}{record.unit}</span>
          <span>W: {record.width}{record.unit}</span>
          <span>D: {record.depth}{record.unit}</span>
        </div>
      ),
    },
    {
      title: "Color",
      dataIndex: "color",
      key: "color",
      width: 120,
      render: (color) => <span>{color}</span>, // Simple text display
    },
    {
      title: "Qty",
      dataIndex: "quantity",
      key: "quantity",
      width: 80,
      align: 'center',
    },
    {
      title: "Image",
      dataIndex: "image",
      key: "image",
      width: 120,
      render: (url) => (
        <div className="image-preview">
          <img src={url} alt="Quote" />
        </div>
      ),
    },
    {
      title: "Action",
      key: "action",
      width: 100,
      fixed: 'right',
      render: (_, record) => (
        <Button 
          type="text" 
          danger 
          icon={<DeleteOutlined />}
          onClick={() => handleDelete(record._id)}
          className="action-btn"
        />
      ),
    },
  ];

  return (
    <div className="instantquote-container">
      <Card
        title={<h2 style={{ margin: 0 }}>Instant Quotes</h2>}
        bordered={false}
        className="quote-card"
      >
        <Table 
          columns={columns} 
          dataSource={data} 
          rowKey="_id"
          scroll={{ x: 1300 }}
          loading={loading}
          pagination={{
            pageSize: 10,
            showSizeChanger: true,
            pageSizeOptions: ['10', '20', '50', '100'],
            showTotal: (total) => `Total ${total} quotes`,
          }}
          className="quote-table"
          bordered
          size="middle"
        />
      </Card>
    </div>
  );
}

export default Instantquote;