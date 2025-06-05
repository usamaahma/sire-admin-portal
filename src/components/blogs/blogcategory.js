import { useState, useEffect } from 'react';
import { Table, Button, Modal, Input, message, Spin } from 'antd';
import { blogcategorys } from '../../utils/axios'; 

const Blogcategory = () => {
  const [blogCategories, setBlogCategories] = useState([]);
  const [isModalVisible, setIsModalVisible] = useState(false);
  const [newCategoryTitle, setNewCategoryTitle] = useState('');
  const [loading, setLoading] = useState(false);
  const [tableLoading, setTableLoading] = useState(false);

  useEffect(() => {
    fetchBlogCategories();
  }, []);

  const fetchBlogCategories = async () => {
    setTableLoading(true);
    try {
      const response = await blogcategorys.get("/");
      const categoriesData = response.data?.data || [];
      
      setBlogCategories(categoriesData);
    } catch (error) {
      console.error('Fetch error:', error);
      message.error('Failed to fetch categories');
    } finally {
      setTableLoading(false);
    }
  };

  const showModal = () => {
    setIsModalVisible(true);
  };

  const handleCancel = () => {
    setIsModalVisible(false);
    setNewCategoryTitle('');
  };

  const handleAddCategory = async () => {
    if (newCategoryTitle.trim() === '') {
      message.error('Category title cannot be empty!');
      return;
    }

    setLoading(true);
    try {
      const response = await blogcategorys.post("/", { name: newCategoryTitle });
      
      if (!response.data?.data) {
        throw new Error('No data returned from API');
      }
      
      message.success('Category added successfully!');
      setIsModalVisible(false);
      setNewCategoryTitle('');
      fetchBlogCategories(); // Refresh the list
    } catch (error) {
      console.error('Add category error:', error);
      message.error(`Failed to add category: ${error.message}`);
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id) => {
    setLoading(true);
    try {
      await blogcategorys.delete(`/${id}`);
      message.success('Category deleted successfully!');
      fetchBlogCategories(); // Refresh the list
    } catch (error) {
      console.error('Delete error:', error);
      message.error('Failed to delete category');
    } finally {
      setLoading(false);
    }
  };

  const columns = [
    {
      title: 'Sr. No',
      key: 'index',
      render: (text, record, index) => index + 1,
      width: 80,
    },
    {
      title: 'Category Name',
      dataIndex: 'name',
      key: 'name',
    },
    {
      title: 'Actions',
      key: 'actions',
      width: 120,
      render: (_, record) => (
        <Button 
          danger 
          onClick={() => handleDelete(record._id)}
          loading={loading}
        >
          Delete
        </Button>
      ),
    },
  ];

  return (
    <div>
      <Button 
        style={{ marginTop: '1rem', marginBottom: '1rem' }} 
        type="primary" 
        onClick={showModal}
      >
        Create Blog Category
      </Button>

      <Spin spinning={tableLoading}>
        <Table
          columns={columns}
          dataSource={blogCategories}
          rowKey="_id"
          pagination={{ pageSize: 10 }}
          style={{ marginTop: 20 }}
          locale={{
            emptyText: 'No categories found'
          }}
        />
      </Spin>

      <Modal
        title="Add New Category"
        visible={isModalVisible}
        onCancel={handleCancel}
        footer={null}
        destroyOnClose
      >
        <Input
          placeholder="Enter Category Title"
          value={newCategoryTitle}
          onChange={(e) => setNewCategoryTitle(e.target.value)}
          onPressEnter={handleAddCategory}
        />
        <div style={{ marginTop: 20, textAlign: 'right' }}>
          <Button onClick={handleCancel} style={{ marginRight: 10 }}>
            Cancel
          </Button>
          <Button 
            type="primary" 
            onClick={handleAddCategory}
            loading={loading}
          >
            Add Category
          </Button>
        </div>
      </Modal>
    </div>
  );
};

export default Blogcategory;
