import React, { useState } from "react";
import {
  Table,
  Button,
  Space,
  Modal,
  message,
  Form,
  Input,
  Upload,
  Image,
  Row,
  Col,
  Card,
  Tag,
  Divider,
  Select
} from "antd";
import {
  EyeOutlined,
  EditOutlined,
  DeleteOutlined,
  ArrowsAltOutlined,
  PlusOutlined,
  CloseOutlined,
  CheckOutlined,
  ArrowUpOutlined,
  ArrowDownOutlined
} from "@ant-design/icons";
import "./categories.css";

const Categories = () => {
  // Example categories data
  const [categories, setCategories] = useState([
    {
      id: 1,
      shortTitle: "Electronics",
      descriptionTitle: "Electronics Collection",
      description: "All kinds of electronic products",
      categoryImage: "https://via.placeholder.com/150",
      pageImage: "https://via.placeholder.com/300",
      seoDescription: "Best electronics at great prices",
      seoKeywords: "electronics, gadgets, devices",
    },
    {
      id: 2,
      shortTitle: "Furniture",
      descriptionTitle: "Furniture Collection",
      description: "Modern and vintage furniture",
      categoryImage: "https://via.placeholder.com/150",
      pageImage: "https://via.placeholder.com/300",
      seoDescription: "Quality furniture for your home",
      seoKeywords: "furniture, home, decor",
    },
  ]);

  const [isModalVisible, setIsModalVisible] = useState(false);
  const [isViewModalVisible, setIsViewModalVisible] = useState(false);
  const [isEditModalVisible, setIsEditModalVisible] = useState(false);
  const [isSortModalVisible, setIsSortModalVisible] = useState(false);
  const [selectedCategory, setSelectedCategory] = useState(null);
  const [sortedCategories, setSortedCategories] = useState([]);
  const [form] = Form.useForm();

  // View Category
  const handleView = (id) => {
    const category = categories.find((category) => category.id === id);
    setSelectedCategory(category);
    setIsViewModalVisible(true);
  };

  // Edit Category
  const handleEdit = (id) => {
    const category = categories.find((category) => category.id === id);
    setSelectedCategory(category);
    
    form.setFieldsValue({
      ...category,
      categoryImage: category.categoryImage ? [{
        uid: '-1',
        name: 'current-image.png',
        status: 'done',
        url: category.categoryImage,
      }] : [],
      pageImage: category.pageImage ? [{
        uid: '-2',
        name: 'current-page-image.png',
        status: 'done',
        url: category.pageImage,
      }] : [],
      seoKeywords: category.seoKeywords.split(',').map(k => k.trim())
    });
    
    setIsEditModalVisible(true);
  };

  // Delete Category
  const handleDelete = (id) => {
    Modal.confirm({
      title: "Are you sure you want to delete this category?",
      onOk: () => {
        setCategories(categories.filter((category) => category.id !== id));
        message.success("Category deleted successfully");
      },
    });
  };

  // Sort Products
  const handleSortProducts = (id) => {
    setSortedCategories([...categories]);
    setIsSortModalVisible(true);
  };

  // Move category up in sorting
  const moveCategoryUp = (index) => {
    if (index === 0) return;
    const newSorted = [...sortedCategories];
    [newSorted[index], newSorted[index - 1]] = [newSorted[index - 1], newSorted[index]];
    setSortedCategories(newSorted);
  };

  // Move category down in sorting
  const moveCategoryDown = (index) => {
    if (index === sortedCategories.length - 1) return;
    const newSorted = [...sortedCategories];
    [newSorted[index], newSorted[index + 1]] = [newSorted[index + 1], newSorted[index]];
    setSortedCategories(newSorted);
  };

  // Save sorted categories
  const saveSortedCategories = () => {
    setCategories(sortedCategories);
    message.success("Categories order saved successfully!");
    setIsSortModalVisible(false);
  };

  // Add new category
  const handleAddCategory = () => {
    form.resetFields();
    setIsModalVisible(true);
  };

  // Handle form submission for add
  const handleSubmit = (values) => {
    const newCategory = {
      id: categories.length + 1,
      ...values,
      categoryImage: values.categoryImage?.[0]?.thumbUrl || "https://via.placeholder.com/150",
      pageImage: values.pageImage?.[0]?.thumbUrl || "https://via.placeholder.com/300",
      seoKeywords: values.seoKeywords.join(', ')
    };
    setCategories([...categories, newCategory]);
    message.success("Category added successfully!");
    setIsModalVisible(false);
  };

  // Handle form submission for edit
  const handleEditSubmit = (values) => {
    const updatedCategory = {
      ...selectedCategory,
      ...values,
      categoryImage: values.categoryImage?.[0]?.thumbUrl || 
                    values.categoryImage?.[0]?.url || 
                    selectedCategory.categoryImage,
      pageImage: values.pageImage?.[0]?.thumbUrl || 
                values.pageImage?.[0]?.url || 
                selectedCategory.pageImage,
      seoKeywords: Array.isArray(values.seoKeywords) ? 
                 values.seoKeywords.join(', ') : 
                 values.seoKeywords
    };

    const updatedCategories = categories.map(category => 
      category.id === selectedCategory.id ? updatedCategory : category
    );
    
    setCategories(updatedCategories);
    message.success("Category updated successfully!");
    setIsEditModalVisible(false);
  };

  // Table columns configuration
  const columns = [
    {
      title: "ID",
      dataIndex: "id",
      key: "id",
      width: 80,
    },
    {
      title: "Short Title",
      dataIndex: "shortTitle",
      key: "shortTitle",
      render: (text) => <strong>{text}</strong>,
    },
    {
      title: "Description",
      dataIndex: "description",
      key: "description",
      ellipsis: true,
    },
    {
      title: "Image",
      dataIndex: "categoryImage",
      key: "image",
      render: (text) => <Image src={text} width={50} height={50} style={{ borderRadius: 4 }} />,
      width: 100,
    },
    {
      title: "Actions",
      key: "action",
      render: (text, record) => (
        <Space size="middle">
          <Button
            type="text"
            icon={<EyeOutlined />}
            onClick={() => handleView(record.id)}
            title="View"
          />
          <Button
            type="text"
            icon={<EditOutlined />}
            onClick={() => handleEdit(record.id)}
            title="Edit"
          />
          <Button
            type="text"
            danger
            icon={<DeleteOutlined />}
            onClick={() => handleDelete(record.id)}
            title="Delete"
          />
          <Button
            type="text"
            icon={<ArrowsAltOutlined />}
            onClick={() => handleSortProducts(record.id)}
            title="Sort Categories"
          />
        </Space>
      ),
      width: 180,
    },
  ];

  return (
    <div className="categories-container">
      <div className="categories-header">
        <h2>Manage Categories</h2>
        <p>Create, edit, and organize your product categories</p>
      </div>

      <div className="categories-actions">
        <Button
          type="primary"
          icon={<PlusOutlined />}
          onClick={handleAddCategory}
        >
          Add Category
        </Button>
      </div>

      <Table
        columns={columns}
        dataSource={categories}
        rowKey="id"
        pagination={{ pageSize: 5 }}
        scroll={{ x: "max-content" }}
        bordered
        style={{ background: "#fff", borderRadius: 8 }}
      />

      {/* Add Category Modal */}
      <Modal
        title="Add New Category"
        visible={isModalVisible}
        onCancel={() => setIsModalVisible(false)}
        footer={null}
        width={800}
      >
        <Form
          form={form}
          onFinish={handleSubmit}
          layout="vertical"
        >
          <Row gutter={16}>
            <Col span={12}>
              <Form.Item
                label="Category Title"
                name="shortTitle"
                rules={[{ required: true, message: "Please enter category title" }]}
              >
                <Input placeholder="e.g. Electronics" />
              </Form.Item>
            </Col>
            <Col span={12}>
              <Form.Item
                label="Description Title"
                name="descriptionTitle"
                rules={[{ required: true, message: "Please enter description title" }]}
              >
                <Input placeholder="e.g. Electronics Collection" />
              </Form.Item>
            </Col>
          </Row>

          <Form.Item
            label="Description"
            name="description"
            rules={[{ required: true, message: "Please enter description" }]}
          >
            <Input.TextArea rows={4} placeholder="Detailed description of the category" />
          </Form.Item>

          <Row gutter={16}>
            <Col span={12}>
              <Form.Item
                label="Category Image"
                name="categoryImage"
                valuePropName="fileList"
                getValueFromEvent={(e) => {
                  if (Array.isArray(e)) return e;
                  return e?.fileList || [];
                }}
              >
                <Upload
                  listType="picture-card"
                  maxCount={1}
                  beforeUpload={() => false}
                >
                  <div>
                    <PlusOutlined />
                    <div style={{ marginTop: 8 }}>Upload</div>
                  </div>
                </Upload>
              </Form.Item>
            </Col>
            <Col span={12}>
              <Form.Item
                label="Page Image"
                name="pageImage"
                valuePropName="fileList"
                getValueFromEvent={(e) => {
                  if (Array.isArray(e)) return e;
                  return e?.fileList || [];
                }}
              >
                <Upload
                  listType="picture-card"
                  maxCount={1}
                  beforeUpload={() => false}
                >
                  <div>
                    <PlusOutlined />
                    <div style={{ marginTop: 8 }}>Upload</div>
                  </div>
                </Upload>
              </Form.Item>
            </Col>
          </Row>

          <Form.Item
            label="SEO Description"
            name="seoDescription"
            rules={[{ required: true, message: "Please enter SEO description" }]}
          >
            <Input.TextArea rows={3} placeholder="SEO meta description" />
          </Form.Item>

          <Form.Item
            label="SEO Keywords"
            name="seoKeywords"
            rules={[{ required: true, message: "Please enter SEO keywords" }]}
          >
            <Select
              mode="tags"
              style={{ width: '100%' }}
              placeholder="Add keywords separated by commas"
              tokenSeparators={[',']}
            />
          </Form.Item>

          <Form.Item>
            <Button type="primary" htmlType="submit" block size="large">
              Create Category
            </Button>
          </Form.Item>
        </Form>
      </Modal>

      {/* View Category Modal */}
      <Modal
        title="Category Details"
        visible={isViewModalVisible}
        onCancel={() => setIsViewModalVisible(false)}
        footer={[
          <Button key="close" onClick={() => setIsViewModalVisible(false)}>
            Close
          </Button>
        ]}
        width={700}
      >
        {selectedCategory && (
          <div className="category-view">
            <Row gutter={16}>
              <Col span={8}>
                <div className="category-image-container">
                  <Image
                    src={selectedCategory.categoryImage}
                    alt={selectedCategory.shortTitle}
                    width="100%"
                    style={{ borderRadius: 8 }}
                  />
                  <p className="image-caption">Category Image</p>
                </div>
              </Col>
              <Col span={16}>
                <div className="category-details">
                  <h2>{selectedCategory.shortTitle}</h2>
                  <p className="description-title">{selectedCategory.descriptionTitle}</p>
                  <p className="description">{selectedCategory.description}</p>
                  
                  <Divider orientation="left">SEO Information</Divider>
                  <p><strong>SEO Description:</strong> {selectedCategory.seoDescription}</p>
                  <p>
                    <strong>SEO Keywords:</strong> 
                    {selectedCategory.seoKeywords.split(',').map(keyword => (
                      <Tag key={keyword.trim()} style={{ marginLeft: 8 }}>{keyword.trim()}</Tag>
                    ))}
                  </p>
                </div>
              </Col>
            </Row>
            <Row style={{ marginTop: 24 }}>
              <Col span={24}>
                <div className="page-image-container">
                  <Image
                    src={selectedCategory.pageImage}
                    alt={selectedCategory.shortTitle}
                    width="100%"
                    style={{ borderRadius: 8 }}
                  />
                  <p className="image-caption">Page Image</p>
                </div>
              </Col>
            </Row>
          </div>
        )}
      </Modal>

      {/* Edit Category Modal */}
      <Modal
        title={`Edit Category: ${selectedCategory?.shortTitle}`}
        visible={isEditModalVisible}
        onCancel={() => setIsEditModalVisible(false)}
        footer={null}
        width={800}
      >
        {selectedCategory && (
          <Form
            form={form}
            onFinish={handleEditSubmit}
            layout="vertical"
          >
            <Row gutter={16}>
              <Col span={12}>
                <Form.Item
                  label="Category Title"
                  name="shortTitle"
                  rules={[{ required: true, message: "Please enter category title" }]}
                >
                  <Input />
                </Form.Item>
              </Col>
              <Col span={12}>
                <Form.Item
                  label="Description Title"
                  name="descriptionTitle"
                  rules={[{ required: true, message: "Please enter description title" }]}
                >
                  <Input />
                </Form.Item>
              </Col>
            </Row>

            <Form.Item
              label="Description"
              name="description"
              rules={[{ required: true, message: "Please enter description" }]}
            >
              <Input.TextArea rows={4} />
            </Form.Item>

            <Row gutter={16}>
              <Col span={12}>
                <Form.Item
                  label="Category Image"
                  name="categoryImage"
                  valuePropName="fileList"
                  getValueFromEvent={(e) => {
                    if (Array.isArray(e)) return e;
                    return e?.fileList || [];
                  }}
                >
                  <Upload
                    listType="picture-card"
                    maxCount={1}
                    beforeUpload={() => false}
                  >
                    {(form.getFieldValue('categoryImage') || []).length >= 1 ? null : (
                      <div>
                        <PlusOutlined />
                        <div style={{ marginTop: 8 }}>Upload</div>
                      </div>
                    )}
                  </Upload>
                </Form.Item>
              </Col>
              <Col span={12}>
                <Form.Item
                  label="Page Image"
                  name="pageImage"
                  valuePropName="fileList"
                  getValueFromEvent={(e) => {
                    if (Array.isArray(e)) return e;
                    return e?.fileList || [];
                  }}
                >
                  <Upload
                    listType="picture-card"
                    maxCount={1}
                    beforeUpload={() => false}
                  >
                    {(form.getFieldValue('pageImage') || []).length >= 1 ? null : (
                      <div>
                        <PlusOutlined />
                        <div style={{ marginTop: 8 }}>Upload</div>
                      </div>
                    )}
                  </Upload>
                </Form.Item>
              </Col>
            </Row>

            <Form.Item
              label="SEO Description"
              name="seoDescription"
              rules={[{ required: true, message: "Please enter SEO description" }]}
            >
              <Input.TextArea rows={3} />
            </Form.Item>

            <Form.Item
              label="SEO Keywords"
              name="seoKeywords"
              rules={[{ required: true, message: "Please enter SEO keywords" }]}
            >
              <Select
                mode="tags"
                style={{ width: '100%' }}
                placeholder="Add keywords separated by commas"
                tokenSeparators={[',']}
              />
            </Form.Item>

            <Form.Item>
              <Button type="primary" htmlType="submit" block size="large">
                Update Category
              </Button>
            </Form.Item>
          </Form>
        )}
      </Modal>

      {/* Sort Categories Modal */}
      <Modal
        title="Sort Categories"
        visible={isSortModalVisible}
        onCancel={() => setIsSortModalVisible(false)}
        footer={[
          <Button key="cancel" onClick={() => setIsSortModalVisible(false)}>
            Cancel
          </Button>,
          <Button 
            key="save" 
            type="primary" 
            onClick={saveSortedCategories}
            icon={<CheckOutlined />}
          >
            Save Order
          </Button>
        ]}
        width={600}
      >
        <div className="sortable-list">
          {sortedCategories.map((category, index) => (
            <Card 
              key={category.id} 
              className="sortable-item"
              style={{ marginBottom: 16 }}
            >
              <Row align="middle" gutter={16}>
                <Col flex="auto">
                  <Space>
                    <Image 
                      src={category.categoryImage} 
                      width={40} 
                      height={40} 
                      preview={false}
                      style={{ borderRadius: 4 }}
                    />
                    <span>{category.shortTitle}</span>
                  </Space>
                </Col>
                <Col>
                  <Space>
                    <Button 
                      icon={<ArrowUpOutlined />} 
                      onClick={() => moveCategoryUp(index)}
                      disabled={index === 0}
                    />
                    <Button 
                      icon={<ArrowDownOutlined />} 
                      onClick={() => moveCategoryDown(index)}
                      disabled={index === sortedCategories.length - 1}
                    />
                  </Space>
                </Col>
              </Row>
            </Card>
          ))}
        </div>
      </Modal>
    </div>
  );
};

export default Categories;
