import { useState, useEffect } from "react";
import {
  Table,
  Button,
  Modal,
  Input,
  message,
  Switch,
  Space,
  Popconfirm,
  Card,
  Form,
  Select,
  Divider,
  Tag,
  Tooltip,
  Row,
  Col,
  Typography,
} from "antd";
import {
  PlusOutlined,
  DeleteOutlined,
  EditOutlined,
  CloseOutlined,
  InfoCircleOutlined,
} from "@ant-design/icons";
import ReactQuill from "react-quill";
import "react-quill/dist/quill.snow.css";
import { blogcategorys, blogauthors, blogss } from "../../utils/axios";
import CloudinaryUploader from "../cloudinary/CloudinaryUploader";

const { Title, Text } = Typography;
const { Option } = Select;

const cloudName = "dxhpud7sx";
const uploadPreset = "sireprinting";

const Blog = () => {
  const [blogs, setBlogs] = useState([]);
  const [loading, setLoading] = useState(false);
  const [authors, setAuthors] = useState([]);
  const [categories, setCategories] = useState([]);
  const [form] = Form.useForm();

  // Modal states
  const [modalVisible, setModalVisible] = useState(false);
  const [editingBlog, setEditingBlog] = useState(null);
  const [modalLoading, setModalLoading] = useState(false);

  // Form states
  const [title, setTitle] = useState("");
  const [blogAuthor, setBlogAuthor] = useState("");
  const [blogCategory, setBlogCategory] = useState("");
  const [hasCarousel, setHasCarousel] = useState(false);
  const [mainImage, setMainImage] = useState("");
  const [seoTitle, setSeoTitle] = useState("");
  const [seoDescription, setSeoDescription] = useState("");
  const [details, setDetails] = useState([
    {
      detailTitle: "",
      points: [],
      detailDescription: "",
      images: [],
      table: [],
    },
  ]);

  // Temp states for point input per detail row
  const [pointInputs, setPointInputs] = useState({});
  const [tableInputs, setTableInputs] = useState({});

  useEffect(() => {
    fetchBlogs();
    fetchAuthors();
    fetchCategories();
  }, []);

  const fetchBlogs = async () => {
    setLoading(true);
    try {
      const res = await blogss.get("/");
      setBlogs(res.data);
    } catch (error) {
      message.error("Failed to fetch blogs");
    } finally {
      setLoading(false);
    }
  };

  const fetchAuthors = async () => {
    try {
      const res = await blogauthors.get("/");
      if (res.data && res.data.data) {
        setAuthors(res.data.data);
      } else {
        message.error("Invalid authors data format");
      }
    } catch (error) {
      console.error("Error fetching authors:", error);
      message.error("Failed to fetch authors");
    }
  };

  const fetchCategories = async () => {
    try {
      const res = await blogcategorys.get("/");
      if (res.data && res.data.data) {
        setCategories(res.data.data);
      } else {
        message.error("Invalid categories data format");
      }
    } catch (error) {
      console.error("Error fetching categories:", error);
      message.error("Failed to fetch categories");
    }
  };

  const resetForm = () => {
    form.resetFields();
    setTitle("");
    setBlogAuthor("");
    setBlogCategory("");
    setHasCarousel(false);
    setMainImage("");
    setSeoTitle("");
    setSeoDescription("");
    setDetails([
      {
        detailTitle: "",
        points: [],
        detailDescription: "",
        images: [],
        table: [],
      },
    ]);
    setEditingBlog(null);
    setPointInputs({});
    setTableInputs({});
  };

  const openModal = (blog = null) => {
    if (blog) {
      setEditingBlog(blog);
      setTitle(blog.title || "");
      setBlogAuthor(blog.blogAuthor?._id || "");
      setBlogCategory(blog.blogCategory?._id || "");
      setHasCarousel(blog.hasCarousel || false);
      setMainImage(blog.image || "");
      setSeoTitle(blog.seoTitle || "");
      setSeoDescription(blog.seoDescription || "");

      const fixedDetails = (blog.details || []).map((d) => ({
        detailTitle: d.detailTitle || "",
        points: d.points || [],
        detailDescription: d.detailDescription || "",
        images: d.images || [],
        table: d.table || [],
      }));

      setDetails(
        fixedDetails.length
          ? fixedDetails
          : [
              {
                detailTitle: "",
                points: [],
                detailDescription: "",
                images: [],
                table: [],
              },
            ]
      );
    } else {
      resetForm();
    }
    setModalVisible(true);
  };

  const closeModal = () => {
    setModalVisible(false);
    resetForm();
  };

  // Detail management
  const addDetail = () => {
    setDetails((prev) => [
      ...prev,
      {
        detailTitle: "",
        points: [],
        detailDescription: "",
        images: [],
        table: [],
      },
    ]);
  };

  const removeDetail = (index) => {
    setDetails((prev) => prev.filter((_, i) => i !== index));
    setPointInputs((prev) => {
      const newInputs = { ...prev };
      delete newInputs[index];
      return newInputs;
    });
    setTableInputs((prev) => {
      const newInputs = { ...prev };
      delete newInputs[index];
      return newInputs;
    });
  };

  const updateDetailField = (index, field, value) => {
    setDetails((prev) => {
      const newDetails = [...prev];
      newDetails[index][field] = value;
      return newDetails;
    });
  };

  // Points management
  const addPoint = (detailIndex) => {
    const newPoint = (pointInputs[detailIndex] || "").trim();
    if (!newPoint) {
      message.warning("Point cannot be empty");
      return;
    }
    setDetails((prev) => {
      const newDetails = [...prev];
      newDetails[detailIndex].points = [
        ...(newDetails[detailIndex].points || []),
        newPoint,
      ];
      return newDetails;
    });
    setPointInputs((prev) => ({ ...prev, [detailIndex]: "" }));
  };

  const removePoint = (detailIndex, pointIndex) => {
    setDetails((prev) => {
      const newDetails = [...prev];
      newDetails[detailIndex].points.splice(pointIndex, 1);
      return newDetails;
    });
  };

  // Table points management
  const addTablePoint = (detailIndex, tableIndex) => {
    const newPoint = (tableInputs[`${detailIndex}-${tableIndex}`] || "").trim();
    if (!newPoint) {
      message.warning("Point cannot be empty");
      return;
    }
    setDetails((prev) => {
      const newDetails = [...prev];
      newDetails[detailIndex].table[tableIndex].points = [
        ...(newDetails[detailIndex].table[tableIndex].points || []),
        newPoint,
      ];
      return newDetails;
    });
    setTableInputs((prev) => ({
      ...prev,
      [`${detailIndex}-${tableIndex}`]: "",
    }));
  };

  const removeTablePoint = (detailIndex, tableIndex, pointIndex) => {
    setDetails((prev) => {
      const newDetails = [...prev];
      newDetails[detailIndex].table[tableIndex].points.splice(pointIndex, 1);
      return newDetails;
    });
  };

  const addTable = (detailIndex) => {
    setDetails((prev) => {
      const newDetails = [...prev];
      newDetails[detailIndex].table = [
        ...(newDetails[detailIndex].table || []),
        { title: "", points: [] },
      ];
      return newDetails;
    });
  };

  const removeTable = (detailIndex, tableIndex) => {
    setDetails((prev) => {
      const newDetails = [...prev];
      newDetails[detailIndex].table.splice(tableIndex, 1);
      return newDetails;
    });
  };

  const handleMainImageUpload = (fileList) => {
    // Extract the latest uploaded file's URL
    const latestFile = fileList[fileList.length - 1];
    if (latestFile?.url) {
      setMainImage(latestFile.url);
      message.success("Main image uploaded successfully");
    } else {
      message.error("Failed to upload main image");
    }
  };

  const handleDetailImageUpload = (fileList, detailIndex) => {
    // Extract the latest uploaded file's URL
    const latestFile = fileList[fileList.length - 1];
    if (latestFile?.url) {
      setDetails((prev) => {
        const newDetails = [...prev];
        newDetails[detailIndex].images = [
          ...(newDetails[detailIndex].images || []),
          latestFile.url,
        ];
        return newDetails;
      });
      message.success("Detail image uploaded successfully");
    } else {
      message.error("Failed to upload detail image");
    }
  };

  const handleSubmit = async () => {
    try {
      setModalLoading(true);
      await form.validateFields();

      if (!mainImage) {
        message.error("Main Image is required");
        return;
      }

      const payload = {
        title,
        blogAuthor,
        blogCategory,
        image: mainImage,
        hasCarousel,
        details,
        seoTitle,
        seoDescription,
      };

      if (editingBlog) {
        await blogss.put(`/${editingBlog._id}`, payload);
        message.success("Blog updated successfully");
      } else {
        await blogss.post("/", payload);
        message.success("Blog created successfully");
      }

      closeModal();
      fetchBlogs();
    } catch (error) {
      console.error("Error submitting blog:", error);
      if (error.response) {
        if (error.response.data.errors) {
          const errors = error.response.data.errors;
          Object.keys(errors).forEach((key) => {
            message.error(`${key}: ${errors[key].message}`);
          });
        } else {
          message.error(error.response.data.message || "Failed to save blog");
        }
      } else if (!error.errorFields) {
        message.error("Validation failed");
      }
    } finally {
      setModalLoading(false);
    }
  };

  const deleteBlog = async (id) => {
    try {
      await blogss.delete(`/${id}`);
      message.success("Blog deleted");
      fetchBlogs();
    } catch {
      message.error("Failed to delete blog");
    }
  };

  const columns = [
    {
      title: "Title",
      dataIndex: "title",
      key: "title",
      render: (text) => <Text strong>{text}</Text>,
    },
    {
      title: "Author",
      dataIndex: "blogAuthor",
      key: "author",
      render: (author) => author?.name || "N/A",
    },
    {
      title: "Category",
      dataIndex: "blogCategory",
      key: "category",
      render: (category) => category?.name || "N/A",
    },
    {
      title: "Carousel",
      dataIndex: "hasCarousel",
      key: "carousel",
      render: (val) => (
        <Tag color={val ? "green" : "orange"}>{val ? "Yes" : "No"}</Tag>
      ),
    },
    {
      title: "Image",
      dataIndex: "image",
      key: "image",
      render: (url) =>
        url ? (
          <img
            src={url}
            alt="main"
            style={{
              width: 80,
              height: 80,
              objectFit: "cover",
              borderRadius: 6,
              border: "1px solid #f0f0f0",
            }}
          />
        ) : (
          <Tag color="red">No Image</Tag>
        ),
    },
    {
      title: "Details",
      dataIndex: "details",
      key: "detailsCount",
      render: (details) => <Tag color="blue">{details?.length || 0}</Tag>,
    },
    {
      title: "Actions",
      key: "actions",
      render: (_, record) => (
        <Space>
          <Tooltip title="Edit">
            <Button
              onClick={() => openModal(record)}
              icon={<EditOutlined />}
              type="text"
            />
          </Tooltip>
          <Popconfirm
            title="Are you sure you want to delete this blog?"
            onConfirm={() => deleteBlog(record._id)}
            okText="Yes"
            cancelText="No"
            placement="left"
          >
            <Tooltip title="Delete">
              <Button icon={<DeleteOutlined />} type="text" danger />
            </Tooltip>
          </Popconfirm>
        </Space>
      ),
    },
  ];

  return (
    <div style={{ padding: 24 }}>
      <Card
        title="Blog Management"
        bordered={false}
        extra={
          <Button
            type="primary"
            onClick={() => openModal()}
            icon={<PlusOutlined />}
          >
            Add Blog
          </Button>
        }
      >
        <Table
          dataSource={blogs}
          columns={columns}
          rowKey={(record) => record._id}
          loading={loading}
          pagination={{
            pageSize: 10,
            showSizeChanger: true,
            pageSizeOptions: ["10", "20", "50"],
          }}
          scroll={{ x: true }}
        />
      </Card>

      <Modal
        title={editingBlog ? "Edit Blog" : "Create New Blog"}
        visible={modalVisible}
        onCancel={closeModal}
        onOk={handleSubmit}
        okText={editingBlog ? "Update" : "Create"}
        confirmLoading={modalLoading}
        width={1200}
        destroyOnClose
        bodyStyle={{ maxHeight: "80vh", overflowY: "auto", padding: "24px 0" }}
      >
        <Form
          form={form}
          layout="vertical"
          initialValues={{
            title,
            blogAuthor,
            blogCategory,
            hasCarousel,
            seoTitle,
            seoDescription,
          }}
        >
          <Row gutter={24}>
            <Col span={12}>
              <Form.Item
                label="Title"
                name="title"
                rules={[{ required: true, message: "Please enter blog title" }]}
              >
                <Input
                  placeholder="Enter blog title"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                />
              </Form.Item>
            </Col>

            <Col span={6}>
              <Form.Item
                label="Author"
                name="blogAuthor"
                rules={[
                  {
                    required: true,
                    message: "Please select author",
                  },
                  {
                    validator: (_, value) => {
                      const isValidObjectId = /^[0-9a-fA-F]{24}$/.test(value);
                      return isValidObjectId
                        ? Promise.resolve()
                        : Promise.reject(new Error("Invalid author ID"));
                    },
                  },
                ]}
              >
                <Select
                  placeholder="Select author"
                  onChange={(value) => setBlogAuthor(value)}
                  showSearch
                  optionFilterProp="children"
                  filterOption={(input, option) =>
                    option.children
                      .toLowerCase()
                      .indexOf(input.toLowerCase()) >= 0
                  }
                >
                  {authors.map((author) => (
                    <Option key={author._id} value={author._id}>
                      {author.name}
                    </Option>
                  ))}
                </Select>
              </Form.Item>
            </Col>

            <Col span={6}>
              <Form.Item
                label="Category"
                name="blogCategory"
                rules={[{ required: true, message: "Please select category" }]}
              >
                <Select
                  placeholder="Select category"
                  onChange={(value) => setBlogCategory(value)}
                  showSearch
                  optionFilterProp="children"
                  filterOption={(input, option) =>
                    option.children
                      .toLowerCase()
                      .indexOf(input.toLowerCase()) >= 0
                  }
                >
                  {categories.map((category) => (
                    <Option key={category._id} value={category._id}>
                      {category.name}
                    </Option>
                  ))}
                </Select>
              </Form.Item>
            </Col>
          </Row>

          <Row gutter={24}>
            <Col span={12}>
              <Form.Item
                label="Main Image"
                required
                tooltip="This will be the featured image for the blog"
                rules={[{ required: true, message: "Please upload main image" }]}
              >
                <CloudinaryUploader
                  cloudName={cloudName}
                  uploadPreset={uploadPreset}
                  listType="picture-card"
                  maxCount={1}
                  onUploadSuccess={handleMainImageUpload}
                >
                  <div>
                    <PlusOutlined />
                    <div style={{ marginTop: 8 }}>Upload Main Image</div>
                  </div>
                </CloudinaryUploader>
                {mainImage && (
                  <img
                    src={mainImage}
                    alt="main-preview"
                    style={{
                      width: 100,
                      height: 100,
                      objectFit: 'cover',
                      borderRadius: 6,
                      marginTop: 12,
                      border: '1px solid #d9d9d9'
                    }}
                  />
                )}
              </Form.Item>
            </Col>

            <Col span={12}>
              <Form.Item label="Settings" name="hasCarousel">
                <div style={{ display: "flex", alignItems: "center" }}>
                  <Switch
                    checked={hasCarousel}
                    onChange={setHasCarousel}
                    style={{ marginRight: 8 }}
                  />
                  <Text>Include in carousel</Text>
                  <Tooltip title="If enabled, this blog will appear in the carousel section">
                    <InfoCircleOutlined
                      style={{ marginLeft: 8, color: "#999" }}
                    />
                  </Tooltip>
                </div>
              </Form.Item>
            </Col>
          </Row>

          <Row gutter={24}>
            <Col span={12}>
              <Form.Item
                label="SEO Title"
                name="seoTitle"
                tooltip="This will appear in search engine results"
              >
                <Input
                  placeholder="Enter SEO title (max 60 characters)"
                  maxLength={60}
                  value={seoTitle}
                  onChange={(e) => setSeoTitle(e.target.value)}
                />
              </Form.Item>
            </Col>
            <Col span={12}>
              <Form.Item
                label="SEO Description"
                name="seoDescription"
                tooltip="This will appear in search engine results"
              >
                <Input.TextArea
                  placeholder="Enter SEO description (max 160 characters)"
                  maxLength={160}
                  rows={3}
                  value={seoDescription}
                  onChange={(e) => setSeoDescription(e.target.value)}
                />
              </Form.Item>
            </Col>
          </Row>

          <Divider orientation="left">Blog Details</Divider>

          {details.map((detail, detailIndex) => (
            <Card
              key={detailIndex}
              title={`Detail Section ${detailIndex + 1}`}
              style={{ marginBottom: 24 }}
              extra={
                details.length > 1 && (
                  <Button
                    danger
                    onClick={() => removeDetail(detailIndex)}
                    icon={<DeleteOutlined />}
                    size="small"
                  >
                    Remove
                  </Button>
                )
              }
            >
              <Row gutter={24}>
                <Col span={24}>
                  <Form.Item label="Section Title">
                    <Input
                      placeholder="Enter section title"
                      value={detail.detailTitle}
                      onChange={(e) =>
                        updateDetailField(
                          detailIndex,
                          "detailTitle",
                          e.target.value
                        )
                      }
                    />
                  </Form.Item>
                </Col>
              </Row>

              <Row gutter={24}>
                <Col span={24}>
                  <Form.Item label="Section Description">
                    <ReactQuill
                      theme="snow"
                      value={detail.detailDescription}
                      onChange={(value) =>
                        updateDetailField(
                          detailIndex,
                          "detailDescription",
                          value
                        )
                      }
                      style={{ height: 150 }}
                    />
                  </Form.Item>
                </Col>
              </Row>

              <Row gutter={24}>
                <Col span={24}>
                  <Form.Item label="Key Points">
                    <div style={{ marginBottom: 8 }}>
                      <Space wrap>
                        {detail.points.map((point, pIndex) => (
                          <Tag
                            key={pIndex}
                            closable
                            onClose={() => removePoint(detailIndex, pIndex)}
                            style={{ marginBottom: 4 }}
                          >
                            {point}
                          </Tag>
                        ))}
                      </Space>
                    </div>
                    <Space.Compact style={{ width: "100%" }}>
                      <Input
                        placeholder="Add a key point"
                        value={pointInputs[detailIndex] || ""}
                        onChange={(e) =>
                          setPointInputs((prev) => ({
                            ...prev,
                            [detailIndex]: e.target.value,
                          }))
                        }
                        onPressEnter={() => addPoint(detailIndex)}
                      />
                      <Button
                        type="primary"
                        onClick={() => addPoint(detailIndex)}
                      >
                        Add
                      </Button>
                    </Space.Compact>
                  </Form.Item>
                </Col>
              </Row>

              <Row gutter={24}>
                <Col span={24}>
                  <Form.Item label="Images">
                    <CloudinaryUploader
                      cloudName={cloudName}
                      uploadPreset={uploadPreset}
                      listType="picture-card"
                      maxCount={10}
                      onUploadSuccess={(fileList) => handleDetailImageUpload(fileList, detailIndex)}
                    >
                      <div>
                        <PlusOutlined />
                        <div style={{ marginTop: 8 }}>Upload Image</div>
                      </div>
                    </CloudinaryUploader>
                    <div
                      style={{
                        marginTop: 12,
                        display: "flex",
                        flexWrap: "wrap",
                        gap: 12,
                      }}
                    >
                      {detail.images.map((img, imgIndex) => (
                        <div key={imgIndex} style={{ position: "relative" }}>
                          <img
                            src={img}
                            alt={`detail-img-${imgIndex}`}
                            style={{
                              width: 100,
                              height: 100,
                              objectFit: "cover",
                              borderRadius: 6,
                              border: "1px solid #d9d9d9",
                            }}
                          />
                          <Button
                            type="text"
                            danger
                            icon={<CloseOutlined />}
                            style={{
                              position: "absolute",
                              top: -10,
                              right: -10,
                              zIndex: 1,
                            }}
                            onClick={() => {
                              setDetails((prev) => {
                                const newDetails = [...prev];
                                newDetails[detailIndex].images = newDetails[
                                  detailIndex
                                ].images.filter((_, i) => i !== imgIndex);
                                return newDetails;
                              });
                            }}
                          />
                        </div>
                      ))}
                    </div>
                  </Form.Item>
                </Col>
              </Row>

              <Divider orientation="left">Tables</Divider>

              {detail.table?.map((table, tableIndex) => (
                <Card
                  key={tableIndex}
                  title={`Table ${tableIndex + 1}`}
                  style={{ marginBottom: 16 }}
                  extra={
                    <Button
                      danger
                      onClick={() => removeTable(detailIndex, tableIndex)}
                      icon={<DeleteOutlined />}
                      size="small"
                    >
                      Remove
                    </Button>
                  }
                >
                  <Row gutter={24}>
                    <Col span={24}>
                      <Form.Item label="Table Title">
                        <Input
                          placeholder="Enter table title"
                          value={table.title}
                          onChange={(e) => {
                            setDetails((prev) => {
                              const newDetails = [...prev];
                              newDetails[detailIndex].table[tableIndex].title =
                                e.target.value;
                              return newDetails;
                            });
                          }}
                        />
                      </Form.Item>
                    </Col>
                  </Row>

                  <Row gutter={24}>
                    <Col span={24}>
                      <Form.Item label="Table Points">
                        <div style={{ marginBottom: 8 }}>
                          <Space wrap>
                            {table.points?.map((point, pIndex) => (
                              <Tag
                                key={pIndex}
                                closable
                                onClose={() =>
                                  removeTablePoint(
                                    detailIndex,
                                    tableIndex,
                                    pIndex
                                  )
                                }
                                style={{ marginBottom: 4 }}
                              >
                                {point}
                              </Tag>
                            ))}
                          </Space>
                        </div>
                        <Space.Compact style={{ width: "100%" }}>
                          <Input
                            placeholder="Add a table point"
                            value={
                              tableInputs[`${detailIndex}-${tableIndex}`] || ""
                            }
                            onChange={(e) =>
                              setTableInputs((prev) => ({
                                ...prev,
                                [`${detailIndex}-${tableIndex}`]:
                                  e.target.value,
                              }))
                            }
                            onPressEnter={() =>
                              addTablePoint(detailIndex, tableIndex)
                            }
                          />
                          <Button
                            type="primary"
                            onClick={() =>
                              addTablePoint(detailIndex, tableIndex)
                            }
                          >
                            Add
                          </Button>
                        </Space.Compact>
                      </Form.Item>
                    </Col>
                  </Row>
                </Card>
              ))}

              <Button
                type="dashed"
                onClick={() => addTable(detailIndex)}
                block
                icon={<PlusOutlined />}
              >
                Add Table
              </Button>
            </Card>
          ))}

          <Button
            type="dashed"
            onClick={addDetail}
            block
            icon={<PlusOutlined />}
            style={{ marginTop: 16 }}
          >
            Add Detail Section
          </Button>
        </Form>
      </Modal>
    </div>
  );
};

export default Blog;
