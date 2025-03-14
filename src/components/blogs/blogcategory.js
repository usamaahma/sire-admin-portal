import React, { useState } from 'react';
import { Table, Button, Modal, Input, message } from 'antd'; // Importing Ant Design components

const Blogcategory = () => {
  const [categories, setCategories] = useState([]); // To store categories
  const [isModalVisible, setIsModalVisible] = useState(false); // Modal visibility state
  const [newCategoryTitle, setNewCategoryTitle] = useState(''); // Input value for new category

  // Handle the modal open
  const showModal = () => {
    setIsModalVisible(true);
  };

  // Handle modal close
  const handleCancel = () => {
    setIsModalVisible(false);
  };

  // Handle adding new category
  const handleAddCategory = () => {
    if (newCategoryTitle.trim() === '') {
      message.error('Category title cannot be empty!');
      return;
    }

    // Add new category to the categories list
    setCategories([
      ...categories,
      {
        key: categories.length + 1, // Assign a new unique key
        title: newCategoryTitle,
      },
    ]);
    setNewCategoryTitle(''); // Clear input
    setIsModalVisible(false); // Close modal
  };

  // Define the table columns
  const columns = [
    {
      title: 'Category Title',
      dataIndex: 'title',
      key: 'title',
    },
  ];

  return (
    <div>
     {/* / */}

      {/* Button to create a new category */}
      <Button style={{marginTop:"1rem"}} type="primary" onClick={showModal}>
        Create Blog Category
      </Button>

      {/* Table to display blog categories */}
      <Table
        columns={columns}
        dataSource={categories} // Populate table with categories
        rowKey="key" // Unique key for each row
        style={{ marginTop: 20 }}
      />

      {/* Modal to add new category */}
      <Modal
        title="Add New Category"
        visible={isModalVisible}
        onCancel={handleCancel}
        footer={null}
      >
        <div>
          <Input
            placeholder="Enter Category Title"
            value={newCategoryTitle}
            onChange={(e) => setNewCategoryTitle(e.target.value)} // Handle input change
          />
          <div style={{ marginTop: 20, textAlign: 'right' }}>
            <Button onClick={handleCancel} style={{ marginRight: 10 }}>
              Cancel
            </Button>
            <Button type="primary" onClick={handleAddCategory}>
              Add Category
            </Button>
          </div>
        </div>
      </Modal>
    </div>
  );
};

export default Blogcategory;
