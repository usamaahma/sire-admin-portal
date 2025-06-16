import { useState, useEffect } from "react";
import moment from "moment";
import {
  Table,
  Button,
  Modal,
  Form,
  Input,
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
import { PlusOutlined, MinusCircleOutlined } from "@ant-design/icons";
import { EditOutlined, DeleteOutlined } from "@ant-design/icons";
import ReactQuill from "react-quill";
import "./product.css";
import { category, product, subcategory } from "../utils/axios";
import CloudinaryUploader from "./cloudinary/CloudinaryUploader";

const { Title } = Typography;
const { Option } = Select;
const { TextArea } = Input;

const modules = {
  toolbar: [
    [{ header: [1, 2, 3, false] }],
    ["bold", "italic", "underline"],
    [{ align: [] }],
    [{ list: "ordered" }, { list: "bullet" }],
    ["link", "image"],
    ["clean"],
  ],
};

const Products = () => {
  const [products, setProducts] = useState([]);
  const [isModalVisible, setIsModalVisible] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [editingProduct, setEditingProduct] = useState(null);
  const [categories, setCategories] = useState([]);
  const [subcategories, setSubcategories] = useState([]);
  const [form] = Form.useForm();

  const cloudName = "dxhpud7sx";
  const uploadPreset = "sireprinting";

  useEffect(() => {
    const fetchInitialData = async () => {
      try {
        setIsLoading(true);
        await fetchProducts();
        const categoriesResponse = await category.get("/");
        setCategories(categoriesResponse.data.data || categoriesResponse.data);
        const subcategoriesResponse = await subcategory.get("/");
        setSubcategories(
          subcategoriesResponse.data.data || subcategoriesResponse.data
        );
      } catch (error) {
        console.error("Error fetching initial data:", error);
        message.error("Failed to load initial data");
      } finally {
        setIsLoading(false);
      }
    };

    fetchInitialData();
  }, []);

  const fetchProducts = async () => {
    try {
      setIsLoading(true);
      const response = await product.get("/");
      if (response.data) {
        if (Array.isArray(response.data)) {
          setProducts(response.data);
        } else if (response.data.success) {
          setProducts(response.data.data || response.data.products);
        } else {
          setProducts(response.data);
        }
      } else {
        message.error("No data received from server");
      }
    } catch (error) {
      console.error("Error fetching products:", error);
      message.error(
        error.response?.data?.message ||
          error.message ||
          "An error occurred while fetching products"
      );
    } finally {
      setIsLoading(false);
    }
  };

  const columns = [
    {
      title: "S.No",
      key: "serial",
      render: (text, record, index) => <strong>{index + 1}</strong>,
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
          const productData = formatProductData(values);
          console.log("Sending product data to backend:", productData);
          let response;
          if (editingProduct) {
            response = await product.patch(
              `/${editingProduct._id}`,
              productData,
              {
                headers: { "Content-Type": "application/json" },
              }
            );
          } else {
            response = await product.post("/", productData, {
              headers: { "Content-Type": "application/json" },
            });
          }
          if (
            response.status === 200 ||
            response.status === 201 ||
            response.data.success
          ) {
            message.success(
              editingProduct
                ? "Product updated successfully"
                : "Product added successfully"
            );
            fetchProducts();
            setIsModalVisible(false);
            form.resetFields();
          } else {
            message.error(response.data.message || "Operation failed");
          }
        } catch (error) {
          console.error("API Error:", error.response || error);
          message.error(
            error.response?.data?.message ||
              error.message ||
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

  const formatProductData = (values) => {
    let salePriceEffectiveDate;
    if (values.salePriceEffectiveDate) {
      salePriceEffectiveDate = {
        start: values.salePriceEffectiveDate[0]?.format(),
        end: values.salePriceEffectiveDate[1]?.format(),
      };
    }

    const formattedVariants =
      values.variants?.map((variant) => ({
        variantTitle: variant.variantTitle,
        variantDescription: variant.variantDescription,
        price: variant.price,
        salePrice: variant.salePrice,
        dimensions: {
          length: variant.dimensions?.length || 0,
          width: variant.dimensions?.width || 0,
          height: variant.dimensions?.height || 0,
          unit: variant.dimensions?.unit || "in",
        },
        variantDetail: {
          material: variant.variantDetail?.material || [],
          colormodel: variant.variantDetail?.colormodel || [],
          finishing: variant.variantDetail?.finishing || [],
          addon: variant.variantDetail?.addon || [],
          turnaround: variant.variantDetail?.turnaround || [],
          faqs: variant.variantDetail?.faqs || [],
        },
        variantSpecifications:
          variant.variantSpecifications?.map((spec) => ({
            image: spec.image?.[0]?.url || "https://via.placeholder.com/100",
            title: spec.title,
            description: spec.description,
          })) || [],
        detailTitle: variant.detailTitle,
        detailSubtitle: variant.detailSubtitle,
        detailDescription:
          variant.detailDescription?.map((desc) => ({
            description: desc.description,
            image: desc.image?.[0]?.url || undefined,
          })) || [],
      })) || [];

    const productData = {
      gtin: values.gtin,
      mpn: values.mpn,
      title: values.title,
      description: values.description,
      price: values.price,
      priceCurrency: values.priceCurrency,
      categories: Array.isArray(values.categories)
        ? values.categories.map((id) => String(id))
        : [],
      subcategories: Array.isArray(values.subcategories)
        ? values.subcategories.map((id) => String(id))
        : [],
      googleProductCategory: values.googleProductCategory,
      productType: values.productType,
      image: values.mainImage?.[0]?.url || "https://via.placeholder.com/100",
      pdfImage: values.pdfImage?.[0]?.url || undefined,
      additionalImages:
        values.additionalImages?.map((img) => img.url).filter((url) => url) || [],
      shipping: values.shippingCountry
        ? [
            {
              country: values.shippingCountry,
              region: values.shippingRegion,
              service: values.shippingService,
              price: values.shippingPrice,
              minHandlingTime: values.minHandlingTime,
              maxHandlingTime: values.maxHandlingTime,
            },
          ]
        : [],
      ...(values.salePrice && { salePrice: values.salePrice }),
      ...(salePriceEffectiveDate && { salePriceEffectiveDate }),
      variants: formattedVariants,
      brand: values.brand,
      condition: values.condition,
      availability: values.availability,
      customizable: values.customizable,
      isBundle: values.isBundle,
      multipack: values.multipack,
      minimumOrderQuantity: values.minimumOrderQuantity,
      seoTitle: values.seoTitle,
      seoDescription: values.seoDescription,
      identifierExists: values.identifierExists,
      averageRating: values.averageRating,
      reviews:
        values.reviews?.map((review) => ({
          rating: review.rating,
        })) || [],
    };

    return productData;
  };

  const handleEdit = (record) => {
    setEditingProduct(record);
    setIsModalVisible(true);

    let salePriceEffectiveDate = undefined;
    if (record.salePriceEffectiveDate) {
      salePriceEffectiveDate = [
        moment(record.salePriceEffectiveDate.start),
        moment(record.salePriceEffectiveDate.end),
      ];
    }

    const formattedData = {
      ...record,
      categories: Array.isArray(record.categories)
        ? record.categories.map((cat) =>
            typeof cat === "object" ? cat._id : String(cat)
          )
        : [],
      subcategories: Array.isArray(record.subcategories)
        ? record.subcategories.map((sub) =>
            typeof sub === "object" ? sub._id : String(sub)
          )
        : [],
      shippingCountry: record.shipping?.[0]?.country,
      shippingRegion: record.shipping?.[0]?.region,
      shippingService: record.shipping?.[0]?.service,
      shippingPrice: record.shipping?.[0]?.price,
      minHandlingTime: record.shipping?.[0]?.minHandlingTime,
      maxHandlingTime: record.shipping?.[0]?.maxHandlingTime,
      mainImage: record.image
        ? [
            {
              uid: "-1",
              name: "main-image.png",
              status: "done",
              url: record.image,
              thumbUrl: record.image,
              type: "image/jpeg",
            },
          ]
        : [],
      pdfImage: record.pdfImage
        ? [
            {
              uid: "-2",
              name: "pdf-image.png",
              status: "done",
              url: record.pdfImage,
              thumbUrl: record.pdfImage,
               type: record.pdfImage.includes('.mp4') ? 'video/mp4' : 'image/jpeg',
            },
          ]
        : [],
      additionalImages:
        record.additionalImages?.map((url, index) => ({
          uid: `${index}`,
          name: `image-${index}.png`,
          status: "done",
          url,
          thumbUrl: url,
        type: url.includes('.mp4') ? 'video/mp4' : 'image/jpeg',
        })) || [],
      salePriceEffectiveDate,
      variants: record.variants?.map((variant, variantIndex) => ({
        ...variant,
        dimensions: {
          length: variant.dimensions?.length || 0,
          width: variant.dimensions?.width || 0,
          height: variant.dimensions?.height || 0,
          unit: variant.dimensions?.unit || "in",
        },
        variantDetail: {
          material: variant.variantDetail?.material || [],
          colormodel: variant.variantDetail?.colormodel || [],
          finishing: variant.variantDetail?.finishing || [],
          addon: variant.variantDetail?.addon || [],
          turnaround: variant.variantDetail?.turnaround || [],
          faqs: variant.variantDetail?.faqs || [],
        },
        variantSpecifications:
          variant.variantSpecifications?.map((spec, specIndex) => ({
            ...spec,
            image: spec.image
              ? [
                  {
                    uid: `spec-${variantIndex}-${specIndex}`,
                    name: `spec-image-${specIndex}.png`,
                    status: "done",
                    url: spec.image,
                    thumbUrl: spec.image,
                    type: "image/jpeg",
                  },
                ]
              : [],
          })) || [],
        detailDescription:
          variant.detailDescription?.map((desc, descIndex) => ({
            description: desc.description || "",
            image: desc.image
              ? [
                  {
                    uid: `desc-${variantIndex}-${descIndex}`,
                    name: `desc-image-${descIndex}.png`,
                    status: "done",
                    url: desc.image,
                    thumbUrl: desc.image,
                    type: "image/jpeg",
                  },
                ]
              : [],
          })) || [],
      })) || [],
      reviews:
        record.reviews?.map((review) => ({
          rating: review.rating,
        })) || [],
    };

    console.log("Setting form data for edit:", JSON.stringify(formattedData, null, 2));
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
          const response = await product.delete(`/${record._id}`);
          if (response.status === 204 || response.data?.success) {
            message.success("Product deleted successfully");
            fetchProducts();
          } else {
            message.error(response.data?.message || "Failed to delete product");
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
    console.log("normFile input:", JSON.stringify(e, null, 2));
    if (Array.isArray(e)) return e;
    const fileList = e?.fileList || [];
    console.log("normFile output:", JSON.stringify(fileList, null, 2));
    return fileList;
  };

  const validateImage = (_, value) => {
    if (!value || value.length === 0 || !value.some((file) => file.status === "done")) {
      return Promise.reject(new Error("Please upload an image!"));
    }
    return Promise.resolve();
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
          rowKey="_id"
          bordered
          className="product-table"
          pagination={{ pageSize: 10 }}
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
              isBundle: true,
              customizable: true,
              condition: "new",
              availability: "in stock",
              priceCurrency: "GBP",
              dimensionUnit: "in",
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
              rules={[{ required: true, message: "Please input product title!" }]}
            >
              <Input placeholder="Enter product title" />
            </Form.Item>

            <Form.Item
              name="description"
              label="Product Description"
              rules={[{ required: true, message: "Please input description!" }]}
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
                  label="Categories"
                  rules={[{ required: true, message: "Please select at least one category!" }]}
                >
                  <Select
                    mode="multiple"
                    placeholder="Select categories"
                    optionLabelProp="label"
                    showArrow
                    style={{ width: "100%" }}
                  >
                    {categories.map((category) => (
                      <Option
                        key={category._id}
                        value={category._id}
                        label={category.title || category.name}
                      >
                        <div style={{ display: "flex", alignItems: "center" }}>
                          <input
                            type="checkbox"
                            checked={undefined}
                            readOnly
                            style={{ marginRight: 8 }}
                          />
                          {category.title || category.name}
                        </div>
                      </Option>
                    ))}
                  </Select>
                </Form.Item>
              </Col>
              <Col span={12}>
                <Form.Item
                  name="subcategories"
                  label="Subcategories"
                  rules={[{ required: true, message: "Please select at least one subcategory!" }]}
                >
                  <Select
                    mode="multiple"
                    placeholder="Select subcategories"
                    optionLabelProp="label"
                    showArrow
                    style={{ width: "100%" }}
                  >
                    {subcategories.map((subcategory) => (
                      <Option
                        key={subcategory._id}
                        value={subcategory._id}
                        label={subcategory.title || subcategory.name}
                      >
                        <div style={{ display: "flex", alignItems: "center" }}>
                          <input
                            type="checkbox"
                            readOnly
                            style={{ marginRight: 8 }}
                          />
                          {subcategory.title || subcategory.name}
                        </div>
                      </Option>
                    ))}
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
              getValueFromEvent={normFile}
              rules={[{ validator: validateImage }]}
            >
              <CloudinaryUploader
                cloudName={cloudName}
                uploadPreset={uploadPreset}
                listType="picture-card"
                maxCount={1}
                onUploadSuccess={(fileList) => {
                  console.log("Main Image uploaded:", JSON.stringify(fileList, null, 2));
                  form.setFieldValue("mainImage", fileList);
                }}
                fileList={form.getFieldValue("mainImage") || []}
              />
            </Form.Item>

            <Form.Item
              name="pdfImage"
              label="PDF Image"
              valuePropName="fileList"
              getValueFromEvent={normFile}
            >
              <CloudinaryUploader
                cloudName={cloudName}
                uploadPreset={uploadPreset}
                listType="picture-card"
                maxCount={1}
                onUploadSuccess={(fileList) => {
                  console.log("PDF Image uploaded:", JSON.stringify(fileList, null, 2));
                  form.setFieldValue("pdfImage", fileList);
                }}
                fileList={form.getFieldValue("pdfImage") || []}
              />
            </Form.Item>

            <Form.Item
              name="additionalImages"
              label="Additional Images"
              valuePropName="fileList"
              getValueFromEvent={normFile}
            >
              <CloudinaryUploader
                cloudName={cloudName}
                uploadPreset={uploadPreset}
                listType="picture-card"
                maxCount={10}
                onUploadSuccess={(fileList) => {
                  console.log("Additional Images uploaded:", JSON.stringify(fileList, null, 2));
                  form.setFieldValue("additionalImages", fileList);
                }}
                fileList={form.getFieldValue("additionalImages") || []}
              />
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
                    formatter={(value) => `£ ${value}`}
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
                    formatter={(value) => `£ ${value}`}
                  />
                </Form.Item>
              </Col>
              <Col span={8}>
                <Form.Item name="priceCurrency" label="Currency">
                  <Select disabled>
                    <Option value="GBP">GBP</Option>
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
                <Form.Item
                  name="shippingCountry"
                  label="Country"
                  initialValue="UK"
                >
                  <Input placeholder="e.g., UK" />
                </Form.Item>
              </Col>
              <Col span={6}>
                <Form.Item
                  name="shippingRegion"
                  label="Region"
                  initialValue="Scotland"
                >
                  <Input placeholder="e.g., Scotland" />
                </Form.Item>
              </Col>
              <Col span={6}>
                <Form.Item
                  name="shippingService"
                  label="Service"
                  initialValue="Standard"
                >
                  <Input placeholder="e.g., Standard" />
                </Form.Item>
              </Col>
              <Col span={6}>
                <Form.Item name="shippingPrice" label="Price" initialValue={0}>
                  <InputNumber
                    style={{ width: "100%" }}
                    min={0}
                    step={0.01}
                    placeholder="0.00"
                  />
                </Form.Item>
              </Col>
            </Row>

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
                            rules={[{ required: true, message: "Missing variant title" }]}
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

                      <Divider orientation="left">Dimensions</Divider>
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

                      <Divider orientation="left">Material</Divider>
                      <Form.List name={[name, "variantDetail", "material"]}>
                        {(fields, { add, remove }) => (
                          <>
                            {fields.map(({ key, name: fieldName, ...restField }) => (
                              <Row key={key} gutter={16}>
                                <Col span={22}>
                                  <Form.Item
                                    {...restField}
                                    name={fieldName}
                                    rules={[{ required: true, message: "Enter material" }]}
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
                            ))}
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

                      <Divider orientation="left">Color Model</Divider>
                      <Form.List name={[name, "variantDetail", "colormodel"]}>
                        {(fields, { add, remove }) => (
                          <>
                            {fields.map(({ key, name: fieldName, ...restField }) => (
                              <Row key={key} gutter={16}>
                                <Col span={22}>
                                  <Form.Item
                                    {...restField}
                                    name={fieldName}
                                    rules={[{ required: true, message: "Enter color model" }]}
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
                            ))}
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

                      <Divider orientation="left">Finishing</Divider>
                      <Form.List name={[name, "variantDetail", "finishing"]}>
                        {(fields, { add, remove }) => (
                          <>
                            {fields.map(({ key, name: fieldName, ...restField }) => (
                              <Row key={key} gutter={16}>
                                <Col span={22}>
                                  <Form.Item
                                    {...restField}
                                    name={fieldName}
                                    rules={[{ required: true, message: "Enter finishing" }]}
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
                            ))}
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

                      <Divider orientation="left">Add-ons</Divider>
                      <Form.List name={[name, "variantDetail", "addon"]}>
                        {(fields, { add, remove }) => (
                          <>
                            {fields.map(({ key, name: fieldName, ...restField }) => (
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
                            ))}
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

                      <Divider orientation="left">Turnaround</Divider>
                      <Form.List name={[name, "variantDetail", "turnaround"]}>
                        {(fields, { add, remove }) => (
                          <>
                            {fields.map(({ key, name: fieldName, ...restField }) => (
                              <Row key={key} gutter={16}>
                                <Col span={22}>
                                  <Form.Item
                                    {...restField}
                                    name={fieldName}
                                    rules={[{ required: true, message: "Enter turnaround" }]}
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
                            ))}
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

                      <Divider orientation="left">FAQs</Divider>
                      <Form.List name={[name, "variantDetail", "faqs"]}>
                        {(fields, { add, remove }) => (
                          <>
                            {fields.map(({ key, name: fieldName, ...restField }) => (
                              <div key={key} style={{ marginBottom: 8 }}>
                                <Row gutter={16}>
                                  <Col span={11}>
                                    <Form.Item
                                      {...restField}
                                      name={[fieldName, "question"]}
                                      rules={[{ required: true, message: "Enter question" }]}
                                    >
                                      <Input placeholder="Question" />
                                    </Form.Item>
                                  </Col>
                                  <Col span={11}>
                                    <Form.Item
                                      {...restField}
                                      name={[fieldName, "answer"]}
                                      rules={[{ required: true, message: "Enter answer" }]}
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
                            ))}
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

                      <Divider orientation="left">Variant Specifications</Divider>
                      <Form.List name={[name, "variantSpecifications"]}>
                        {(fields, { add, remove }) => (
                          <>
                            {fields.map(({ key, name: fieldName, ...restField }) => (
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
                                  <Col span={24} style={{ marginBottom: 16 }}>
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
                                  <Col span={24} style={{ textAlign: "center", marginBottom: 16 }}>
                                    <Form.Item
                                      {...restField}
                                      name={[fieldName, "image"]}
                                      valuePropName="fileList"
                                      getValueFromEvent={normFile}
                                      rules={[{ validator: validateImage }]}
                                    >
                                      <CloudinaryUploader
                                        cloudName={cloudName}
                                        uploadPreset={uploadPreset}
                                        listType="picture-card"
                                        maxCount={1}
                                        onUploadSuccess={(fileList) => {
                                          console.log(`Variant Spec Image uploaded [${name}][${fieldName}]:`, JSON.stringify(fileList, null, 2));
                                          form.setFieldValue(["variants", name, "variantSpecifications", fieldName, "image"], fileList);
                                        }}
                                        fileList={form.getFieldValue(["variants", name, "variantSpecifications", fieldName, "image"]) || []}
                                      />
                                    </Form.Item>
                                  </Col>
                                </Row>

                                <Row gutter={16} align="middle">
                                  <Col span={8}>
                                    <Form.Item
                                      {...restField}
                                      name={[fieldName, "title"]}
                                      rules={[{ required: true, message: "Enter title" }]}
                                    >
                                      <Input placeholder="Title" />
                                    </Form.Item>
                                  </Col>
                                  <Col span={14}>
                                    <Form.Item
                                      {...restField}
                                      name={[fieldName, "description"]}
                                      rules={[{ required: true, message: "Enter description" }]}
                                    >
                                      <TextArea
                                        placeholder="Description"
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
                            ))}
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

                      <Divider orientation="left">Detail Description</Divider>
                      <Form.List name={[name, "detailDescription"]}>
                        {(descFields, { add: addDesc, remove: removeDesc }) => (
                          <>
                            {descFields.map(({ key: descKey, name: descName, ...descRestField }) => (
                              <div
                                key={descKey}
                                style={{
                                  marginBottom: 16,
                                  border: "1px solid #d9d9d9",
                                  padding: 16,
                                  borderRadius: 4,
                                }}
                              >
                                <Row gutter={16}>
                                  <Col span={22}>
                                    <Form.Item
                                      {...descRestField}
                                      name={[descName, "description"]}
                                      rules={[{ required: true, message: "Please enter description!" }]}
                                    >
                                      <ReactQuill
                                        theme="snow"
                                        modules={modules}
                                        onChange={(value) => {
                                          console.log(`Detail Description updated [${name}][${descName}]:`, value);
                                          form.setFieldValue(["variants", name, "detailDescription", descName, "description"], value);
                                        }}
                                        value={form.getFieldValue(["variants", name, "detailDescription", descName, "description"]) || ""}
                                      />
                                    </Form.Item>
                                  </Col>
                                  <Col span={2}>
                                    <Button
                                      type="link"
                                      danger
                                      onClick={() => removeDesc(descName)}
                                    >
                                      Remove
                                    </Button>
                                  </Col>
                                </Row>
                                <Row gutter={16}>
                                  <Col span={24}>
                                    <Form.Item
                                      {...descRestField}
                                      name={[descName, "image"]}
                                      valuePropName="fileList"
                                      getValueFromEvent={normFile}
                                    >
                                      <CloudinaryUploader
                                        cloudName={cloudName}
                                        uploadPreset={uploadPreset}
                                        listType="picture-card"
                                        maxCount={1}
                                        onUploadSuccess={(fileList) => {
                                          console.log(`Detail Desc Image uploaded [${name}][${descName}]:`, JSON.stringify(fileList, null, 2));
                                          form.setFieldValue(["variants", name, "detailDescription", descName, "image"], fileList);
                                        }}
                                        fileList={form.getFieldValue(["variants", name, "detailDescription", descName, "image"]) || []}
                                      />
                                    </Form.Item>
                                  </Col>
                                </Row>
                              </div>
                            ))}
                            <Form.Item>
                              <Button
                                type="dashed"
                                onClick={() => addDesc()}
                                block
                                icon={<PlusOutlined />}
                              >
                                Add Detail Description
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
              Reviews
            </Divider>
            <Form.List name="reviews">
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
                        <Col span={22}>
                          <Form.Item
                            {...restField}
                            name={[name, "rating"]}
                            label="Rating"
                            rules={[
                              { required: true, message: "Please enter rating!" },
                              { type: "number", min: 1, max: 5, message: "Rating must be between 1 and 5" },
                            ]}
                          >
                            <InputNumber
                              min={1}
                              max={5}
                              placeholder="1-5"
                              style={{ width: "100%" }}
                            />
                          </Form.Item>
                        </Col>
                        <Col span={2}>
                          <Button
                            type="link"
                            danger
                            onClick={() => remove(name)}
                          >
                            Remove
                          </Button>
                        </Col>
                      </Row>
                    </div>
                  ))}
                  <Form.Item>
                    <Button
                      type="dashed"
                      onClick={() => add()}
                      block
                      icon={<PlusOutlined />}
                    >
                      Add Rating
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
                <Form.Item name="multipack" label="Multipack">
                  <InputNumber min={1} defaultValue={1} />
                </Form.Item>
              </Col>
              <Col span={8}>
                <Form.Item name="isBundle" label="Is Bundle" valuePropName="checked">
                  <Checkbox />
                </Form.Item>
              </Col>
              <Col span={8}>
                <Form.Item name="customizable" label="Customizable" valuePropName="checked">
                  <Checkbox />
                </Form.Item>
              </Col>
            </Row>

            <Divider
              orientation="left"
              style={{ fontWeight: "bold", fontSize: "16px" }}
            >
              SEO Information
            </Divider>

            <Form.Item name="seoTitle" label="SEO Title">
              <Input placeholder="Enter SEO title" />
            </Form.Item>

            <Form.Item name="seoDescription" label="SEO Description">
              <TextArea placeholder="Enter SEO description" />
            </Form.Item>
          </Form>
        </Modal>
      </Spin>
    </div>
  );
};

export default Products;