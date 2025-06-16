import { useState, useEffect } from "react";
import { Table, Button, Space, Modal, message } from "antd";
import { PlusOutlined, CheckOutlined } from "@ant-design/icons";
import { portfolio, product } from "../utils/axios";

const Portfolio = () => {
  const [products, setProducts] = useState([]);
  const [portfolioItems, setPortfolioItems] = useState([]);
  const [loading, setLoading] = useState(false);
  const [isModalVisible, setIsModalVisible] = useState(false);
  const [selectedProductId, setSelectedProductId] = useState(null);

  // Fetch products and portfolio items on component mount
  useEffect(() => {
    fetchProducts();
    fetchPortfolioItems();
  }, []);

  const fetchProducts = async () => {
    setLoading(true);
    try {
      const response = await product.get('/');
      setProducts(response.data);
    } catch (error) {
      message.error('Failed to fetch products');
      console.error('Error fetching products:', error);
    } finally {
      setLoading(false);
    }
  };

  const fetchPortfolioItems = async () => {
    try {
      const response = await portfolio.get('/');
      setPortfolioItems(response.data.map(item => item.productId));
    } catch (error) {
      message.error('Failed to fetch portfolio items');
      console.error('Error fetching portfolio items:', error);
    }
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
      // Update the portfolio items state
      setPortfolioItems([...portfolioItems, selectedProductId]);
    } catch (error) {
      message.error('Failed to add product to portfolio');
      console.error('Error adding to portfolio:', error);
    }
  };

  // Check if product is in portfolio
  const isInPortfolio = (productId) => {
    return portfolioItems.includes(productId);
  };

  // Table columns
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
          {isInPortfolio(record._id) ? (
            <Button
              type="primary"
              icon={<CheckOutlined />}
              disabled
              style={{ backgroundColor: '#52c41a', borderColor: '#52c41a' }}
            >
              Added to Portfolio
            </Button>
          ) : (
            <Button
              type="primary"
              icon={<PlusOutlined />}
              onClick={() => handleAddToPortfolio(record._id)}
            >
              Add to Portfolio
            </Button>
          )}
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
        rowKey="_id"
        loading={loading}
        pagination={{ pageSize: 15 }}
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