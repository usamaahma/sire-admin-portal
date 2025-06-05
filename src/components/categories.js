import { useState, useEffect } from "react";
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
  Select,
} from "antd";
import { category } from "../utils/axios";
import Subcategory from "./sub-category";
import {
  EyeOutlined,
  EditOutlined,
  DeleteOutlined,
  ArrowsAltOutlined,
  PlusOutlined,
  CloseOutlined,
  CheckOutlined,
  ArrowUpOutlined,
  ArrowDownOutlined,
  FolderAddOutlined,
} from "@ant-design/icons";
import "./categories.css";

const Categories = ({ setActiveContent }) => {
  // Example categories data

  const [selectedCategoryId, setSelectedCategoryId] = useState(null);
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

  // Edit Category
  const handleEdit = (id) => {
    const category = categories.find((category) => category._id === id);
    if (!category) {
      console.error("Category not found for ID:", id);
      return;
    }

    // Build form values safely
    const formValues = {
      ...category,
      categoryImage: category.categoryImage
        ? [
            {
              uid: "-1",
              name: "category-image.png",
              status: "done",
              url:
                typeof category.categoryImage === "string"
                  ? category.categoryImage
                  : undefined,
            },
          ]
        : [],
      pageImage: category.pageImage
        ? [
            {
              uid: "-2",
              name: "page-image.png",
              status: "done",
              url:
                typeof category.pageImage === "string"
                  ? category.pageImage
                  : undefined,
            },
          ]
        : [],
      seoKeywords:
        typeof category.seoKeywords === "string"
          ? category.seoKeywords?.split(",").map((k) => k.trim())
          : [],
      details: Array.isArray(category.details)
        ? category.details.map((detail, index) => ({
            detailDescription: detail.detailDescription || "",
            image: detail.image
              ? [
                  {
                    uid: `detail-${index}`,
                    name: `detail-image-${index}.png`,
                    status: "done",
                    url:
                      typeof detail.image === "string"
                        ? detail.image
                        : undefined,
                  },
                ]
              : [],
          }))
        : [],
    };

    form.setFieldsValue(formValues);
    setSelectedCategory(category);
    setIsEditModalVisible(true);
  };

  // Delete Category
  const handleDelete = async (id) => {
    Modal.confirm({
      title: "Are you sure you want to delete this category?",
      onOk: async () => {
        try {
          // ✅ Correct: Send DELETE request with category ID in the URL
          await category.delete(`/${id}`);

          // ✅ Update local state to remove the deleted category
          setCategories(categories.filter((category) => category._id !== id));

          message.success("Category deleted successfully");
        } catch (error) {
          console.error("Error deleting category:", error);
          message.error("Failed to delete category. Please try again.");
        }
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
    [newSorted[index], newSorted[index - 1]] = [
      newSorted[index - 1],
      newSorted[index],
    ];
    setSortedCategories(newSorted);
  };

  // Move category down in sorting
  const moveCategoryDown = (index) => {
    if (index === sortedCategories.length - 1) return;
    const newSorted = [...sortedCategories];
    [newSorted[index], newSorted[index + 1]] = [
      newSorted[index + 1],
      newSorted[index],
    ];
    setSortedCategories(newSorted);
  };

  // Save sorted categories
  const saveSortedCategories = async () => {
    try {
      // Prepare the order data
      const orderData = sortedCategories.map((cat, index) => ({
        id: cat.id,
        order: index + 1,
      }));

      await category.post("/", orderData);
      setCategories(sortedCategories);
      message.success("Categories order saved successfully!");
      setIsSortModalVisible(false);
    } catch (error) {
      console.error("Error saving category order:", error);
      message.error("Failed to save category order. Please try again.");
    }
  };

  // Add new category
  const handleAddCategory = () => {
    form.resetFields();
    setIsModalVisible(true);
  };

  // Handle form submission for add
  const handleSubmit = async (values) => {
    console.log("Form Values:", values);
    try {
      // Prepare the data in the required format
      const categoryData = {
        title: values.shortTitle,
        image: "https://via.placeholder.com/150",
        pageImage: "https://via.placeholder.com/300",
        description: values.description,
        detailTitle: values.detailTitle,
        detailSubtitle: values.detailSubtitle,
        seoTitle: values.seoTitle,
        seoKeyword: Array.isArray(values.seoKeywords)
          ? values.seoKeywords.join(", ")
          : values.seoKeywords,
        seoDescription: values.seoDescription,
        details:
          values.details?.map((detail) => ({
            detailDescription: detail.detailDescription,
            image: "https://via.placeholder.com/100",
          })) || [],
      };
      console.log("categoryData", categoryData);

      // Make the POST request
      const response = await category.post("/", categoryData);
      console.log(response, "dataaaaa post wala");

      // If successful, add the new category to your state
      const newCategory = {
        id: response.data.id, // assuming the API returns the new ID
        shortTitle: response.data.title,
        descriptionTitle: values.descriptionTitle,
        description: response.data.description,
        categoryImage: response.data.image,
        pageImage: response.data.pageImage,
        seoDescription: response.data.seoDescription,
        seoKeywords: response.data.seoKeyword,
        details: response.data.details,
      };

      setCategories([...categories, newCategory]);
      message.success("Category added successfully!");
      setIsModalVisible(false);
    } catch (error) {
      console.error("Error adding category:", error);
      message.error("Failed to add category. Please try again.");
    }
  };

  // Handle form submission for edit
  const handleEditSubmit = async (values) => {
    try {
      const categoryData = {
        title: values.shortTitle,
        image:
          values.categoryImage?.[0]?.thumbUrl || selectedCategory.categoryImage,
        pageImage:
          values.pageImage?.[0]?.thumbUrl || selectedCategory.pageImage,
        description: values.description,
        detailTitle: values.detailTitle,
        detailSubtitle: values.detailSubtitle,
        seoTitle: values.seoTitle,
        seoKeyword: Array.isArray(values.seoKeywords)
          ? values.seoKeywords.join(", ")
          : values.seoKeywords,
        seoDescription: values.seoDescription,
        details:
          values.details?.map((detail) => ({
            detailDescription: detail.detailDescription,
            image: "https://via.placeholder.com/100",
          })) || [],
      };
      // Make the PUT request
      await category.patch(`/${selectedCategory._id}`, categoryData);

      // Update the category in your state
      const updatedCategory = {
        ...selectedCategory,
        ...values,
        categoryImage: categoryData.image,
        pageImage: categoryData.pageImage,
        seoKeywords: categoryData.seoKeyword,
        details: categoryData.details,
      };

      const updatedCategories = categories.map((category) =>
        category.id === selectedCategory.id ? updatedCategory : category
      );

      setCategories(updatedCategories);
      message.success("Category updated successfully!");
      setIsEditModalVisible(false);
    } catch (error) {
      console.error("Error updating category:", error);
      message.error("Failed to update category. Please try again.");
    }
  };
  useEffect(() => {
    const fetchCategories = async () => {
      try {
        const response = await category.get("/");
        console.log(response, "get wala data");
        const formattedData = response.data.map((item, index) => ({
          id: index + 1, // Optional: Use item._id if you want
          shortTitle: item.title, // If there's a `shortTitle`, use that
          description: item.description,
          categoryImage: item.image, // Must match field expected in columns
          ...item, // Keep original props if needed
        }));
        setCategories(formattedData);
      } catch (error) {
        console.error("Error fetching categories:", error);
        message.error("Failed to load categories. Please try again later.");
      }
    };

    fetchCategories();
  }, []);

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
      render: (text) => (
        <Image src={text} width={50} height={50} style={{ borderRadius: 4 }} />
      ),
      width: 100,
    },
    {
      title: "Actions",
      key: "action",
      render: (text, record) => (
        <Space size="middle">
          <Button
            type="text"
            icon={<EditOutlined />}
            onClick={() => handleEdit(record._id)}
            title="Edit"
          />
          <Button
            type="text"
            danger
            icon={<DeleteOutlined />}
            onClick={() => handleDelete(record._id)}
            title="Delete"
          />
          <Button
            type="text"
            icon={<ArrowsAltOutlined />}
            onClick={() => handleSortProducts(record.id)}
            title="Sort Categories"
          />
          <Button
            type="text"
            icon={<FolderAddOutlined />}
            onClick={() => {
              setSelectedCategoryId(record._id); // For local state
              localStorage.setItem("selectedCategoryId", record._id); // ✅ Save to localStorage
              setActiveContent("Subcategory");
            }}
            title="Add Subcategory"
          />

          {/* <Subcategory selectedCategoryId={selectedCategoryId} /> */}
        </Space>
      ),
      width: 250,
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
        pagination={{ pageSize: 10 }}
        scroll={{ x: "100%" }}
        bordered
        style={{
          background: "#fff",
          borderRadius: 8,
          marginTop: 20,
          fontSize: "15px",
        }}
        size="middle"
      />

      {/* Add Category Modal */}
      <Modal
        title="Add New Category"
        visible={isModalVisible}
        onCancel={() => setIsModalVisible(false)}
        footer={null}
        width={800}
      >
        <Form form={form} onFinish={handleSubmit} layout="vertical">
          <Row gutter={16}>
            <Col span={12}>
              <Form.Item
                label="Category Title"
                name="shortTitle"
                rules={[
                  { required: true, message: "Please enter category title" },
                ]}
              >
                <Input placeholder="e.g. Electronics" />
              </Form.Item>
            </Col>
            <Col span={12}>
              <Form.Item
                label="Description Title"
                name="descriptionTitle"
                rules={[
                  { required: true, message: "Please enter description title" },
                ]}
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
            <Input.TextArea
              rows={4}
              placeholder="Detailed description of the category"
            />
          </Form.Item>

          <Row gutter={16}>
            <Col span={12}>
              <Form.Item
                label="Category Image"
                name="categoryImage"
                valuePropName="fileList"
                getValueFromEvent={(e) =>
                  Array.isArray(e) ? e : e?.fileList || []
                }
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
                getValueFromEvent={(e) =>
                  Array.isArray(e) ? e : e?.fileList || []
                }
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
            label="SEO Title"
            name="seoTitle"
            rules={[{ required: true, message: "Please enter SEO title" }]}
          >
            <Input placeholder="Enter SEO title" />
          </Form.Item>
          <Form.Item
            label="SEO Description"
            name="seoDescription"
            rules={[
              { required: true, message: "Please enter SEO description" },
            ]}
          >
            <Input.TextArea rows={3} placeholder="SEO meta description" />
          </Form.Item>

          <Form.Item
            label="SEO Keywords"
            name="seoKeywords"
            rules={[{ required: true, message: "Please enter SEO keywords" }]}
          >
            <Input placeholder="e.g. electronics, gadgets, smart devices" />
          </Form.Item>

          <Row gutter={16}>
            <Col span={12}>
              <Form.Item
                label="Detail Title"
                name="detailTitle"
                rules={[
                  { required: true, message: "Please enter detail title" },
                ]}
              >
                <Input placeholder="e.g. Explore Top Electronics" />
              </Form.Item>
            </Col>
            <Col span={12}>
              <Form.Item
                label="Detail Subtitle"
                name="detailSubtitle"
                rules={[
                  { required: true, message: "Please enter detail subtitle" },
                ]}
              >
                <Input placeholder="e.g. Best brands in one place" />
              </Form.Item>
            </Col>
          </Row>

          <Form.List name="details">
            {(fields, { add, remove }) => (
              <>
                <Divider orientation="left">
                  Details (Description & Image)
                </Divider>
                {fields.map(({ key, name, ...restField }) => (
                  <Card
                    key={key}
                    type="inner"
                    title={`Detail ${key + 1}`}
                    style={{ marginBottom: 24 }}
                    extra={
                      <Button
                        type="text"
                        danger
                        icon={<CloseOutlined />}
                        onClick={() => remove(name)}
                      />
                    }
                  >
                    <Row gutter={16}>
                      <Col span={24}>
                        <Form.Item
                          {...restField}
                          name={[name, "detailDescription"]}
                          label="Detail Description"
                          rules={[
                            {
                              required: true,
                              message: "Please enter detail description",
                            },
                          ]}
                        >
                          <Input.TextArea
                            rows={4}
                            placeholder="Detailed text about this feature or highlight"
                          />
                        </Form.Item>
                      </Col>

                      <Col span={24}>
                        <Form.Item
                          {...restField}
                          name={[name, "image"]}
                          label="Detail Image"
                          valuePropName="fileList"
                          getValueFromEvent={(e) => {
                            if (Array.isArray(e)) return e;
                            return e?.fileList || [];
                          }}
                          rules={[
                            {
                              required: true,
                              message: "Please upload an image",
                            },
                          ]}
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
                  </Card>
                ))}
                <Form.Item>
                  <Button
                    type="dashed"
                    onClick={() => add()}
                    block
                    icon={<PlusOutlined />}
                  >
                    Add New Detail
                  </Button>
                </Form.Item>
              </>
            )}
          </Form.List>

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
          </Button>,
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
                  <p className="description-title">
                    {selectedCategory.descriptionTitle}
                  </p>
                  <p className="description">{selectedCategory.description}</p>

                  <Divider orientation="left">SEO Information</Divider>
                  <p>
                    <strong>SEO Description:</strong>{" "}
                    {selectedCategory.seoDescription}
                  </p>
                  <p>
                    <strong>SEO Keywords:</strong>
                    {selectedCategory.seoKeywords?.split(",").map((keyword) => (
                      <Tag key={keyword.trim()} style={{ marginLeft: 8 }}>
                        {keyword.trim()}
                      </Tag>
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
          <Form form={form} onFinish={handleEditSubmit} layout="vertical">
            <Row gutter={16}>
              <Col span={12}>
                <Form.Item
                  label="Category Title"
                  name="shortTitle"
                  rules={[
                    { required: true, message: "Please enter category title" },
                  ]}
                >
                  <Input />
                </Form.Item>
              </Col>
              <Col span={12}>
                <Form.Item
                  label="Description Title"
                  name="descriptionTitle"
                  rules={[
                    {
                      required: true,
                      message: "Please enter description title",
                    },
                  ]}
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
                  getValueFromEvent={(e) =>
                    Array.isArray(e) ? e : e?.fileList || []
                  }
                >
                  <Upload
                    listType="picture-card"
                    maxCount={1}
                    beforeUpload={() => false}
                  >
                    {(form.getFieldValue("categoryImage") || []).length >=
                    1 ? null : (
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
                  getValueFromEvent={(e) =>
                    Array.isArray(e) ? e : e?.fileList || []
                  }
                >
                  <Upload
                    listType="picture-card"
                    maxCount={1}
                    beforeUpload={() => false}
                  >
                    {(form.getFieldValue("pageImage") || []).length >=
                    1 ? null : (
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
              label="SEO Title"
              name="seoTitle"
              rules={[{ required: true, message: "Please enter SEO title" }]}
            >
              <Input placeholder="Enter SEO title" />
            </Form.Item>

            <Form.Item
              label="SEO Description"
              name="seoDescription"
              rules={[
                { required: true, message: "Please enter SEO description" },
              ]}
            >
              <Input.TextArea rows={3} placeholder="Enter SEO description" />
            </Form.Item>

            <Form.Item
              label="SEO Keywords"
              name="seoKeywords"
              rules={[{ required: true, message: "Please enter SEO keywords" }]}
            >
              <Input placeholder="e.g. electronics, gadgets, smart devices" />
            </Form.Item>

            {/* Form List for Details */}
            <Form.List name="details">
              {(fields, { add, remove }) => (
                <>
                  <Divider orientation="left">
                    Details (Description & Image)
                  </Divider>
                  {fields.map(({ key, name, ...restField }) => (
                    <Card
                      key={key}
                      type="inner"
                      title={`Detail ${key + 1}`}
                      style={{ marginBottom: 24 }}
                      extra={
                        <Button
                          type="text"
                          danger
                          icon={<CloseOutlined />}
                          onClick={() => remove(name)}
                        />
                      }
                    >
                      <Row gutter={16}>
                        <Col span={24}>
                          <Form.Item
                            {...restField}
                            name={[name, "detailDescription"]}
                            label="Detail Description"
                            rules={[
                              {
                                required: true,
                                message: "Please enter detail description",
                              },
                            ]}
                          >
                            <Input.TextArea
                              rows={4}
                              placeholder="Detailed text about this feature or highlight"
                            />
                          </Form.Item>
                        </Col>

                        <Col span={24}>
                          <Form.Item
                            {...restField}
                            name={[name, "image"]}
                            label="Detail Image"
                            valuePropName="fileList"
                            getValueFromEvent={(e) =>
                              Array.isArray(e) ? e : e?.fileList || []
                            }
                            rules={[
                              {
                                required: true,
                                message: "Please upload an image",
                              },
                            ]}
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
                    </Card>
                  ))}
                  {/* <Form.Item>
              <Button type="dashed" onClick={() => add()} block icon={<PlusOutlined />}>
                Add New Detail
              </Button>
            </Form.Item> */}
                </>
              )}
            </Form.List>

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
          </Button>,
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
