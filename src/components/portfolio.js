import { useState, useEffect } from "react";
import { Table, Button, Space, Modal, message } from "antd";
import { EyeOutlined, PlusOutlined } from "@ant-design/icons";
import { portfolio, product } from "../utils/axios";

const Portfolio = () => {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(false);
  const [isModalVisible, setIsModalVisible] = useState(false);
  const [selectedProductId, setSelectedProductId] = useState(null);

  // Fetch products on component mount
  useEffect(() => {
    fetchProducts();
  }, []);

  const fetchProducts = async () => {
    setLoading(true);
    try {
      const response = await product.get('/');
      console.log(response,"get wala dataaaaaa");
      setProducts(response.data);
    } catch (error) {
      message.error('Failed to fetch products');
      console.error('Error fetching products:', error);
    } finally {
      setLoading(false);
    }
  };

  // Handle view button click
  const handleView = (id) => {
    console.log("View Product ID:", id);
    // Add your view product logic here
  };

  // Handle Add to Portfolio button click
  const handleAddToPortfolio = (id) => {
    setSelectedProductId(id);
    setIsModalVisible(true);
  };

  // Handle form submission
  const handleSubmit = async () => {
    if (!selectedProductId) return;
    
    try {
      await portfolio.post('/', { productId: selectedProductId });
      message.success('Product added to portfolio successfully!');
      setIsModalVisible(false);
    } catch (error) {
      message.error('Failed to add product to portfolio');
      console.error('Error adding to portfolio:', error);
    }
  };

  // Simplified table columns with only title and image
  const columns = [
    {
      title: "Title",
      dataIndex: "title",
      key: "title",
    },
    {
      title: "Image",
      dataIndex: "image",
      key: "image",
      render: (image) => (
        <img src={image} alt="Product" style={{ width: "100px" }} />
      ),
    },
    {
      title: "Action",
      key: "action",
      render: (_, record) => (
        <Space size="middle">
          <Button
            type="primary"
            icon={<EyeOutlined />}
            onClick={() => handleView(record._id)}
          >
            View
          </Button>
          <Button
            type="primary"
            icon={<PlusOutlined />}
            onClick={() => handleAddToPortfolio(record._id)}
          >
            Add to Portfolio
          </Button>
        </Space>
      ),
    },
  ];

  return (
    <div style={{ padding: "20px" }}>
      <h2>Product Portfolio</h2>
      
      <Table
        columns={columns}
        dataSource={products}
        rowKey="id"
        loading={loading}
        pagination={{ pageSize: 5 }}
        bordered
        style={{ width: "100%", maxWidth: "800px", margin: "0 auto" }}
      />

      <Modal
        title="Add to Portfolio"
        visible={isModalVisible}
        onOk={handleSubmit}
        onCancel={() => setIsModalVisible(false)}
        okText="Confirm"
        cancelText="Cancel"
      >
        <p>Are you sure you want to add this product to your portfolio?</p>
        <p>Product ID: {selectedProductId}</p>
      </Modal>
    </div>
  );
};

export default Portfolio;