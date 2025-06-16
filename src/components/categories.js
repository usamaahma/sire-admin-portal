import { useState, useEffect } from "react";
import {
  Table,
  Button,
  Space,
  Modal,
  message,
  Form,
  Input,
  Image,
  Row,
  Col,
  Card,
  Divider,
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
  ArrowDownOutlined,
  FolderAddOutlined,
} from "@ant-design/icons";
import CloudinaryUploader from "./cloudinary/CloudinaryUploader";
import { category } from "../utils/axios";
import Subcategory from "./sub-category";
import "./categories.css";

const Categories = ({ setActiveContent }) => {
  const [selectedCategoryId, setSelectedCategoryId] = useState(null);
  const [categories, setCategories] = useState([]);
  const [isModalVisible, setIsModalVisible] = useState(false);
  const [isViewModalVisible, setIsViewModalVisible] = useState(false);
  const [isEditModalVisible, setIsEditModalVisible] = useState(false);
  const [isSortModalVisible, setIsSortModalVisible] = useState(false);
  const [selectedCategory, setSelectedCategory] = useState(null);
  const [sortedCategories, setSortedCategories] = useState([]);
  const [form] = Form.useForm();

  // Cloudinary configuration
  const cloudName = "dxhpud7sx"; // Replace with your Cloudinary cloud name
  const uploadPreset = "sireprinting"; // Replace with your Cloudinary upload preset

  // Fetch categories on mount
  useEffect(() => {
    const fetchCategories = async () => {
      try {
        const response = await category.get("/");
        console.log("API Response:", response.data); // Debug API data
        const formattedData = response.data.map((item, index) => ({
          id: index + 1,
          _id: item._id,
          shortTitle: item.title,
          description: item.description,
          categoryImage: item.image,
          pageImage: item.pageImage,
          descriptionTitle: item.descriptionTitle,
          seoTitle: item.seoTitle,
          seoDescription: item.seoDescription,
          seoKeywords: item.seoKeyword,
          detailTitle: item.detailTitle,
          detailSubtitle: item.detailSubtitle,
          details: item.details || [],
        }));
        setCategories(formattedData);
      } catch (error) {
        console.error("Error fetching categories:", error);
        message.error("Failed to load categories. Please try again later.");
      }
    };

    fetchCategories();
  }, []);

  // View Category
  const handleView = (id) => {
    const category = categories.find((category) => category._id === id);
    if (!category) {
      console.error("Category not found for ID:", id);
      return;
    }
    setSelectedCategory(category);
    setIsViewModalVisible(true);
  };

  // Edit Category
const handleEdit = (id) => {
  const category = categories.find((category) => category._id === id);
  if (!category) {
    console.error("Category not found for ID:", id);
    return;
  }

  const formValues = {
    shortTitle: category.shortTitle || "",
    description: category.description || "",
    descriptionTitle: category.descriptionTitle || "",
    seoTitle: category.seoTitle || "",
    seoDescription: category.seoDescription || "",
    seoKeywords: category.seoKeywords?.split(",").map((k) => k.trim()) || [],
    detailTitle: category.detailTitle || "",
    detailSubtitle: category.detailSubtitle || "",
    categoryImage: category.categoryImage
      ? [
          {
            uid: "-1",
            name: "category-image.png",
            status: "done",
            url: category.categoryImage,
            thumbUrl: category.categoryImage,
          },
        ]
      : [],
    pageImage: category.pageImage
      ? [
          {
            uid: "-2",
            name: "page-image.png",
            status: "done",
            url: category.pageImage,
            thumbUrl: category.pageImage,
          },
        ]
      : [],
    details: (category.details || []).map((detail, index) => ({
      detailDescription: detail.detailDescription || "",
      image: detail.image
        ? [
            {
              uid: `detail-${index}`,
              name: `detail-image-${index}.png`,
              status: "done",
              url: detail.image,
              thumbUrl: detail.image,
            },
          ]
        : [], // Ensure this is always an array
    })),
  };

  console.log("Form Values for Edit:", formValues);
  form.setFieldsValue(formValues);
  setSelectedCategory(category);
  setIsEditModalVisible(true);
};

  // Handle cancel for edit modal
  const handleCancelEdit = () => {
    form.resetFields();
    setIsEditModalVisible(false);
    setSelectedCategory(null);
  };

  // Delete Category
  const handleDelete = async (id) => {
    Modal.confirm({
      title: "Are you sure you want to delete this category?",
      onOk: async () => {
        try {
          await category.delete(`/${id}`);
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
  const handleSortProducts = () => {
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
      const orderData = sortedCategories.map((cat, index) => ({
        id: cat._id,
        order: index + 1,
      }));

      await category.post("/sort", orderData);
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

  // Handle Cloudinary upload success
  const handleUploadSuccess = (fieldName, data, formFieldName) => {
    if (Array.isArray(data)) {
      // Handle image removal (data is the updated fileList)
      if (Array.isArray(formFieldName)) {
        const currentDetails = form.getFieldValue("details") || [];
        const updatedDetails = [...currentDetails];
        const detailIndex = formFieldName[1];
        updatedDetails[detailIndex].image = data;
        form.setFieldsValue({ details: updatedDetails });
      } else {
        form.setFieldsValue({ [formFieldName]: data });
      }
    } else if (data?.url) {
      // Handle image upload
      const newFileList = [
        {
          uid: data.uid,
          name: data.name,
          status: data.status,
          url: data.url,
          thumbUrl: data.thumbUrl,
        },
      ];

      if (Array.isArray(formFieldName)) {
        const currentDetails = form.getFieldValue("details") || [];
        const updatedDetails = [...currentDetails];
        const detailIndex = formFieldName[1];

        if (!updatedDetails[detailIndex]) {
          updatedDetails[detailIndex] = {};
        }

        updatedDetails[detailIndex].image = newFileList;
        form.setFieldsValue({ details: updatedDetails });
      } else {
        form.setFieldsValue({ [formFieldName]: newFileList });
      }
    } else {
      message.error("Image upload failed!");
    }
  };

  // Handle form submission for add
  const handleSubmit = async (values) => {
    try {
      const categoryData = {
        title: values.shortTitle,
        image:
          values.categoryImage?.[0]?.url || "https://via.placeholder.com/150",
        pageImage:
          values.pageImage?.[0]?.url || "https://via.placeholder.com/300",
        description: values.description,
        descriptionTitle: values.descriptionTitle,
        seoTitle: values.seoTitle,
        seoKeyword: Array.isArray(values.seoKeywords)
          ? values.seoKeywords.join(", ")
          : values.seoKeywords,
        seoDescription: values.seoDescription,
        detailTitle: values.detailTitle,
        detailSubtitle: values.detailSubtitle,
        details:
          values.details?.map((detail) => ({
            detailDescription: detail.detailDescription,
            image: detail.image?.[0]?.url || "https://via.placeholder.com/100",
          })) || [],
      };

      const response = await category.post("/", categoryData);
      const newCategory = {
        id: categories.length + 1,
        _id: response.data._id,
        shortTitle: response.data.title,
        description: response.data.description,
        categoryImage: response.data.image,
        pageImage: response.data.pageImage,
        descriptionTitle: response.data.descriptionTitle,
        seoTitle: response.data.seoTitle,
        seoDescription: response.data.seoDescription,
        seoKeywords: response.data.seoKeyword,
        detailTitle: response.data.detailTitle,
        detailSubtitle: response.data.detailSubtitle,
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
        image: values.categoryImage?.[0]?.url || selectedCategory.categoryImage,
        pageImage: values.pageImage?.[0]?.url || selectedCategory.pageImage,
        description: values.description,
        descriptionTitle: values.descriptionTitle,
        seoTitle: values.seoTitle,
        seoKeyword: Array.isArray(values.seoKeywords)
          ? values.seoKeywords.join(", ")
          : values.seoKeywords,
        seoDescription: values.seoDescription,
        detailTitle: values.detailTitle,
        detailSubtitle: values.detailSubtitle,
        details:
          values.details?.map((detail, index) => ({
            detailDescription: detail.detailDescription,
            image:
              detail.image?.[0]?.url ||
              selectedCategory.details?.[index]?.image ||
              "https://via.placeholder.com/100",
          })) || [],
      };

      await category.patch(`/${selectedCategory._id}`, categoryData);

      const updatedCategory = {
        ...selectedCategory,
        ...categoryData,
        categoryImage: categoryData.image,
        pageImage: categoryData.pageImage,
        descriptionTitle: categoryData.descriptionTitle,
        seoTitle: categoryData.seoTitle,
        seoKeywords: categoryData.seoKeyword,
        detailTitle: categoryData.detailTitle,
        detailSubtitle: categoryData.detailSubtitle,
        details: categoryData.details,
      };

      const updatedCategories = categories.map((category) =>
        category._id === selectedCategory._id ? updatedCategory : category
      );

      setCategories(updatedCategories);
      message.success("Category updated successfully!");
      setIsEditModalVisible(false);
    } catch (error) {
      console.error("Error updating category:", error);
      message.error("Failed to update category. Please try again.");
    }
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
            icon={<EyeOutlined />}
            onClick={() => handleView(record._id)}
            title="View"
          />
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
              setSelectedCategoryId(record._id);
              localStorage.setItem("selectedCategoryId", record._id);
              setActiveContent("Subcategory");
            }}
            title="Add Subcategory"
          />
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
        open={isModalVisible}
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
                <CloudinaryUploader
                  uploadPreset={uploadPreset}
                  cloudName={cloudName}
                  listType="picture-card"
                  fileList={form.getFieldValue("categoryImage") || []}
                  onUploadSuccess={(data) =>
                    handleUploadSuccess("categoryImage", data, "categoryImage")
                  }
                />
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
                <CloudinaryUploader
                  uploadPreset={uploadPreset}
                  cloudName={cloudName}
                  listType="picture-card"
                  fileList={form.getFieldValue("pageImage") || []}
                  onUploadSuccess={(data) =>
                    handleUploadSuccess("pageImage", data, "pageImage")
                  }
                />
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

          {/* <Form.Item
            label="SEO Keywords"
            name="seoKeywords"
            rules={[{ required: true, message: "Please enter SEO keywords" }]}
          >
            <Input placeholder="e.g. electronics, gadgets, smart devices" />
          </Form.Item> */}

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
                          getValueFromEvent={(e) =>
                            Array.isArray(e) ? e : e?.fileList || []
                          }
                        >
                          <CloudinaryUploader
                            uploadPreset={uploadPreset}
                            cloudName={cloudName}
                            listType="picture-card"
                            fileList={
                              form.getFieldValue(["details", name, "image"]) || []
                            }
                            onUploadSuccess={(data) =>
                              handleUploadSuccess(
                                `details[${name}].image`,
                                data,
                                ["details", name]
                              )
                            }
                          />
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
                    disabled={fields.length >= 5}
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

      {/* Edit Category Modal */}
      <Modal
        title={`Edit Category: ${selectedCategory?.shortTitle}`}
        open={isEditModalVisible}
        onCancel={handleCancelEdit}
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
                  <Input placeholder="e.g. Electronics" />
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
                  <CloudinaryUploader
                    uploadPreset={uploadPreset}
                    cloudName={cloudName}
                    listType="picture-card"
                    fileList={form.getFieldValue("categoryImage") || []}
                    onUploadSuccess={(data) =>
                      handleUploadSuccess("categoryImage", data, "categoryImage")
                    }
                  />
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
                  <CloudinaryUploader
                    uploadPreset={uploadPreset}
                    cloudName={cloudName}
                    listType="picture-card"
                    fileList={form.getFieldValue("pageImage") || []}
                    onUploadSuccess={(data) =>
                      handleUploadSuccess("pageImage", data, "pageImage")
                    }
                  />
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

            {/* <Form.Item
              label="SEO Keywords"
              name="seoKeywords"
              rules={[{ required: true, message: "Please enter keywords" }]}
            >
              <Input placeholder="e.g. electronics, gadgets, smart devices" />
            </Form.Item> */}

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
                            getValueFromEvent={(e) =>
                              Array.isArray(e) ? e : e?.fileList || []
                            }
                          >
                            <CloudinaryUploader
                              cloudName={cloudName}
                              uploadPreset={uploadPreset}
                              listType="picture-card"
                              fileList={
                                form.getFieldValue(["details", name, "image"]) ||
                                []
                              }
                              onUploadSuccess={(data) =>
                                handleUploadSuccess(
                                  `details[${name}].image`,
                                  data,
                                  ["details", name]
                                )
                              }
                            />
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
                      disabled={fields.length >= 5}
                    >
                      Add New Detail
                    </Button>
                  </Form.Item>
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

      {/* View Category Modal */}
      <Modal
        title={`View Category: ${selectedCategory?.shortTitle}`}
        open={isViewModalVisible}
        onCancel={() => setIsViewModalVisible(false)}
        footer={[
          <Button key="close" onClick={() => setIsViewModalVisible(false)}>
            Close
          </Button>,
        ]}
        width={800}
      >
        {selectedCategory && (
          <div>
            <Row gutter={16}>
              <Col span={12}>
                <h4>Category Title</h4>
                <p>{selectedCategory.shortTitle}</p>
              </Col>
            </Row>

            <h4>Description</h4>
            <p>{selectedCategory.description}</p>

            <Row gutter={16}>
              <Col span={12}>
                <h4>Category Image</h4>
                <Image
                  src={selectedCategory.categoryImage}
                  width={150}
                  style={{ borderRadius: 4 }}
                />
              </Col>
              <Col span={12}>
                <h4>Page Image</h4>
                <Image
                  src={selectedCategory.pageImage}
                  width={150}
                  style={{ borderRadius: 4 }}
                />
              </Col>
            </Row>

            <h4>SEO Title</h4>
            <p>{selectedCategory.seoTitle}</p>

            <h4>SEO Description</h4>
            <p>{selectedCategory.seoDescription}</p>

            {/* <h4>SEO Keywords</h4>
            <p>{selectedCategory.seoKeywords}</p> */}

            <Row gutter={16}>
              <Col span={12}>
                <h4>Detail Title</h4>
                <p>{selectedCategory.detailTitle}</p>
              </Col>
              <Col span={12}>
                <h4>Detail Subtitle</h4>
                <p>{selectedCategory.detailSubtitle}</p>
              </Col>
            </Row>

            <Divider orientation="left">Details</Divider>
            {selectedCategory.details?.map((detail, index) => (
              <Card
                key={index}
                type="inner"
                title={`Detail ${index + 1}`}
                style={{ marginBottom: 24 }}
              >
                <h4>Detail Description</h4>
                <p>{detail.detailDescription}</p>
                <h4>Detail Image</h4>
                <Image
                  src={detail.image}
                  width={100}
                  style={{ borderRadius: 4 }}
                />
              </Card>
            ))}
          </div>
        )}
      </Modal>

      {/* Sort Categories Modal */}
      <Modal
        title="Sort Categories"
        open={isSortModalVisible}
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