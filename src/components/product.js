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
  Upload,
} from "antd";
import {
  PlusOutlined,
  MinusCircleOutlined,
  LoadingOutlined,
} from "@ant-design/icons";
import { EditOutlined, DeleteOutlined } from "@ant-design/icons";
import ReactQuill from "react-quill";
import "./product.css";
import { category, product, subcategory } from "../utils/axios";

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
  const [isLoading, setIsLoading] = useState(true);
  const [editingProduct, setEditingProduct] = useState(null);
  const [categories, setCategories] = useState([]);
  const [subcategories, setSubcategories] = useState([]);
  const [uploading, setUploading] = useState(false);
  const [form] = Form.useForm();

  const cloudName = "dxhpud7sx";
  const uploadPreset = "sireprinting";

  // Utility function to generate slug
  const generateSlug = (
    categoryId,
    subcategoryId,
    productTitle,
    variantTitle = null
  ) => {
    const category = categories.find((cat) => cat._id === categoryId);
    const subcategory = subcategories.find((sub) => sub._id === subcategoryId);

    const categorySlug = category
      ? (category.title || category.name || "")
          .toLowerCase()
          .replace(/\s+/g, "-")
      : "";
    const subcategorySlug = subcategory
      ? (subcategory.title || subcategory.name || "")
          .toLowerCase()
          .replace(/\s+/g, "-")
      : "";
    const productSlug = productTitle
      ? productTitle.toLowerCase().replace(/\s+/g, "-")
      : "";
    const variantSlug = variantTitle
      ? variantTitle.toLowerCase().replace(/\s+/g, "-")
      : "";

    if (variantTitle) {
      return `${categorySlug}/${subcategorySlug}/${productSlug}/${variantSlug}`;
    }
    return `${categorySlug}/${subcategorySlug}/${productSlug}`;
  };

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
      title: "Slug",
      dataIndex: "slug",
      key: "slug",
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
        console.log("Form values:", values);

        // Convert all measurements to cm if they are in inches
        const convertToCm = (value, unit) => {
          if (!value) return value;
          if (unit === "in" || unit === "inch" || unit === "inches") {
            return value * 2.54; // Convert inches to cm
          }
          return value;
        };

        // Process dimensions for main product
        if (values.dimensions) {
          values.dimensions.length = convertToCm(
            values.dimensions.length,
            values.dimensions.unit
          );
          values.dimensions.width = convertToCm(
            values.dimensions.width,
            values.dimensions.unit
          );
          values.dimensions.height = convertToCm(
            values.dimensions.height,
            values.dimensions.unit
          );
          values.dimensions.unit = "cm"; // Always save as cm
        }

        // Process dimensions for variants
        if (values.variants) {
          values.variants = values.variants.map((variant) => {
            if (variant.dimensions) {
              variant.dimensions.length = convertToCm(
                variant.dimensions.length,
                variant.dimensions.unit
              );
              variant.dimensions.width = convertToCm(
                variant.dimensions.width,
                variant.dimensions.unit
              );
              variant.dimensions.height = convertToCm(
                variant.dimensions.height,
                variant.dimensions.unit
              );
              variant.dimensions.unit = "cm"; // Always save as cm
            }
            return variant;
          });
        }

        // Clean empty strings before sending
        const cleanValues = JSON.parse(
          JSON.stringify(values, (key, value) => {
            if (value === "" || value === null || value === undefined)
              return undefined;
            if (Array.isArray(value)) {
              return value
                .map((item) => {
                  if (typeof item === "object") {
                    return JSON.parse(
                      JSON.stringify(item, (k, v) =>
                        v === "" || v === null || v === undefined
                          ? undefined
                          : v
                      )
                    );
                  }
                  return item;
                })
                .filter((item) => item !== undefined);
            }
            return value;
          })
        );

        console.log("Cleaned values:", cleanValues);

        setIsLoading(true);
        try {
          const productData = formatProductData(cleanValues);
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

  // Helper function to extract image URL
  const getImageUrl = (file) => {
    if (!file) return undefined;

    if (file.response?.secure_url && file.response.secure_url.trim() !== "") {
      return file.response.secure_url;
    }
    if (file.response?.url && file.response.url.trim() !== "") {
      return file.response.url;
    }
    if (file.url && file.url.trim() !== "") {
      return file.url;
    }
    if (file.thumbUrl && file.thumbUrl.trim() !== "") {
      return file.thumbUrl;
    }
    return undefined;
  };

  const formatProductData = (values) => {
    let salePriceEffectiveDate;
    if (
      values.salePriceEffectiveDate &&
      Array.isArray(values.salePriceEffectiveDate)
    ) {
      const startDate = values.salePriceEffectiveDate[0];
      const endDate = values.salePriceEffectiveDate[1];

      if (
        startDate &&
        typeof startDate === "object" &&
        startDate._isAMomentObject
      ) {
        salePriceEffectiveDate = {
          start: startDate.format(),
          end: endDate?.format() || startDate.format(),
        };
      } else if (startDate) {
        salePriceEffectiveDate = {
          start: startDate.toString(),
          end: endDate?.toString() || startDate.toString(),
        };
      }
    }

    // Generate product slug
    const productSlug = generateSlug(
      values.categories?.[0],
      values.subcategories?.[0],
      values.title
    );

    // Format main product variant details
    const mainVariantDetail = {
      material: values.material || [],
      colormodel: values.colormodel || [],
      finishing: values.finishing || [],
      addon: values.addon || [],
      turnaround: values.turnaround || [],
      faqs: values.faqs || [],
    };

    // Format main product specifications - filter out empty images
    const mainSpecifications =
      values.specifications
        ?.map((spec) => {
          const imageUrl = getImageUrl(spec.image?.[0]);
          if (!imageUrl) {
            // Return object without image field if no image
            return {
              title: spec.title,
              description: spec.description,
            };
          }
          return {
            image: imageUrl,
            title: spec.title,
            description: spec.description,
          };
        })
        .filter((spec) => spec.title && spec.description) || [];

    // Format main product detail description - filter out empty images
    const mainDetailDescription =
      values.detailDescription
        ?.map((desc) => {
          const imageUrl = getImageUrl(desc.image?.[0]);
          const descObj = {
            description: desc.description,
          };
          if (imageUrl) {
            descObj.image = imageUrl;
          }
          return descObj;
        })
        .filter((desc) => desc.description) || [];

    // Format variants with ALL fields
    const formattedVariants =
      values.variants?.map((variant) => {
        const variantSlug = generateSlug(
          values.categories?.[0],
          values.subcategories?.[0],
          values.title,
          variant.variantTitle
        );

        // Format variant detail
        const variantDetail = {
          material: variant.material || [],
          colormodel: variant.colormodel || [],
          finishing: variant.finishing || [],
          addon: variant.addon || [],
          turnaround: variant.turnaround || [],
          faqs: variant.faqs || [],
        };

        // Format variant specifications - filter out empty images
        const variantSpecifications =
          variant.variantSpecifications
            ?.map((spec) => {
              const imageUrl = getImageUrl(spec.image?.[0]);
              if (!imageUrl) {
                return {
                  title: spec.title,
                  description: spec.description,
                };
              }
              return {
                image: imageUrl,
                title: spec.title,
                description: spec.description,
              };
            })
            .filter((spec) => spec.title && spec.description) || [];

        // Format variant detail description - filter out empty images
        const variantDetailDescription =
          variant.detailDescription
            ?.map((desc) => {
              const imageUrl = getImageUrl(desc.image?.[0]);
              const descObj = {
                description: desc.description,
              };
              if (imageUrl) {
                descObj.image = imageUrl;
              }
              return descObj;
            })
            .filter((desc) => desc.description) || [];

        return {
          variantTitle: variant.variantTitle,
          variantDescription: variant.variantDescription,
          price: variant.price,
          salePrice: variant.salePrice,
          seoTitle: variant.seoTitle,
          seoDescription: variant.seoDescription,
          slug: variantSlug,
          dimensions: {
            length: variant.dimensions?.length || 0,
            width: variant.dimensions?.width || 0,
            height: variant.dimensions?.height || 0,
            unit: variant.dimensions?.unit || "cm",
          },
          variantDetail: variantDetail,
          variantSpecifications: variantSpecifications,
          detailTitle: variant.detailTitle,
          detailSubtitle: variant.detailSubtitle,
          detailDescription: variantDetailDescription,
        };
      }) || [];

    const productData = {
      gtin: values.gtin,
      mpn: values.mpns,
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
      googleProductCategory:
        values.googleProductCategory ||
        "Office Supplies > General Office Supplies > Shipping Supplies > Boxes",
      productType: values.productType || "Packaging Boxes>Custom Printed Boxes",
      slug: productSlug,
      brand: values.brand || "SirePrinting",
      condition: values.condition || "new",
      availability: values.availability || "in stock",
      customizable:
        values.customizable !== undefined ? values.customizable : true,
      isBundle: values.isBundle !== undefined ? values.isBundle : false,
      multipack: values.multipack || 1,
      minimumOrderQuantity: values.minimumOrderQuantity || 1,
      identifierExists:
        values.identifierExists !== undefined ? values.identifierExists : true,
      averageRating: values.averageRating || 0,
      schemaName: values.schemaName,
      reviews:
        values.reviews?.map((review) => ({
          rating: review.rating || 5,
          comment: review.comment,
          userName: review.userName,
        })) || [],
    };

    // Only add image fields if they exist
    const mainImageUrl = getImageUrl(values.mainImage?.[0]);
    if (mainImageUrl) {
      productData.image = mainImageUrl;
    }

    const pdfImageUrl = getImageUrl(values.pdfImage?.[0]);
    if (pdfImageUrl) {
      productData.pdfImage = pdfImageUrl;
    }

    const additionalImages = values.additionalImages
      ?.map((img) => getImageUrl(img))
      .filter((url) => url);
    if (additionalImages && additionalImages.length > 0) {
      productData.additionalImages = additionalImages;
    }

    // Add shipping if exists
    if (values.shippingCountry) {
      productData.shipping = [
        {
          country: values.shippingCountry,
          region: values.shippingRegion,
          service: values.shippingService || "Standard",
          price: values.shippingPrice || 0,
          minHandlingTime: values.minHandlingTime || 1,
          maxHandlingTime: values.maxHandlingTime || 3,
        },
      ];
    }

    // Add sale price if exists
    if (values.salePrice !== undefined && values.salePrice !== null) {
      productData.salePrice = values.salePrice;
    }

    // Add sale price effective date if exists
    if (salePriceEffectiveDate) {
      productData.salePriceEffectiveDate = salePriceEffectiveDate;
    }

    // Add main product variant details if they exist
    if (
      mainVariantDetail.material.length > 0 ||
      mainVariantDetail.colormodel.length > 0 ||
      mainVariantDetail.finishing.length > 0
    ) {
      productData.variantDetail = mainVariantDetail;
    }

    if (mainSpecifications.length > 0) {
      productData.variantSpecifications = mainSpecifications;
      productData.specifications = mainSpecifications;
    }

    if (values.detailTitle) {
      productData.detailTitle = values.detailTitle;
    }

    if (values.detailSubtitle) {
      productData.detailSubtitle = values.detailSubtitle;
    }

    if (mainDetailDescription.length > 0) {
      productData.detailDescription = mainDetailDescription;
    }

    // Add dimensions if they exist
    if (
      values.dimensions?.length ||
      values.dimensions?.width ||
      values.dimensions?.height
    ) {
      productData.dimensions = {
        length: values.dimensions?.length || 0,
        width: values.dimensions?.width || 0,
        height: values.dimensions?.height || 0,
        unit: values.dimensions?.unit || "cm",
      };
    }

    // Add variants if they exist
    if (formattedVariants.length > 0) {
      productData.variants = formattedVariants;
    }

    // Add SEO fields if they exist
    if (values.seoTitle) {
      productData.seoTitle = values.seoTitle;
    }

    if (values.seoDescription) {
      productData.seoDescription = values.seoDescription;
    }

    // Clean the final object - remove undefined values
    const cleanObject = (obj) => {
      Object.keys(obj).forEach((key) => {
        if (obj[key] === undefined || obj[key] === null) {
          delete obj[key];
        } else if (Array.isArray(obj[key])) {
          obj[key] = obj[key]
            .map((item) =>
              typeof item === "object" ? cleanObject({ ...item }) : item
            )
            .filter((item) => item !== undefined && item !== null);
        } else if (typeof obj[key] === "object") {
          obj[key] = cleanObject({ ...obj[key] });
        }
      });
      return obj;
    };

    const finalData = cleanObject(productData);
    console.log("Final product data:", finalData);
    return finalData;
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
            },
          ]
        : [],
      additionalImages:
        record.additionalImages?.map((url, index) => ({
          uid: `${index}`,
          name: `image-${index}.png`,
          status: "done",
          url,
        })) || [],
      salePriceEffectiveDate,
      schemaName: record.schemaName,

      // Main product variant details
      material: record.variantDetail?.material || [],
      colormodel: record.variantDetail?.colormodel || [],
      finishing: record.variantDetail?.finishing || [],
      addon: record.variantDetail?.addon || [],
      turnaround: record.variantDetail?.turnaround || [],
      faqs: record.variantDetail?.faqs || [],
      detailTitle: record.detailTitle,
      detailSubtitle: record.detailSubtitle,
      dimensions: record.dimensions || {
        length: 0,
        width: 0,
        height: 0,
        unit: "cm",
      },

      // Main product specifications
      specifications:
        record.specifications?.map((spec, index) => ({
          ...spec,
          image: spec.image
            ? [
                {
                  uid: `spec-${index}`,
                  name: `spec-image-${index}.png`,
                  status: "done",
                  url: spec.image,
                },
              ]
            : [],
        })) || [],

      // Main product detail description
      detailDescription:
        record.detailDescription?.map((desc, index) => ({
          description: desc.description || "",
          image: desc.image
            ? [
                {
                  uid: `desc-${index}`,
                  name: `desc-image-${index}.png`,
                  status: "done",
                  url: desc.image,
                },
              ]
            : [],
        })) || [],

      // Variants with ALL fields
      variants:
        record.variants?.map((variant, variantIndex) => ({
          ...variant,
          seoTitle: variant.seoTitle,
          seoDescription: variant.seoDescription,
          slug: variant.slug,
          dimensions: {
            length: variant.dimensions?.length || 0,
            width: variant.dimensions?.width || 0,
            height: variant.dimensions?.height || 0,
            unit: variant.dimensions?.unit || "cm",
          },
          // Variant detail fields at root level for form
          material: variant.variantDetail?.material || [],
          colormodel: variant.variantDetail?.colormodel || [],
          finishing: variant.variantDetail?.finishing || [],
          addon: variant.variantDetail?.addon || [],
          turnaround: variant.variantDetail?.turnaround || [],
          faqs: variant.variantDetail?.faqs || [],
          detailTitle: variant.detailTitle,
          detailSubtitle: variant.detailSubtitle,
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
                    },
                  ]
                : [],
            })) || [],
        })) || [],

      reviews:
        record.reviews?.map((review) => ({
          rating: review.rating,
          comment: review.comment,
          userName: review.userName,
        })) || [],
    };

    console.log(
      "Setting form data for edit:",
      JSON.stringify(formattedData, null, 2)
    );

    // Reset form and set values
    form.resetFields();
    setTimeout(() => {
      form.setFieldsValue(formattedData);
    }, 100);
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

  // Custom upload handler for Cloudinary
  const customRequest = async ({ file, onSuccess, onError, onProgress }) => {
    const formData = new FormData();
    formData.append("file", file);
    formData.append("upload_preset", uploadPreset);
    formData.append("cloud_name", cloudName);

    try {
      setUploading(true);

      const response = await fetch(
        `https://api.cloudinary.com/v1_1/${cloudName}/upload`,
        {
          method: "POST",
          body: formData,
        }
      );

      if (!response.ok) {
        throw new Error(`Upload failed: ${response.status}`);
      }

      const data = await response.json();
      console.log("Cloudinary upload success:", data);

      // Create the file object with Cloudinary response
      const fileObject = {
        uid: file.uid,
        name: file.name,
        status: "done",
        url: data.secure_url,
        thumbUrl: data.secure_url,
        response: data,
      };

      onSuccess(fileObject, response);
      setUploading(false);
    } catch (error) {
      console.error("Cloudinary upload error:", error);
      onError(error);
      setUploading(false);
      message.error("Upload failed. Please try again.");
    }
  };

  const normFile = (e) => {
    console.log("normFile called with:", e);

    if (Array.isArray(e)) {
      return e;
    }

    if (e && e.fileList) {
      // Filter out files that are still uploading
      const filteredList = e.fileList.filter(
        (file) => file.status === "done" || file.status === "uploading"
      );
      return filteredList;
    }

    return [];
  };

  const validateImage = (_, value) => {
    console.log("Validating image:", value);
    if (
      !value ||
      value.length === 0 ||
      !value.some((file) => file.status === "done")
    ) {
      return Promise.reject(new Error("Please upload an image!"));
    }
    return Promise.resolve();
  };

  // Reusable Form List Component for variant details
  const VariantDetailSection = ({ name, restField }) => (
    <>
      {/* Material for Variant */}
      <Form.List name={[name, "material"]}>
        {(fields, { add, remove }) => (
          <>
            <Form.Item label="Material">
              {fields.map(({ key, name: fieldName, ...fieldRest }) => (
                <Row key={key} gutter={8} style={{ marginBottom: 8 }}>
                  <Col span={22}>
                    <Form.Item
                      {...fieldRest}
                      name={[fieldName]}
                      rules={[{ required: true }]}
                    >
                      <Input placeholder="Enter material" />
                    </Form.Item>
                  </Col>
                  <Col span={2}>
                    <MinusCircleOutlined onClick={() => remove(fieldName)} />
                  </Col>
                </Row>
              ))}
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

      {/* Color Model for Variant */}
      <Form.List name={[name, "colormodel"]}>
        {(fields, { add, remove }) => (
          <>
            <Form.Item label="Color Model">
              {fields.map(({ key, name: fieldName, ...fieldRest }) => (
                <Row key={key} gutter={8} style={{ marginBottom: 8 }}>
                  <Col span={22}>
                    <Form.Item
                      {...fieldRest}
                      name={[fieldName]}
                      rules={[{ required: true }]}
                    >
                      <Input placeholder="Enter color model" />
                    </Form.Item>
                  </Col>
                  <Col span={2}>
                    <MinusCircleOutlined onClick={() => remove(fieldName)} />
                  </Col>
                </Row>
              ))}
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

      {/* Finishing for Variant */}
      <Form.List name={[name, "finishing"]}>
        {(fields, { add, remove }) => (
          <>
            <Form.Item label="Finishing">
              {fields.map(({ key, name: fieldName, ...fieldRest }) => (
                <Row key={key} gutter={8} style={{ marginBottom: 8 }}>
                  <Col span={22}>
                    <Form.Item
                      {...fieldRest}
                      name={[fieldName]}
                      rules={[{ required: true }]}
                    >
                      <Input placeholder="Enter finishing" />
                    </Form.Item>
                  </Col>
                  <Col span={2}>
                    <MinusCircleOutlined onClick={() => remove(fieldName)} />
                  </Col>
                </Row>
              ))}
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

      {/* Addons for Variant */}
      <Form.List name={[name, "addon"]}>
        {(fields, { add, remove }) => (
          <>
            <Form.Item label="Addons">
              {fields.map(({ key, name: fieldName, ...fieldRest }) => (
                <Row key={key} gutter={8} style={{ marginBottom: 8 }}>
                  <Col span={22}>
                    <Form.Item {...fieldRest} name={[fieldName]}>
                      <Input placeholder="Enter addon" />
                    </Form.Item>
                  </Col>
                  <Col span={2}>
                    <MinusCircleOutlined onClick={() => remove(fieldName)} />
                  </Col>
                </Row>
              ))}
              <Button
                type="dashed"
                onClick={() => add()}
                block
                icon={<PlusOutlined />}
              >
                Add Addon
              </Button>
            </Form.Item>
          </>
        )}
      </Form.List>

      {/* Turnaround for Variant */}
      <Form.List name={[name, "turnaround"]}>
        {(fields, { add, remove }) => (
          <>
            <Form.Item label="Turnaround">
              {fields.map(({ key, name: fieldName, ...fieldRest }) => (
                <Row key={key} gutter={8} style={{ marginBottom: 8 }}>
                  <Col span={22}>
                    <Form.Item
                      {...fieldRest}
                      name={[fieldName]}
                      rules={[{ required: true }]}
                    >
                      <Input placeholder="Enter turnaround" />
                    </Form.Item>
                  </Col>
                  <Col span={2}>
                    <MinusCircleOutlined onClick={() => remove(fieldName)} />
                  </Col>
                </Row>
              ))}
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

      {/* FAQs for Variant */}
      <Form.List name={[name, "faqs"]}>
        {(fields, { add, remove }) => (
          <>
            <Form.Item label="FAQs">
              {fields.map(({ key, name: fieldName, ...fieldRest }) => (
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
                    <Col span={11}>
                      <Form.Item
                        {...fieldRest}
                        name={[fieldName, "question"]}
                        rules={[{ required: true }]}
                      >
                        <Input placeholder="Question" />
                      </Form.Item>
                    </Col>
                    <Col span={11}>
                      <Form.Item
                        {...fieldRest}
                        name={[fieldName, "answer"]}
                        rules={[{ required: true }]}
                      >
                        <Input placeholder="Answer" />
                      </Form.Item>
                    </Col>
                    <Col span={2}>
                      <MinusCircleOutlined onClick={() => remove(fieldName)} />
                    </Col>
                  </Row>
                </div>
              ))}
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
    </>
  );

  // Custom Upload Button
  const uploadButton = (
    <div>
      {uploading ? <LoadingOutlined /> : <PlusOutlined />}
      <div style={{ marginTop: 8 }}>Upload</div>
    </div>
  );

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
          width={1400}
          style={{ top: 20 }}
          okText={editingProduct ? "Update Product" : "Save Product"}
          okButtonProps={{ loading: isLoading }}
          cancelButtonProps={{ disabled: isLoading }}
        >
          <Form
            form={form}
            layout="vertical"
            initialValues={{
              multipack: 1,
              minimumOrderQuantity: 1,
              isBundle: false,
              customizable: true,
              condition: "new",
              availability: "in stock",
              priceCurrency: "USD",
              dimensionUnit: "cm",
              googleProductCategory:
                "Office Supplies > General Office Supplies > Shipping Supplies > Boxes",
              productType: "Packaging Boxes>Custom Printed Boxes",
              brand: "SirePrinting",
              identifierExists: true,
            }}
          >
            {/* Basic Information Section */}
            <Divider orientation="left">Basic Information</Divider>
            <Row gutter={16}>
              <Col span={12}>
                <Form.Item
                  name="gtin"
                  label="GTIN"
                  rules={[{ required: true }]}
                >
                  <Input placeholder="Enter GTIN" />
                </Form.Item>
              </Col>
              <Col span={12}>
                <Form.Item name="mpns" label="MPN" rules={[{ required: true }]}>
                  <Input placeholder="Enter MPN" />
                </Form.Item>
              </Col>
            </Row>

            <Form.Item
              name="title"
              label="Product Title"
              rules={[{ required: true }]}
            >
              <Input placeholder="Enter product title" />
            </Form.Item>

            <Form.Item
              name="description"
              label="Product Description"
              rules={[{ required: true }]}
            >
              <TextArea rows={4} placeholder="Enter product description" />
            </Form.Item>

            <Row gutter={16}>
              <Col span={12}>
                <Form.Item
                  name="categories"
                  label="Categories"
                  rules={[{ required: true }]}
                >
                  <Select mode="multiple" placeholder="Select categories">
                    {categories.map((cat) => (
                      <Option key={cat._id} value={cat._id}>
                        {cat.title || cat.name}
                      </Option>
                    ))}
                  </Select>
                </Form.Item>
              </Col>
              <Col span={12}>
                <Form.Item name="subcategories" label="Subcategories">
                  <Select mode="multiple" placeholder="Select subcategories">
                    {subcategories.map((sub) => (
                      <Option key={sub._id} value={sub._id}>
                        {sub.title || sub.name}
                      </Option>
                    ))}
                  </Select>
                </Form.Item>
              </Col>
            </Row>

            <Row gutter={16}>
              <Col span={12}>
                <Form.Item
                  name="googleProductCategory"
                  label="Google Product Category"
                >
                  <Input />
                </Form.Item>
              </Col>
              <Col span={12}>
                <Form.Item name="productType" label="Product Type">
                  <Input />
                </Form.Item>
              </Col>
            </Row>

            {/* Images Section */}
            <Divider orientation="left">Images & Media</Divider>
            <Form.Item
              name="mainImage"
              label="Main Image"
              valuePropName="fileList"
              getValueFromEvent={normFile}
              rules={[{ validator: validateImage }]}
              extra="Upload main product image"
            >
              <Upload
                name="mainImage"
                listType="picture-card"
                customRequest={customRequest}
                maxCount={1}
                accept="image/*"
              >
                {uploadButton}
              </Upload>
            </Form.Item>

            <Form.Item
              name="pdfImage"
              label="PDF Image"
              valuePropName="fileList"
              getValueFromEvent={normFile}
              extra="Upload PDF or additional image (Optional)"
            >
              <Upload
                name="pdfImage"
                listType="picture-card"
                customRequest={customRequest}
                maxCount={1}
                accept="image/*,application/pdf"
              >
                {uploadButton}
              </Upload>
            </Form.Item>

            <Form.Item
              name="additionalImages"
              label="Additional Images"
              valuePropName="fileList"
              getValueFromEvent={normFile}
              extra="Upload additional product images (Optional)"
            >
              <Upload
                name="additionalImages"
                listType="picture-card"
                customRequest={customRequest}
                maxCount={10}
                multiple
                accept="image/*"
              >
                {uploadButton}
              </Upload>
            </Form.Item>

            {/* Pricing Section */}
            <Divider orientation="left">Pricing & Inventory</Divider>
            <Row gutter={16}>
              <Col span={8}>
                <Form.Item
                  name="price"
                  label="Price"
                  rules={[{ required: true }]}
                >
                  <InputNumber
                    style={{ width: "100%" }}
                    min={0}
                    step={0.01}
                    placeholder="0.00"
                  />
                </Form.Item>
              </Col>
              <Col span={8}>
                <Form.Item name="salePrice" label="Sale Price">
                  <InputNumber
                    style={{ width: "100%" }}
                    min={0}
                    step={0.01}
                    placeholder="0.00"
                  />
                </Form.Item>
              </Col>
              <Col span={8}>
                <Form.Item name="priceCurrency" label="Currency">
                  <Select>
                    <Option value="GBP">GBP (£)</Option>
                    <Option value="USD">USD ($)</Option>
                    <Option value="EUR">EUR (€)</Option>
                  </Select>
                </Form.Item>
              </Col>
            </Row>

            <Row gutter={16}>
              <Col span={12}>
                <Form.Item name="salePriceEffectiveDate" label="Sale Period">
                  <DatePicker.RangePicker
                    style={{ width: "100%" }}
                    showTime
                    format="YYYY-MM-DD HH:mm"
                  />
                </Form.Item>
              </Col>
              <Col span={12}>
                <Form.Item
                  name="minimumOrderQuantity"
                  label="Minimum Order Quantity"
                >
                  <InputNumber style={{ width: "100%" }} min={1} />
                </Form.Item>
              </Col>
            </Row>

            <Row gutter={16}>
              <Col span={8}>
                <Form.Item name="brand" label="Brand">
                  <Input />
                </Form.Item>
              </Col>
              <Col span={8}>
                <Form.Item name="condition" label="Condition">
                  <Select>
                    <Option value="new">New</Option>
                    <Option value="used">Used</Option>
                    <Option value="refurbished">Refurbished</Option>
                  </Select>
                </Form.Item>
              </Col>
              <Col span={8}>
                <Form.Item name="availability" label="Availability">
                  <Select>
                    <Option value="in stock">In Stock</Option>
                    <Option value="out of stock">Out of Stock</Option>
                    <Option value="preorder">Preorder</Option>
                  </Select>
                </Form.Item>
              </Col>
            </Row>

            {/* Main Product Variant Details */}
            <Divider orientation="left">Main Product Details</Divider>

            {/* Material */}
            <Form.List name="material">
              {(fields, { add, remove }) => (
                <>
                  <Form.Item label="Material">
                    {fields.map(({ key, name, ...restField }) => (
                      <Row key={key} gutter={8} style={{ marginBottom: 8 }}>
                        <Col span={22}>
                          <Form.Item
                            {...restField}
                            name={[name]}
                            rules={[{ required: true }]}
                          >
                            <Input placeholder="Enter material" />
                          </Form.Item>
                        </Col>
                        <Col span={2}>
                          <MinusCircleOutlined onClick={() => remove(name)} />
                        </Col>
                      </Row>
                    ))}
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

            {/* Color Model */}
            <Form.List name="colormodel">
              {(fields, { add, remove }) => (
                <>
                  <Form.Item label="Color Model">
                    {fields.map(({ key, name, ...restField }) => (
                      <Row key={key} gutter={8} style={{ marginBottom: 8 }}>
                        <Col span={22}>
                          <Form.Item
                            {...restField}
                            name={[name]}
                            rules={[{ required: true }]}
                          >
                            <Input placeholder="Enter color model" />
                          </Form.Item>
                        </Col>
                        <Col span={2}>
                          <MinusCircleOutlined onClick={() => remove(name)} />
                        </Col>
                      </Row>
                    ))}
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

            {/* Finishing */}
            <Form.List name="finishing">
              {(fields, { add, remove }) => (
                <>
                  <Form.Item label="Finishing">
                    {fields.map(({ key, name, ...restField }) => (
                      <Row key={key} gutter={8} style={{ marginBottom: 8 }}>
                        <Col span={22}>
                          <Form.Item
                            {...restField}
                            name={[name]}
                            rules={[{ required: true }]}
                          >
                            <Input placeholder="Enter finishing" />
                          </Form.Item>
                        </Col>
                        <Col span={2}>
                          <MinusCircleOutlined onClick={() => remove(name)} />
                        </Col>
                      </Row>
                    ))}
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

            {/* Addons */}
            <Form.List name="addon">
              {(fields, { add, remove }) => (
                <>
                  <Form.Item label="Addons">
                    {fields.map(({ key, name, ...restField }) => (
                      <Row key={key} gutter={8} style={{ marginBottom: 8 }}>
                        <Col span={22}>
                          <Form.Item {...restField} name={[name]}>
                            <Input placeholder="Enter addon" />
                          </Form.Item>
                        </Col>
                        <Col span={2}>
                          <MinusCircleOutlined onClick={() => remove(name)} />
                        </Col>
                      </Row>
                    ))}
                    <Button
                      type="dashed"
                      onClick={() => add()}
                      block
                      icon={<PlusOutlined />}
                    >
                      Add Addon
                    </Button>
                  </Form.Item>
                </>
              )}
            </Form.List>

            {/* Turnaround */}
            <Form.List name="turnaround">
              {(fields, { add, remove }) => (
                <>
                  <Form.Item label="Turnaround">
                    {fields.map(({ key, name, ...restField }) => (
                      <Row key={key} gutter={8} style={{ marginBottom: 8 }}>
                        <Col span={22}>
                          <Form.Item
                            {...restField}
                            name={[name]}
                            rules={[{ required: true }]}
                          >
                            <Input placeholder="Enter turnaround time" />
                          </Form.Item>
                        </Col>
                        <Col span={2}>
                          <MinusCircleOutlined onClick={() => remove(name)} />
                        </Col>
                      </Row>
                    ))}
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

            {/* FAQs */}
            <Form.List name="faqs">
              {(fields, { add, remove }) => (
                <>
                  <Form.Item label="FAQs">
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
                          <Col span={11}>
                            <Form.Item
                              {...restField}
                              name={[name, "question"]}
                              rules={[{ required: true }]}
                            >
                              <Input placeholder="Question" />
                            </Form.Item>
                          </Col>
                          <Col span={11}>
                            <Form.Item
                              {...restField}
                              name={[name, "answer"]}
                              rules={[{ required: true }]}
                            >
                              <Input placeholder="Answer" />
                            </Form.Item>
                          </Col>
                          <Col span={2}>
                            <MinusCircleOutlined onClick={() => remove(name)} />
                          </Col>
                        </Row>
                      </div>
                    ))}
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

            {/* Main Product Dimensions */}
            <Divider orientation="left">
              Main Product Dimensions (in cm)
            </Divider>
            <Row gutter={16}>
              <Col span={6}>
                <Form.Item
                  name={["dimensions", "length"]}
                  label="Length (cm)"
                  rules={[{ required: true }]}
                >
                  <InputNumber
                    style={{ width: "100%" }}
                    min={0}
                    step={0.1}
                    placeholder="Length in cm"
                  />
                </Form.Item>
              </Col>
              <Col span={6}>
                <Form.Item
                  name={["dimensions", "width"]}
                  label="Width (cm)"
                  rules={[{ required: true }]}
                >
                  <InputNumber
                    style={{ width: "100%" }}
                    min={0}
                    step={0.1}
                    placeholder="Width in cm"
                  />
                </Form.Item>
              </Col>
              <Col span={6}>
                <Form.Item
                  name={["dimensions", "height"]}
                  label="Height (cm)"
                  rules={[{ required: true }]}
                >
                  <InputNumber
                    style={{ width: "100%" }}
                    min={0}
                    step={0.1}
                    placeholder="Height in cm"
                  />
                </Form.Item>
              </Col>
              <Col span={6}>
                <Form.Item
                  name={["dimensions", "unit"]}
                  label="Unit"
                  initialValue="cm"
                >
                  <Select>
                    <Option value="cm">Centimeters (cm)</Option>
                    <Option value="in">Inches (in)</Option>
                  </Select>
                </Form.Item>
              </Col>
            </Row>

            {/* Main Product Specifications */}
            <Divider orientation="left">Main Product Specifications</Divider>
            <Form.List name="specifications">
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
                            name={[name, "image"]}
                            valuePropName="fileList"
                            getValueFromEvent={normFile}
                            extra="Upload specification image (Optional)"
                          >
                            <Upload
                              name="specImage"
                              listType="picture-card"
                              customRequest={customRequest}
                              maxCount={1}
                              accept="image/*"
                            >
                              {uploadButton}
                            </Upload>
                          </Form.Item>
                        </Col>
                      </Row>
                      <Row gutter={16}>
                        <Col span={12}>
                          <Form.Item
                            {...restField}
                            name={[name, "title"]}
                            rules={[{ required: true }]}
                          >
                            <Input placeholder="Title" />
                          </Form.Item>
                        </Col>
                        <Col span={12}>
                          <Form.Item
                            {...restField}
                            name={[name, "description"]}
                            rules={[{ required: true }]}
                          >
                            <Input placeholder="Description" />
                          </Form.Item>
                        </Col>
                      </Row>
                      <Button type="danger" onClick={() => remove(name)}>
                        Remove Specification
                      </Button>
                    </div>
                  ))}
                  <Button
                    type="dashed"
                    onClick={() => add()}
                    block
                    icon={<PlusOutlined />}
                  >
                    Add Specification
                  </Button>
                </>
              )}
            </Form.List>

            {/* Main Product Detail Description */}
            <Divider orientation="left">
              Main Product Detail Description
            </Divider>
            <Form.Item name="detailTitle" label="Detail Title">
              <Input />
            </Form.Item>
            <Form.Item name="detailSubtitle" label="Detail Subtitle">
              <Input />
            </Form.Item>
            <Form.List name="detailDescription">
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
                            name={[name, "description"]}
                            rules={[{ required: true }]}
                          >
                            <ReactQuill theme="snow" modules={modules} />
                          </Form.Item>
                        </Col>
                        <Col span={2}>
                          <MinusCircleOutlined onClick={() => remove(name)} />
                        </Col>
                      </Row>
                      <Row gutter={16}>
                        <Col span={24}>
                          <Form.Item
                            {...restField}
                            name={[name, "image"]}
                            valuePropName="fileList"
                            getValueFromEvent={normFile}
                            extra="Upload detail image (Optional)"
                          >
                            <Upload
                              name="detailImage"
                              listType="picture-card"
                              customRequest={customRequest}
                              maxCount={1}
                              accept="image/*"
                            >
                              {uploadButton}
                            </Upload>
                          </Form.Item>
                        </Col>
                      </Row>
                    </div>
                  ))}
                  <Button
                    type="dashed"
                    onClick={() => add()}
                    block
                    icon={<PlusOutlined />}
                  >
                    Add Detail Description
                  </Button>
                </>
              )}
            </Form.List>

            {/* Shipping Information */}
            <Divider orientation="left">Shipping Information</Divider>
            <Row gutter={16}>
              <Col span={6}>
                <Form.Item name="shippingCountry" label="Country">
                  <Input placeholder="e.g., USA" />
                </Form.Item>
              </Col>
              <Col span={6}>
                <Form.Item name="shippingRegion" label="Region">
                  <Input placeholder="e.g., Scotland" />
                </Form.Item>
              </Col>
              <Col span={6}>
                <Form.Item name="shippingService" label="Service">
                  <Input placeholder="e.g., Standard" />
                </Form.Item>
              </Col>
              <Col span={6}>
                <Form.Item name="shippingPrice" label="Price">
                  <InputNumber style={{ width: "100%" }} min={0} step={0.01} />
                </Form.Item>
              </Col>
            </Row>
            <Row gutter={16}>
              <Col span={12}>
                <Form.Item
                  name="minHandlingTime"
                  label="Min Handling Time (days)"
                >
                  <InputNumber style={{ width: "100%" }} min={0} />
                </Form.Item>
              </Col>
              <Col span={12}>
                <Form.Item
                  name="maxHandlingTime"
                  label="Max Handling Time (days)"
                >
                  <InputNumber style={{ width: "100%" }} min={0} />
                </Form.Item>
              </Col>
            </Row>

            {/* Product Variants - COMPLETE SECTION */}
            <Divider orientation="left">Product Variants</Divider>
            <Form.List name="variants">
              {(fields, { add, remove }) => (
                <>
                  {fields.map(({ key, name, ...restField }) => (
                    <div
                      key={key}
                      style={{
                        marginBottom: 24,
                        border: "2px solid #d9d9d9",
                        padding: 20,
                        borderRadius: 6,
                      }}
                    >
                      {/* Basic Variant Info */}
                      <Row gutter={16}>
                        <Col span={12}>
                          <Form.Item
                            {...restField}
                            name={[name, "variantTitle"]}
                            label="Variant Title"
                            rules={[{ required: true }]}
                          >
                            <Input placeholder="e.g., Large Box" />
                          </Form.Item>
                        </Col>
                        <Col span={12}>
                          <Form.Item
                            {...restField}
                            name={[name, "variantDescription"]}
                            label="Variant Description"
                            rules={[{ required: true }]}
                          >
                            <Input placeholder="Description for this variant" />
                          </Form.Item>
                        </Col>
                      </Row>

                      {/* Variant Pricing */}
                      <Row gutter={16}>
                        <Col span={8}>
                          <Form.Item
                            {...restField}
                            name={[name, "price"]}
                            label="Price"
                            rules={[{ required: true }]}
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

                      {/* Variant Dimensions */}
                      <Divider orientation="left">
                        Variant Dimensions (in cm)
                      </Divider>
                      <Row gutter={16}>
                        <Col span={6}>
                          <Form.Item
                            {...restField}
                            name={[name, "dimensions", "length"]}
                            label="Length (cm)"
                            rules={[{ required: true }]}
                          >
                            <InputNumber
                              style={{ width: "100%" }}
                              min={0}
                              step={0.1}
                              placeholder="Length"
                            />
                          </Form.Item>
                        </Col>
                        <Col span={6}>
                          <Form.Item
                            {...restField}
                            name={[name, "dimensions", "width"]}
                            label="Width (cm)"
                            rules={[{ required: true }]}
                          >
                            <InputNumber
                              style={{ width: "100%" }}
                              min={0}
                              step={0.1}
                              placeholder="Width"
                            />
                          </Form.Item>
                        </Col>
                        <Col span={6}>
                          <Form.Item
                            {...restField}
                            name={[name, "dimensions", "height"]}
                            label="Height (cm)"
                            rules={[{ required: true }]}
                          >
                            <InputNumber
                              style={{ width: "100%" }}
                              min={0}
                              step={0.1}
                              placeholder="Height"
                            />
                          </Form.Item>
                        </Col>
                        <Col span={6}>
                          <Form.Item
                            {...restField}
                            name={[name, "dimensions", "unit"]}
                            label="Unit"
                            initialValue="cm"
                          >
                            <Select>
                              <Option value="cm">Centimeters (cm)</Option>
                              <Option value="in">Inches (in)</Option>
                            </Select>
                          </Form.Item>
                        </Col>
                      </Row>

                      {/* Variant Details - Material, Color, Finishing, etc. */}
                      <Divider orientation="left">Variant Details</Divider>
                      <VariantDetailSection name={name} restField={restField} />

                      {/* Variant Specifications */}
                      <Divider orientation="left">
                        Variant Specifications
                      </Divider>
                      <Form.List name={[name, "variantSpecifications"]}>
                        {(specFields, { add: addSpec, remove: removeSpec }) => (
                          <>
                            {specFields.map(
                              ({
                                key: specKey,
                                name: specName,
                                ...specRest
                              }) => (
                                <div
                                  key={specKey}
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
                                        {...specRest}
                                        name={[specName, "image"]}
                                        valuePropName="fileList"
                                        getValueFromEvent={normFile}
                                        extra="Upload variant specification image (Optional)"
                                      >
                                        <Upload
                                          name="variantSpecImage"
                                          listType="picture-card"
                                          customRequest={customRequest}
                                          maxCount={1}
                                          accept="image/*"
                                        >
                                          {uploadButton}
                                        </Upload>
                                      </Form.Item>
                                    </Col>
                                  </Row>
                                  <Row gutter={16}>
                                    <Col span={12}>
                                      <Form.Item
                                        {...specRest}
                                        name={[specName, "title"]}
                                        rules={[{ required: true }]}
                                      >
                                        <Input placeholder="Title" />
                                      </Form.Item>
                                    </Col>
                                    <Col span={12}>
                                      <Form.Item
                                        {...specRest}
                                        name={[specName, "description"]}
                                        rules={[{ required: true }]}
                                      >
                                        <Input placeholder="Description" />
                                      </Form.Item>
                                    </Col>
                                  </Row>
                                  <Button
                                    type="danger"
                                    onClick={() => removeSpec(specName)}
                                  >
                                    Remove Specification
                                  </Button>
                                </div>
                              )
                            )}
                            <Button
                              type="dashed"
                              onClick={() => addSpec()}
                              block
                              icon={<PlusOutlined />}
                            >
                              Add Variant Specification
                            </Button>
                          </>
                        )}
                      </Form.List>

                      {/* Variant Detail Description */}
                      <Divider orientation="left">
                        Variant Detail Description
                      </Divider>
                      <Form.Item
                        {...restField}
                        name={[name, "detailTitle"]}
                        label="Detail Title"
                      >
                        <Input />
                      </Form.Item>
                      <Form.Item
                        {...restField}
                        name={[name, "detailSubtitle"]}
                        label="Detail Subtitle"
                      >
                        <Input />
                      </Form.Item>
                      <Form.List name={[name, "detailDescription"]}>
                        {(descFields, { add: addDesc, remove: removeDesc }) => (
                          <>
                            {descFields.map(
                              ({
                                key: descKey,
                                name: descName,
                                ...descRest
                              }) => (
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
                                        {...descRest}
                                        name={[descName, "description"]}
                                        rules={[{ required: true }]}
                                      >
                                        <ReactQuill
                                          theme="snow"
                                          modules={modules}
                                        />
                                      </Form.Item>
                                    </Col>
                                    <Col span={2}>
                                      <MinusCircleOutlined
                                        onClick={() => removeDesc(descName)}
                                      />
                                    </Col>
                                  </Row>
                                  <Row gutter={16}>
                                    <Col span={24}>
                                      <Form.Item
                                        {...descRest}
                                        name={[descName, "image"]}
                                        valuePropName="fileList"
                                        getValueFromEvent={normFile}
                                        extra="Upload variant detail image (Optional)"
                                      >
                                        <Upload
                                          name="variantDetailImage"
                                          listType="picture-card"
                                          customRequest={customRequest}
                                          maxCount={1}
                                          accept="image/*"
                                        >
                                          {uploadButton}
                                        </Upload>
                                      </Form.Item>
                                    </Col>
                                  </Row>
                                </div>
                              )
                            )}
                            <Button
                              type="dashed"
                              onClick={() => addDesc()}
                              block
                              icon={<PlusOutlined />}
                            >
                              Add Variant Detail Description
                            </Button>
                          </>
                        )}
                      </Form.List>

                      {/* Variant SEO */}
                      <Divider orientation="left">Variant SEO</Divider>
                      <Form.Item
                        {...restField}
                        name={[name, "seoTitle"]}
                        label="SEO Title"
                      >
                        <Input placeholder="Enter variant SEO title" />
                      </Form.Item>
                      <Form.Item
                        {...restField}
                        name={[name, "seoDescription"]}
                        label="SEO Description"
                      >
                        <TextArea
                          rows={4}
                          placeholder="Enter variant SEO description"
                        />
                      </Form.Item>

                      <Button
                        type="danger"
                        onClick={() => remove(name)}
                        style={{ marginTop: 16 }}
                      >
                        Remove Variant
                      </Button>
                    </div>
                  ))}
                  <Button
                    type="dashed"
                    onClick={() => add()}
                    block
                    icon={<PlusOutlined />}
                  >
                    Add Variant
                  </Button>
                </>
              )}
            </Form.List>

            {/* Reviews */}
            <Divider orientation="left">Reviews</Divider>
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
                        <Col span={8}>
                          <Form.Item
                            {...restField}
                            name={[name, "rating"]}
                            label="Rating"
                            initialValue={5}
                          >
                            <Select>
                              <Option value={1}>1 Star</Option>
                              <Option value={2}>2 Stars</Option>
                              <Option value={3}>3 Stars</Option>
                              <Option value={4}>4 Stars</Option>
                              <Option value={5}>5 Stars</Option>
                            </Select>
                          </Form.Item>
                        </Col>
                        <Col span={8}>
                          <Form.Item
                            {...restField}
                            name={[name, "userName"]}
                            label="User Name"
                          >
                            <Input />
                          </Form.Item>
                        </Col>
                        <Col span={6}>
                          <Form.Item
                            {...restField}
                            name={[name, "comment"]}
                            label="Comment"
                          >
                            <Input />
                          </Form.Item>
                        </Col>
                        <Col span={2}>
                          <MinusCircleOutlined onClick={() => remove(name)} />
                        </Col>
                      </Row>
                    </div>
                  ))}
                  <Button
                    type="dashed"
                    onClick={() => add()}
                    block
                    icon={<PlusOutlined />}
                  >
                    Add Review
                  </Button>
                </>
              )}
            </Form.List>

            {/* Additional Information */}
            <Divider orientation="left">Additional Information</Divider>
            <Row gutter={16}>
              <Col span={8}>
                <Form.Item name="multipack" label="Multipack">
                  <InputNumber min={1} />
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
              <Col span={8}>
                <Form.Item
                  name="customizable"
                  label="Customizable"
                  valuePropName="checked"
                >
                  <Checkbox />
                </Form.Item>
              </Col>
            </Row>

            <Form.Item
              name="identifierExists"
              label="Identifier Exists"
              valuePropName="checked"
            >
              <Checkbox />
            </Form.Item>

            {/* SEO Information */}
            <Divider orientation="left">SEO Information</Divider>
            <Form.Item name="seoTitle" label="SEO Title">
              <Input placeholder="SEO title for the product" />
            </Form.Item>
            <Form.Item name="seoDescription" label="SEO Description">
              <TextArea
                rows={4}
                placeholder="SEO description for the product"
              />
            </Form.Item>

            {/* Schema Information */}
            <Divider orientation="left">Schema Information</Divider>
            <Form.Item
              name="schemaName"
              label="Schema Name"
              rules={[{ required: true }]}
            >
              <Input placeholder="Enter schema name" />
            </Form.Item>
          </Form>
        </Modal>
      </Spin>
    </div>
  );
};

export default Products;
