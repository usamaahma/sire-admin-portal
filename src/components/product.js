import { useState, useEffect } from "react";
import axios from "axios";
import {
  Table,
  Button,
  Modal,
  Form,
  Input,
  Upload,
  message,
  Divider,
  Typography,
  Select,
  InputNumber,
  DatePicker,
  Checkbox,
  Row,
  Col,
  Spin,
} from "antd";
import { product } from "../utils/axios";
import {
  UploadOutlined,
  EditOutlined,
  DeleteOutlined,
  PlusOutlined,
} from "@ant-design/icons";
import ReactQuill from "react-quill";
import "./product.css";

const { Title } = Typography;
const { Option } = Select;
const { TextArea } = Input;

const Products = () => {
  const [products, setProducts] = useState([]);
  const [isModalVisible, setIsModalVisible] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [editingProduct, setEditingProduct] = useState(null);
  const [form] = Form.useForm();

  useEffect(() => {
    fetchProducts();
  }, []);

  const fetchProducts = async () => {
    try {
      setIsLoading(true);
      const response = await axios.get("/product");
      if (response.data.success) {
        setProducts(response.data.products);
      } else {
        message.error(response.data.message || "Failed to fetch products");
      }
    } catch (error) {
      console.error("Error fetching products:", error);
      message.error(
        error.response?.data?.message ||
          "An error occurred while fetching products"
      );
    } finally {
      setIsLoading(false);
    }
  };

  const columns = [
    {
      title: "ID",
      dataIndex: "id",
      key: "id",
      render: (text) => <strong>{text}</strong>,
    },
    {
      title: "Title",
      dataIndex: "title",
      key: "title",
    },
    {
      title: "Description",
      dataIndex: "description",
      key: "description",
      ellipsis: true,
    },
    {
      title: "Image",
      dataIndex: "image",
      key: "image",
      render: (image) => (
        <img src={image} alt="product" className="product-thumbnail" />
      ),
    },
    {
      title: "Price",
      dataIndex: "price",
      key: "price",
      render: (price) => `$${price}`,
    },
    {
      title: "Action",
      key: "action",
      render: (_, record) => (
        <div className="action-buttons">
          <Button
            type="text"
            icon={<EditOutlined />}
            onClick={() => handleEdit(record)}
          />
          <Button
            type="text"
            danger
            icon={<DeleteOutlined />}
            onClick={() => handleDelete(record)}
          />
        </div>
      ),
    },
  ];

  const showModal = () => {
    setIsModalVisible(true);
    setEditingProduct(null);
    form.resetFields();
  };

  const handleCancel = () => {
    setIsModalVisible(false);
    form.resetFields();
  };

  const handleOk = () => {
    form
      .validateFields()
      .then(async (values) => {
        setIsLoading(true);

        try {
          // Prepare product data for creating new product
          const productData = formatProductData(values);

          console.log("Sending product data:", productData); // Debug log

          // API call to add new product
          const response = await product.post("/", productData, {
            headers: {
              "Content-Type": "application/json",
            },
          });

          console.log("API Response:", response); // Debug log

          if (response.data.success) {
            message.success("Product added successfully");
            fetchProducts();
            setIsModalVisible(false);
            form.resetFields();
          } else {
            message.error(response.data.message || "Operation failed");
          }
        } catch (error) {
          console.error("API Error:", error.response || error); // Detailed error log
          message.error(
            error.response?.data?.message ||
              "An error occurred while saving the product"
          );
        } finally {
          setIsLoading(false);
        }
      })
      .catch((info) => {
        console.log("Form Validation Failed:", info);
      });
  };

  // Improved formatProductData function
  const formatProductData = (values) => {
    // Format sale price effective date if it exists
    let salePriceEffectiveDate;
    if (values.salePriceEffectiveDate) {
      salePriceEffectiveDate = {
        start: values.salePriceEffectiveDate[0].format(),
        end: values.salePriceEffectiveDate[1].format(),
      };
    }

    const productData = {
      title: values.title,
      description: values.description,
      gtin: values.gtin, // Add GTIN
      mpn: values.mpn, // Add MPN
      price: values.price,
      categories: values.categories ? [String(values.categories)] : [],
      subcategories: values.subcategories ? [String(values.subcategories)] : [],
      // Handle image uploads - ensure image is not empty
     image:
  values.mainImage?.[0]?.response?.url ||
  values.mainImage?.[0]?.url ||
  "https://via.placeholder.com/100",
     additionalImages:
      values.additionalImages
        ?.map((img) => img.response?.url || img.url)
        .filter((url) => url) || [],
      // Shipping information
      shipping: values.shippingCountry
        ? [
            {
              country: values.shippingCountry,
              region: values.shippingRegion,
              service: values.shippingService,
              price: values.shippingPrice,
            },
          ]
        : [],
      // Other fields
      ...(values.salePrice && { salePrice: values.salePrice }),
      ...(salePriceEffectiveDate && {
        salePriceEffectiveDate: salePriceEffectiveDate,
      }),
      // Variants
      variants:
        values.variants?.map((variant) => ({
          ...variant,
          dimensions: {
            length: variant.dimensionLength,
            width: variant.dimensionWidth,
            height: variant.dimensionHeight,
            unit: variant.dimensionUnit,
          },
          weight: {
            value: variant.weightValue,
            unit: variant.weightUnit,
          },
        })) || [],
    };

    return productData;
  };

  const handleEdit = (record) => {
    setEditingProduct(record);
    setIsModalVisible(true);

    const formattedData = {
      ...record,
      categories: record.categories?.[0] || "",
      subcategories: record.subcategories?.[0] || "",
      shippingCountry: record.shipping?.[0]?.country,
      shippingRegion: record.shipping?.[0]?.region,
      shippingService: record.shipping?.[0]?.service,
      shippingPrice: record.shipping?.[0]?.price,
      minHandlingTime: record.shipping?.[0]?.minHandlingTime,
      maxHandlingTime: record.shipping?.[0]?.maxHandlingTime,
      shippingWeightValue: record.shippingWeight?.value,
      shippingWeightUnit: record.shippingWeight?.unit,
      variants: record.variants?.map((variant) => ({
        ...variant,
        dimensionLength: variant.dimensions?.length,
        dimensionWidth: variant.dimensions?.width,
        dimensionHeight: variant.dimensions?.height,
        dimensionUnit: variant.dimensions?.unit,
        weightValue: variant.weight?.value,
        weightUnit: variant.weight?.unit,
      })),
      mainImage: record.image ? [{ url: record.image }] : [],
    };

    form.setFieldsValue(formattedData);
  };

  const handleDelete = async (record) => {
    Modal.confirm({
      title: "Are you sure you want to delete this product?",
      content: "This action cannot be undone",
      okText: "Yes, delete it",
      okType: "danger",
      cancelText: "No, cancel",
      onOk: async () => {
        try {
          setIsLoading(true);
          const response = await axios.delete(`/products/${record.id}`);

          if (response.data.success) {
            message.success("Product deleted successfully");
            fetchProducts();
          } else {
            message.error(response.data.message || "Failed to delete product");
          }
        } catch (error) {
          console.error("Error deleting product:", error);
          message.error(
            error.response?.data?.message ||
              "An error occurred while deleting the product"
          );
        } finally {
          setIsLoading(false);
        }
      },
    });
  };

  const normFile = (e) => {
    if (Array.isArray(e)) return e;
    return e?.fileList;
  };

  const uploadFile = async (file) => {
    const formData = new FormData();
    formData.append("file", file);

    try {
      const response = await product.post("/", formData, {
        headers: {
          "Content-Type": "multipart/form-data",
        },
      });
      console.log(response, "resssssss");
      return response.data.url;
    } catch (error) {
      console.error("Error uploading file:", error);
      message.error("Failed to upload file");
      throw error;
    }
  };

  return (
    <div className="products-container">
      <Spin spinning={isLoading}>
        <div className="header-section">
          <Title level={3}>Products</Title>
          <Button
            type="primary"
            icon={<PlusOutlined />}
            onClick={showModal}
            size="middle"
          >
            Add Product
          </Button>
        </div>

        <Table
          columns={columns}
          dataSource={products}
          rowKey="id"
          bordered
          className="product-table"
          pagination={{ pageSize: 5 }}
          loading={isLoading}
        />

        <Modal
          title={editingProduct ? "Edit Product" : "Add New Product"}
          open={isModalVisible}
          onOk={handleOk}
          onCancel={handleCancel}
          width={900}
          okText={editingProduct ? "Update Product" : "Save Product"}
          okButtonProps={{ loading: isLoading }}
          cancelButtonProps={{ disabled: isLoading }}
          style={{ top: 20 }}
        >
          <Form
            form={form}
            layout="vertical"
            initialValues={{
              multipack: 1,
              minimumOrderQuantity: 10,
              adult: false,
              isBundle: false,
              customizable: true,
              condition: "new",
              availability: "in stock",
              priceCurrency: "USD",
              shippingWeightUnit: "oz",
              dimensionUnit: "in",
              weightUnit: "oz",
            }}
          >
            <Divider
              orientation="left"
              style={{ fontWeight: "bold", fontSize: "16px" }}
            >
              Basic Information
            </Divider>

            <Row gutter={16}>
              <Col span={12}>
                <Form.Item
                  name="gtin"
                  label="GTIN"
                  rules={[{ required: true, message: "Please input GTIN!" }]}
                >
                  <Input placeholder="Enter GTIN (12-14 digits)" />
                </Form.Item>
              </Col>
              <Col span={12}>
                <Form.Item
                  name="mpn"
                  label="MPN"
                  rules={[{ required: true, message: "Please input MPN!" }]}
                >
                  <Input placeholder="Enter Manufacturer Part Number" />
                </Form.Item>
              </Col>
            </Row>

            <Form.Item
              name="title"
              label="Product Title"
              rules={[
                { required: true, message: "Please input product title!" },
              ]}
            >
              <Input placeholder="Enter product title" />
            </Form.Item>

            <Form.Item
              name="description"
              label="Product Description"
              rules={[
                {
                  required: true,
                  message: "Please input description!",
                },
                {
                  min: 150,
                  message: "Description must be at least 150 characters long",
                },
              ]}
            >
              <TextArea
                rows={4}
                placeholder="Detailed product description (minimum 150 characters)"
              />
            </Form.Item>

            <Row gutter={16}>
              <Col span={12}>
                <Form.Item
                  name="categories"
                  label="Category"
                  rules={[
                    { required: true, message: "Please select category!" },
                  ]}
                >
                  <Select placeholder="Select category">
                    <Option value="60d21b4667d0d8992e610c85">
                      Packaging Boxes
                    </Option>
                    <Option value="60d21b4667d0d8992e610c86">
                      Shipping Supplies
                    </Option>
                    <Option value="60d21b4667d0d8992e610c87">
                      Office Supplies
                    </Option>
                  </Select>
                </Form.Item>
              </Col>
              <Col span={12}>
                <Form.Item name="subcategories" label="Subcategory">
                  <Select placeholder="Select subcategory">
                    <Option value="60d21b4967d0d8992e610c87">
                      Custom Printed Boxes
                    </Option>
                    <Option value="60d21b4967d0d8992e610c88">
                      Corrugated Boxes
                    </Option>
                    <Option value="60d21b4967d0d8992e610c89">
                      Mailer Boxes
                    </Option>
                  </Select>
                </Form.Item>
              </Col>
            </Row>

            <Form.Item name="productType" label="Product Type">
              <Input placeholder="e.g., Packaging Boxes>Custom Printed Boxes" />
            </Form.Item>

            <Divider
              orientation="left"
              style={{ fontWeight: "bold", fontSize: "16px" }}
            >
              Images & Media
            </Divider>

   <Form.Item
  name="mainImage"
  label="Main Image"
  valuePropName="fileList"
  getValueFromEvent={(e) => Array.isArray(e) ? e : e?.fileList}
  rules={[
    {
      required: true,
      message: "Please upload main image!",
    }
  ]}
>
  <Upload
    name="mainImage"
    listType="picture-card"
    accept="image/*"
    beforeUpload={() => false} // prevent auto upload
    maxCount={1}
  >
    <div>
      <PlusOutlined />
      <div style={{ marginTop: 8 }}>Upload Main Image</div>
    </div>
  </Upload>
</Form.Item>


            <Form.Item
              name="pdfImage"
              label="PDF Image"
              valuePropName="fileList"
              getValueFromEvent={normFile}
            >
              <Upload
                name="pdfImage"
                listType="picture-card"
                beforeUpload={() => false}
                maxCount={1}
              >
                <div>
                  <PlusOutlined />
                  <div style={{ marginTop: 8 }}>Upload PDF Image</div>
                </div>
              </Upload>
            </Form.Item>

            <Form.Item
              name="additionalImages"
              label="Additional Images"
              valuePropName="fileList"
              getValueFromEvent={normFile}
            >
              <Upload
                name="additionalImages"
                listType="picture-card"
                multiple
                beforeUpload={() => false}
              >
                <div>
                  <PlusOutlined />
                  <div style={{ marginTop: 8 }}>Upload</div>
                </div>
              </Upload>
            </Form.Item>

            <Divider
              orientation="left"
              style={{ fontWeight: "bold", fontSize: "16px" }}
            >
              Pricing & Inventory
            </Divider>

            <Row gutter={16}>
              <Col span={8}>
                <Form.Item
                  name="price"
                  label="Price"
                  rules={[{ required: true, message: "Please input price!" }]}
                >
                  <InputNumber
                    style={{ width: "100%" }}
                    min={0}
                    step={0.01}
                    placeholder="29.99"
                    formatter={(value) => `$ ${value}`}
                  />
                </Form.Item>
              </Col>
              <Col span={8}>
                <Form.Item name="salePrice" label="Sale Price">
                  <InputNumber
                    style={{ width: "100%" }}
                    min={0}
                    step={0.01}
                    placeholder="24.99"
                    formatter={(value) => `$ ${value}`}
                  />
                </Form.Item>
              </Col>
              <Col span={8}>
                <Form.Item name="priceCurrency" label="Currency">
                  <Select disabled>
                    <Option value="USD">USD</Option>
                  </Select>
                </Form.Item>
              </Col>
            </Row>

            <Row gutter={16}>
              <Col span={12}>
                <Form.Item name="salePriceEffectiveDate" label="Sale Period">
                  <DatePicker.RangePicker
                    style={{ width: "100%" }}
                    showTime={{ format: "HH:mm" }}
                    format="YYYY-MM-DD HH:mm"
                  />
                </Form.Item>
              </Col>
              <Col span={12}>
                <Form.Item
                  name="minimumOrderQuantity"
                  label="Minimum Order Quantity"
                >
                  <InputNumber
                    style={{ width: "100%" }}
                    min={1}
                    placeholder="10"
                  />
                </Form.Item>
              </Col>
            </Row>

            <Form.Item name="brand" label="Brand">
              <Input placeholder="e.g., SirePrinting" />
            </Form.Item>

            <Row gutter={16}>
              <Col span={12}>
                <Form.Item name="condition" label="Condition">
                  <Select>
                    <Option value="new">New</Option>
                    <Option value="refurbished">Refurbished</Option>
                    <Option value="used">Used</Option>
                  </Select>
                </Form.Item>
              </Col>
              <Col span={12}>
                <Form.Item name="availability" label="Availability">
                  <Select>
                    <Option value="in stock">In Stock</Option>
                    <Option value="out of stock">Out of Stock</Option>
                    <Option value="preorder">Preorder</Option>
                  </Select>
                </Form.Item>
              </Col>
            </Row>

            <Divider
              orientation="left"
              style={{ fontWeight: "bold", fontSize: "16px" }}
            >
              Shipping Information
            </Divider>

            <Row gutter={16}>
              <Col span={6}>
                <Form.Item name="shippingCountry" label="Country">
                  <Input placeholder="e.g., US" />
                </Form.Item>
              </Col>
              <Col span={6}>
                <Form.Item name="shippingRegion" label="Region">
                  <Input placeholder="e.g., California" />
                </Form.Item>
              </Col>
              <Col span={6}>
                <Form.Item name="shippingService" label="Service">
                  <Input placeholder="e.g., Standard" />
                </Form.Item>
              </Col>
              <Col span={6}>
                <Form.Item name="shippingPrice" label="Price">
                  <InputNumber
                    style={{ width: "100%" }}
                    min={0}
                    step={0.01}
                    placeholder="5.00"
                  />
                </Form.Item>
              </Col>
            </Row>

            {/* <Row gutter={16}>
            <Col span={8}>
              <Form.Item name="shippingWeightValue" label="Shipping Weight">
                <InputNumber
                  style={{ width: "100%" }}
                  min={0}
                  step={0.1}
                  placeholder="16"
                />
              </Form.Item>
            </Col>
            <Col span={8}>
              <Form.Item name="shippingWeightUnit" label="Unit">
                <Select>
                  <Option value="oz">oz</Option>
                  <Option value="lb">lb</Option>
                  <Option value="g">g</Option>
                  <Option value="kg">kg</Option>
                </Select>
              </Form.Item>
            </Col>
          </Row> */}

            <Row gutter={16}>
              <Col span={8}>
                <Form.Item
                  name="minHandlingTime"
                  label="Min Handling Time (days)"
                >
                  <InputNumber
                    style={{ width: "100%" }}
                    min={0}
                    placeholder="1"
                  />
                </Form.Item>
              </Col>
              <Col span={8}>
                <Form.Item
                  name="maxHandlingTime"
                  label="Max Handling Time (days)"
                >
                  <InputNumber
                    style={{ width: "100%" }}
                    min={0}
                    placeholder="3"
                  />
                </Form.Item>
              </Col>
            </Row>

            <Divider
              orientation="left"
              style={{ fontWeight: "bold", fontSize: "16px" }}
            >
              Product Variants
            </Divider>

            <Form.List name="variants">
              {(fields, { add, remove }) => (
                <>
                  {fields.map(({ key, name, ...restField }) => (
                    <div
                      key={key}
                      style={{
                        marginBottom: 16,
                        border: "1px solid #d9d9d9",
                        padding: 16,
                        borderRadius: 4,
                      }}
                    >
                      <Row gutter={16}>
                        <Col span={24}>
                          <Form.Item
                            {...restField}
                            name={[name, "variantTitle"]}
                            label="Variant Title"
                            rules={[
                              {
                                required: true,
                                message: "Missing variant title",
                              },
                            ]}
                          >
                            <Input placeholder="e.g., Large Box" />
                          </Form.Item>
                        </Col>
                      </Row>

                      <Form.Item
                        {...restField}
                        name={[name, "variantDescription"]}
                        label="Variant Description"
                      >
                        <TextArea
                          rows={2}
                          placeholder="Description for this variant"
                        />
                      </Form.Item>

                      <Row gutter={16}>
                        <Col span={8}>
                          <Form.Item
                            {...restField}
                            name={[name, "price"]}
                            label="Price"
                          >
                            <InputNumber
                              style={{ width: "100%" }}
                              min={0}
                              step={0.01}
                              placeholder="34.99"
                            />
                          </Form.Item>
                        </Col>
                        <Col span={8}>
                          <Form.Item
                            {...restField}
                            name={[name, "salePrice"]}
                            label="Sale Price"
                          >
                            <InputNumber
                              style={{ width: "100%" }}
                              min={0}
                              step={0.01}
                              placeholder="29.99"
                            />
                          </Form.Item>
                        </Col>
                      </Row>

                      <Divider orientation="left" style={{ fontSize: "14px" }}>
                        Dimensions
                      </Divider>
                      <Row gutter={16}>
                        <Col span={6}>
                          <Form.Item
                            {...restField}
                            name={[name, "dimensions", "length"]}
                            label="Length"
                          >
                            <InputNumber
                              style={{ width: "100%" }}
                              min={0}
                              step={0.1}
                            />
                          </Form.Item>
                        </Col>
                        <Col span={6}>
                          <Form.Item
                            {...restField}
                            name={[name, "dimensions", "width"]}
                            label="Width"
                          >
                            <InputNumber
                              style={{ width: "100%" }}
                              min={0}
                              step={0.1}
                            />
                          </Form.Item>
                        </Col>
                        <Col span={6}>
                          <Form.Item
                            {...restField}
                            name={[name, "dimensions", "height"]}
                            label="Height"
                          >
                            <InputNumber
                              style={{ width: "100%" }}
                              min={0}
                              step={0.1}
                            />
                          </Form.Item>
                        </Col>
                        <Col span={6}>
                          <Form.Item
                            {...restField}
                            name={[name, "dimensions", "unit"]}
                            label="Unit"
                          >
                            <Input placeholder="e.g., in, cm" />
                          </Form.Item>
                        </Col>
                      </Row>

                      <Divider orientation="left" style={{ fontSize: "14px" }}>
                        Weight
                      </Divider>
                      <Row gutter={16}>
                        <Col span={12}>
                          <Form.Item
                            {...restField}
                            name={[name, "weight", "value"]}
                            label="Weight Value"
                          >
                            <InputNumber
                              style={{ width: "100%" }}
                              min={0}
                              step={0.1}
                            />
                          </Form.Item>
                        </Col>
                        <Col span={12}>
                          <Form.Item
                            {...restField}
                            name={[name, "weight", "unit"]}
                            label="Unit"
                          >
                            <Input placeholder="e.g., oz, g" />
                          </Form.Item>
                        </Col>
                      </Row>

                      {/* ========== Material ========== */}
                      <Divider orientation="left">Material</Divider>
                      <Form.List name={[name, "variantDetail", "material"]}>
                        {(fields, { add, remove }) => (
                          <>
                            {fields.map(
                              ({ key, name: fieldName, ...restField }) => (
                                <Row key={key} gutter={16}>
                                  <Col span={22}>
                                    <Form.Item
                                      {...restField}
                                      name={fieldName}
                                      rules={[
                                        {
                                          required: true,
                                          message: "Enter material",
                                        },
                                      ]}
                                    >
                                      <Input placeholder="e.g., Kraft Paper" />
                                    </Form.Item>
                                  </Col>
                                  <Col span={2}>
                                    <Button
                                      type="link"
                                      danger
                                      onClick={() => remove(fieldName)}
                                    >
                                      Remove
                                    </Button>
                                  </Col>
                                </Row>
                              )
                            )}
                            <Form.Item>
                              <Button
                                type="dashed"
                                onClick={() => add()}
                                block
                                icon={<PlusOutlined />}
                              >
                                Add Material
                              </Button>
                            </Form.Item>
                          </>
                        )}
                      </Form.List>

                      {/* ========== Color Model ========== */}
                      <Divider orientation="left">Color Model</Divider>
                      <Form.List name={[name, "variantDetail", "colormodel"]}>
                        {(fields, { add, remove }) => (
                          <>
                            {fields.map(
                              ({ key, name: fieldName, ...restField }) => (
                                <Row key={key} gutter={16}>
                                  <Col span={22}>
                                    <Form.Item
                                      {...restField}
                                      name={fieldName}
                                      rules={[
                                        {
                                          required: true,
                                          message: "Enter color model",
                                        },
                                      ]}
                                    >
                                      <Input placeholder="e.g., CMYK" />
                                    </Form.Item>
                                  </Col>
                                  <Col span={2}>
                                    <Button
                                      type="link"
                                      danger
                                      onClick={() => remove(fieldName)}
                                    >
                                      Remove
                                    </Button>
                                  </Col>
                                </Row>
                              )
                            )}
                            <Form.Item>
                              <Button
                                type="dashed"
                                onClick={() => add()}
                                block
                                icon={<PlusOutlined />}
                              >
                                Add Color Model
                              </Button>
                            </Form.Item>
                          </>
                        )}
                      </Form.List>

                      {/* ========== Finishing ========== */}
                      <Divider orientation="left">Finishing</Divider>
                      <Form.List name={[name, "variantDetail", "finishing"]}>
                        {(fields, { add, remove }) => (
                          <>
                            {fields.map(
                              ({ key, name: fieldName, ...restField }) => (
                                <Row key={key} gutter={16}>
                                  <Col span={22}>
                                    <Form.Item
                                      {...restField}
                                      name={fieldName}
                                      rules={[
                                        {
                                          required: true,
                                          message: "Enter finishing",
                                        },
                                      ]}
                                    >
                                      <Input placeholder="e.g., Glossy" />
                                    </Form.Item>
                                  </Col>
                                  <Col span={2}>
                                    <Button
                                      type="link"
                                      danger
                                      onClick={() => remove(fieldName)}
                                    >
                                      Remove
                                    </Button>
                                  </Col>
                                </Row>
                              )
                            )}
                            <Form.Item>
                              <Button
                                type="dashed"
                                onClick={() => add()}
                                block
                                icon={<PlusOutlined />}
                              >
                                Add Finishing
                              </Button>
                            </Form.Item>
                          </>
                        )}
                      </Form.List>

                      {/* ========== Add-ons ========== */}
                      <Divider orientation="left">Add-ons</Divider>
                      <Form.List name={[name, "variantDetail", "addon"]}>
                        {(fields, { add, remove }) => (
                          <>
                            {fields.map(
                              ({ key, name: fieldName, ...restField }) => (
                                <Row key={key} gutter={16}>
                                  <Col span={22}>
                                    <Form.Item {...restField} name={fieldName}>
                                      <Input placeholder="e.g., Handle Cutouts" />
                                    </Form.Item>
                                  </Col>
                                  <Col span={2}>
                                    <Button
                                      type="link"
                                      danger
                                      onClick={() => remove(fieldName)}
                                    >
                                      Remove
                                    </Button>
                                  </Col>
                                </Row>
                              )
                            )}
                            <Form.Item>
                              <Button
                                type="dashed"
                                onClick={() => add()}
                                block
                                icon={<PlusOutlined />}
                              >
                                Add Add-on
                              </Button>
                            </Form.Item>
                          </>
                        )}
                      </Form.List>

                      {/* ========== Turnaround ========== */}
                      <Divider orientation="left">Turnaround</Divider>
                      <Form.List name={[name, "variantDetail", "turnaround"]}>
                        {(fields, { add, remove }) => (
                          <>
                            {fields.map(
                              ({ key, name: fieldName, ...restField }) => (
                                <Row key={key} gutter={16}>
                                  <Col span={22}>
                                    <Form.Item
                                      {...restField}
                                      name={fieldName}
                                      rules={[
                                        {
                                          required: true,
                                          message: "Enter turnaround",
                                        },
                                      ]}
                                    >
                                      <Input placeholder="e.g., 5 Days" />
                                    </Form.Item>
                                  </Col>
                                  <Col span={2}>
                                    <Button
                                      type="link"
                                      danger
                                      onClick={() => remove(fieldName)}
                                    >
                                      Remove
                                    </Button>
                                  </Col>
                                </Row>
                              )
                            )}
                            <Form.Item>
                              <Button
                                type="dashed"
                                onClick={() => add()}
                                block
                                icon={<PlusOutlined />}
                              >
                                Add Turnaround
                              </Button>
                            </Form.Item>
                          </>
                        )}
                      </Form.List>

                      {/* ========== FAQs ========== */}
                      <Divider orientation="left">FAQs</Divider>
                      <Form.List name={[name, "variantDetail", "faqs"]}>
                        {(fields, { add, remove }) => (
                          <>
                            {fields.map(
                              ({ key, name: fieldName, ...restField }) => (
                                <div key={key} style={{ marginBottom: 8 }}>
                                  <Row gutter={16}>
                                    <Col span={11}>
                                      <Form.Item
                                        {...restField}
                                        name={[fieldName, "question"]}
                                        rules={[
                                          {
                                            required: true,
                                            message: "Enter question",
                                          },
                                        ]}
                                      >
                                        <Input placeholder="Question" />
                                      </Form.Item>
                                    </Col>
                                    <Col span={11}>
                                      <Form.Item
                                        {...restField}
                                        name={[fieldName, "answer"]}
                                        rules={[
                                          {
                                            required: true,
                                            message: "Enter answer",
                                          },
                                        ]}
                                      >
                                        <Input placeholder="Answer" />
                                      </Form.Item>
                                    </Col>
                                    <Col span={2}>
                                      <Button
                                        type="link"
                                        danger
                                        onClick={() => remove(fieldName)}
                                      >
                                        Remove
                                      </Button>
                                    </Col>
                                  </Row>
                                </div>
                              )
                            )}
                            <Form.Item>
                              <Button
                                type="dashed"
                                onClick={() => add()}
                                block
                                icon={<PlusOutlined />}
                              >
                                Add FAQ
                              </Button>
                            </Form.Item>
                          </>
                        )}
                      </Form.List>

                      {/* ========== Variant Specifications (Updated UI/UX) ========== */}
                      <Divider orientation="left">
                        Variant Specifications
                      </Divider>
                      <Form.List
                        name={[name, "variantDetail", "variantSpecifications"]}
                      >
                        {(fields, { add, remove }) => (
                          <>
                            {fields.map(
                              ({ key, name: fieldName, ...restField }) => (
                                <div
                                  key={key}
                                  style={{
                                    marginBottom: 16,
                                    border: "1px solid #d9d9d9",
                                    padding: 16,
                                    borderRadius: 4,
                                  }}
                                >
                                  <Row gutter={16} justify="center">
                                    <Col span={24} style={{ marginBottom: 8 }}>
                                      <div
                                        style={{
                                          fontWeight: "bold",
                                          fontSize: 16,
                                          textAlign: "center",
                                        }}
                                      >
                                        Specification Image
                                      </div>
                                    </Col>
                                    <Col
                                      span={24}
                                      style={{
                                        textAlign: "center",
                                        marginBottom: 16,
                                      }}
                                    >
                                      <Form.Item
                                        {...restField}
                                        name={[fieldName, "image"]}
                                        valuePropName="fileList"
                                        getValueFromEvent={(e) => {
                                          if (Array.isArray(e)) return e;
                                          return e && e.fileList;
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
                                          beforeUpload={(file) => {
                                            const isValidType =
                                              file.type === "image/jpeg" ||
                                              file.type === "image/png" ||
                                              file.type === "image/webp";
                                            if (!isValidType) {
                                              message.error(
                                                "You can only upload JPG/PNG/WEBP file!"
                                              );
                                              return Upload.LIST_IGNORE;
                                            }
                                            const isLt2M =
                                              file.size / 1024 / 1024 < 2;
                                            if (!isLt2M) {
                                              message.error(
                                                "Image must smaller than 2MB!"
                                              );
                                              return Upload.LIST_IGNORE;
                                            }
                                            return true;
                                          }}
                                          customRequest={({
                                            file,
                                            onSuccess,
                                          }) => {
                                            setTimeout(() => {
                                              onSuccess("ok");
                                            }, 0);
                                          }}
                                        >
                                          <div>
                                            <PlusOutlined />
                                            <div style={{ marginTop: 8 }}>
                                              Upload
                                            </div>
                                          </div>
                                        </Upload>
                                      </Form.Item>
                                    </Col>
                                  </Row>

                                  <Row gutter={16} align="middle">
                                    <Col span={8}>
                                      <Form.Item
                                        {...restField}
                                        name={[fieldName, "title"]}
                                        rules={[
                                          {
                                            required: true,
                                            message: "Enter title",
                                          },
                                        ]}
                                      >
                                        <Input placeholder="Specification Title" />
                                      </Form.Item>
                                    </Col>
                                    <Col span={14}>
                                      <Form.Item
                                        {...restField}
                                        name={[fieldName, "description"]}
                                        rules={[
                                          {
                                            required: true,
                                            message: "Enter description",
                                          },
                                        ]}
                                      >
                                        <TextArea
                                          placeholder="Specification Description"
                                          rows={4}
                                          style={{ resize: "vertical" }}
                                        />
                                      </Form.Item>
                                    </Col>
                                    <Col span={2}>
                                      <Button
                                        type="link"
                                        danger
                                        onClick={() => remove(fieldName)}
                                      >
                                        Remove
                                      </Button>
                                    </Col>
                                  </Row>
                                </div>
                              )
                            )}
                            <Form.Item>
                              <Button
                                type="dashed"
                                onClick={() => add()}
                                block
                                icon={<PlusOutlined />}
                              >
                                Add Specification
                              </Button>
                            </Form.Item>
                          </>
                        )}
                      </Form.List>

                      <Button
                        type="danger"
                        onClick={() => remove(name)}
                        style={{ marginTop: 16 }}
                      >
                        Remove Variant
                      </Button>
                    </div>
                  ))}
                  <Form.Item>
                    <Button
                      type="dashed"
                      onClick={() => add()}
                      block
                      icon={<PlusOutlined />}
                    >
                      Add Variant
                    </Button>
                  </Form.Item>
                </>
              )}
            </Form.List>
            <Divider
              orientation="left"
              style={{ fontWeight: "bold", fontSize: "16px" }}
            >
              Additional Information
            </Divider>

            <Row gutter={16}>
              <Col span={8}>
                <Form.Item name="multipack" label="Multipack Quantity">
                  <InputNumber
                    style={{ width: "100%" }}
                    min={1}
                    placeholder="1"
                  />
                </Form.Item>
              </Col>
              <Col span={8}>
                <Form.Item
                  name="adult"
                  label="Adult Product"
                  valuePropName="checked"
                >
                  <Checkbox />
                </Form.Item>
              </Col>
              <Col span={8}>
                <Form.Item
                  name="isBundle"
                  label="Is Bundle"
                  valuePropName="checked"
                >
                  <Checkbox />
                </Form.Item>
              </Col>
            </Row>

            <Form.Item
              name="customizable"
              label="Customizable"
              valuePropName="checked"
            >
              <Checkbox />
            </Form.Item>

            <Divider
              orientation="left"
              style={{ fontWeight: "bold", fontSize: "16px" }}
            >
              SEO Information
            </Divider>

            <Form.Item name="seoTitle" label="SEO Title">
              <Input placeholder="e.g., Buy Custom Printed Packaging Boxes" />
            </Form.Item>

            <Form.Item name="seoDescription" label="SEO Description">
              <TextArea
                rows={2}
                placeholder="SEO-friendly product description"
              />
            </Form.Item>

            <Form.Item name="seoKeyword" label="SEO Keywords">
              <Input placeholder="Enter keywords separated by commas (e.g., custom boxes, printed packaging)" />
            </Form.Item>
            <Divider
              orientation="left"
              style={{ fontWeight: "bold", fontSize: "16px" }}
            >
              Detail Description
            </Divider>
            <Form.List name="variants">
              {(fields, { add, remove }) => (
                <>
                  {fields.map(({ key, name: fieldIndex, ...restField }) => (
                    <div key={key}>
                      {/* Other variant fields can go here */}

                      {/* Variant Details Form.List */}
                      <Form.List
                        name={[fieldIndex, "variantDetail", "variantDetails"]}
                      >
                        {(
                          detailFields,
                          { add: addDetail, remove: removeDetail }
                        ) => (
                          <>
                            {detailFields.map(
                              ({ key, name: fieldName, ...restField }) => (
                                <div
                                  key={key}
                                  style={{
                                    marginBottom: 16,
                                    border: "1px solid #d9d9d9",
                                    padding: 16,
                                    borderRadius: 4,
                                    backgroundColor: "#fafafa",
                                  }}
                                >
                                  <Row gutter={16}>
                                    <Col span={12}>
                                      <Form.Item
                                        {...restField}
                                        name={[fieldName, "title"]}
                                        label="Detail Title"
                                        rules={[
                                          {
                                            required: true,
                                            message: "Enter detail title",
                                          },
                                        ]}
                                      >
                                        <Input placeholder="e.g., Eco-Friendly Material" />
                                      </Form.Item>
                                    </Col>
                                    <Col span={12}>
                                      <Form.Item
                                        {...restField}
                                        name={[fieldName, "subtitle"]}
                                        label="Detail Sub-title"
                                      >
                                        <Input placeholder="Optional sub-title" />
                                      </Form.Item>
                                    </Col>
                                  </Row>

                                  <Form.Item
                                    {...restField}
                                    name={[fieldName, "description"]}
                                    label="Description"
                                    rules={[
                                      {
                                        required: true,
                                        message: "Enter description",
                                      },
                                    ]}
                                  >
                                    <ReactQuill
                                      theme="snow"
                                      placeholder="Enter rich text description..."
                                    />
                                  </Form.Item>

                                  <Form.Item
                                    {...restField}
                                    name={[fieldName, "image"]}
                                    label="Image"
                                    valuePropName="fileList"
                                    getValueFromEvent={(e) =>
                                      Array.isArray(e) ? e : e?.fileList
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
                                      beforeUpload={(file) => {
                                        const isValidType = [
                                          "image/jpeg",
                                          "image/png",
                                          "image/webp",
                                        ].includes(file.type);
                                        if (!isValidType) {
                                          message.error(
                                            "Only JPG/PNG/WEBP files allowed!"
                                          );
                                          return Upload.LIST_IGNORE;
                                        }
                                        const isLt2M =
                                          file.size / 1024 / 1024 < 2;
                                        if (!isLt2M) {
                                          message.error(
                                            "Image must be smaller than 2MB!"
                                          );
                                          return Upload.LIST_IGNORE;
                                        }
                                        return true;
                                      }}
                                      customRequest={({ file, onSuccess }) => {
                                        setTimeout(() => onSuccess("ok"), 0);
                                      }}
                                    >
                                      <div>
                                        <PlusOutlined />
                                        <div style={{ marginTop: 8 }}>
                                          Upload
                                        </div>
                                      </div>
                                    </Upload>
                                  </Form.Item>

                                  <Button
                                    type="link"
                                    danger
                                    onClick={() => removeDetail(fieldName)}
                                  >
                                    Remove Detail
                                  </Button>
                                </div>
                              )
                            )}

                            <Form.Item>
                              <Button
                                type="dashed"
                                onClick={() => addDetail()}
                                block
                                icon={<PlusOutlined />}
                              >
                                Add Description data
                              </Button>
                            </Form.Item>
                          </>
                        )}
                      </Form.List>

                      {/* Remove Variant Button */}
                      <Button
                        type="danger"
                        onClick={() => remove(fieldIndex)}
                        style={{ marginTop: 16 }}
                      >
                        Remove Variant
                      </Button>
                    </div>
                  ))}

                  <Form.Item>
                    <Button
                      type="dashed"
                      onClick={() => add()}
                      block
                      icon={<PlusOutlined />}
                    >
                      Add Detail Description
                    </Button>
                  </Form.Item>
                </>
              )}
            </Form.List>
          </Form>
        </Modal>
      </Spin>
    </div>
  );
};

export default Products;
