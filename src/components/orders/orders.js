import React, { useState, useEffect } from "react";
import {
  Table,
  Input,
  Button,
  Modal,
  Form,
  InputNumber,
  Select,
  message,
  Row,
  Col,
  Card,
  Space,
  Popconfirm,
} from "antd";
import { EditOutlined, DeleteOutlined } from "@ant-design/icons";
import { orders, user } from "../../utils/axios";
import CloudinaryUploader from "../cloudinary/CloudinaryUploader";
import "./orders.css";

const { Option } = Select;

// Add interceptor to include Bearer token in all requests
[user, orders].forEach((axiosInstance) => {
  axiosInstance.interceptors.request.use(
    (config) => {
      const token = localStorage.getItem("token");
      if (token) {
        config.headers.Authorization = `Bearer ${token}`;
      }
      return config;
    },
    (error) => Promise.reject(error)
  );
});

function Orders() {
  const [users, setUsers] = useState([]);
  const [filteredUsers, setFilteredUsers] = useState([]);
  const [searchEmail, setSearchEmail] = useState("");
  const [selectedUserOrders, setSelectedUserOrders] = useState([]);
  const [selectedUserId, setSelectedUserId] = useState(null);
  const [isOrdersModalOpen, setIsOrdersModalOpen] = useState(false);
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [currentOrder, setCurrentOrder] = useState(null);
  const [loading, setLoading] = useState(false);
  const [form] = Form.useForm();
  const [editForm] = Form.useForm();

  // Cloudinary configuration
  const cloudName = "dxhpud7sx";
  const uploadPreset = "sireprinting";

  // Fetch users on component mount
  useEffect(() => {
    fetchUsers();
  }, []);

  const fetchUsers = async () => {
    setLoading(true);
    try {
      const response = await user.get("/");
      const filtered = response.data.results.filter(
        (user) => user.role === "user"
      );
      setUsers(filtered);
      setFilteredUsers(filtered);
    } catch (error) {
      console.error("Error fetching users:", error);
      message.error("Failed to load users. Please try again later.");
    } finally {
      setLoading(false);
    }
  };

  // Filter users based on email search
  useEffect(() => {
    const filtered = users.filter((user) =>
      user.email.toLowerCase().includes(searchEmail.toLowerCase())
    );
    setFilteredUsers(filtered);
  }, [searchEmail, users]);

  // Fetch orders for a specific user
  const fetchUserOrders = async (userId) => {
    setLoading(true);
    try {
      const response = await orders.get(`/user/${userId}`);
      console.log("Orders Response:", response.data); // Log API response
      setSelectedUserOrders(response.data);
      setSelectedUserId(userId);
      setIsOrdersModalOpen(true);
    } catch (error) {
      console.error("Error fetching orders:", error);
      message.error("Failed to load orders. Please try again later.");
    } finally {
      setLoading(false);
    }
  };

  // Handle Cloudinary upload success
  const handleUploadSuccess = (data, formFieldName, formInstance) => {
    if (Array.isArray(data)) {
      formInstance.setFieldsValue({ [formFieldName]: data });
    } else if (data?.url) {
      const newFileList = [
        {
          uid: data.uid || `-${Date.now()}`,
          name: data.name || "uploaded-file",
          status: data.status || "done",
          url: data.url,
          thumbUrl: data.url,
        },
      ];
      formInstance.setFieldsValue({ [formFieldName]: newFileList });
    } else {
      message.error("File upload failed!");
    }
  };

  // Handle create order form submission
  const handleCreateOrder = async (values) => {
    setLoading(true);
    try {
      const orderData = {
        product: values.product,
        material: values.material,
        quantity: values.quantity,
        size: values.size,
        file: values.file?.[0]?.url || "",
        price: values.price,
        status: values.status,
        shippedvia: values.shippedvia || "",
        trackingid: values.trackingid || "",
        userId: values.userId,
        invoice: values.invoice?.[0]?.url || "",
        approvedStatus: values.approvedStatus,
        shippingAddress: [values.shippingAddress],
      };
      console.log("Create Order Payload:", orderData); // Log payload
      await orders.post("/", orderData);
      setIsCreateModalOpen(false);
      form.resetFields();
      message.success("Order created successfully!");
      fetchUserOrders(selectedUserId);
    } catch (error) {
      console.error(
        "Error creating order:",
        error.response?.data || error.message
      );
      message.error("Failed to create order. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  // Handle edit order
  const handleEditOrder = (order) => {
    console.log("Order to Edit:", order); // Log order to inspect
    setCurrentOrder(order);
    editForm.setFieldsValue({
      product: order.product || "",
      material: order.material || "",
      quantity: order.quantity || 1,
      size: order.size || { length: 0, width: 0, height: 0, unit: "in" },
      file:
        typeof order.file === "string" && order.file
          ? [{ uid: "-1", name: "file", status: "done", url: order.file }]
          : [],
      price: order.price || 0,
      status: order.status || "Pending",
      shippedvia: order.shippedvia || "",
      trackingid: order.trackingid || "",
      invoice:
        typeof order.invoice === "string" && order.invoice
          ? [{ uid: "-2", name: "invoice", status: "done", url: order.invoice }]
          : [],
      approvedStatus: order.approvedStatus || "Pending",
      shippingAddress:
        Array.isArray(order.shippingAddress) && order.shippingAddress.length > 0
          ? order.shippingAddress[0]
          : {
              name: "",
              companyName: "",
              phoneNumber: "",
              streetAddress: "",
              city: "",
              province: "",
              zipCode: "",
              country: "",
            },
    });
    setIsEditModalOpen(true);
  };

  // Handle update order form submission
  const handleUpdateOrder = async (values) => {
    setLoading(true);
    try {
      const orderData = {
        product: values.product,
        material: values.material,
        quantity: values.quantity,
        size: values.size,
        file: values.file?.[0]?.url || currentOrder.file || "",
        price: values.price,
        status: values.status,
        shippedvia: values.shippedvia || "",
        trackingid: values.trackingid || "",
        invoice: values.invoice?.[0]?.url || currentOrder.invoice || "",
        approvedStatus: values.approvedStatus,
        shippingAddress: values.shippingAddress
          ? [values.shippingAddress]
          : currentOrder.shippingAddress || [
              {
                name: "",
                companyName: "",
                phoneNumber: "",
                streetAddress: "",
                city: "",
                province: "",
                zipCode: "",
                country: "",
              },
            ],
      };
      console.log("Update Order Payload:", orderData); // Log payload
      await orders.patch(`/${currentOrder._id}`, orderData);
      setIsEditModalOpen(false);
      editForm.resetFields();
      message.success("Order updated successfully!");
      fetchUserOrders(selectedUserId);
    } catch (error) {
      console.error(
        "Error updating order:",
        error.response?.data || error.message
      );
      message.error("Failed to update order. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  // Handle delete order
  const handleDeleteOrder = async (orderId) => {
    setLoading(true);
    try {
      await orders.delete(`/${orderId}`);
      message.success("Order deleted successfully!");
      fetchUserOrders(selectedUserId);
    } catch (error) {
      console.error("Error deleting order:", error);
      message.error("Failed to delete order. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  // User table columns
  const userColumns = [
    {
      title: "Name",
      dataIndex: "name",
      key: "name",
    },
    {
      title: "Email",
      dataIndex: "email",
      key: "email",
    },
    {
      title: "Phone",
      dataIndex: "phone",
      key: "phone",
      render: (phone) => phone || "N/A",
    },
    {
      title: "Actions",
      key: "actions",
      render: (_, record) => (
        <Button
          type="primary"
          className="view-orders-btn"
          onClick={() => fetchUserOrders(record.id)}
          loading={loading && selectedUserId === record.id}
        >
          View Orders
        </Button>
      ),
    },
  ];

  // Orders table columns
  const orderColumns = [
    {
      title: "Product",
      dataIndex: "product",
      key: "product",
    },
    {
      title: "Material",
      dataIndex: "material",
      key: "material",
    },
    {
      title: "Quantity",
      dataIndex: "quantity",
      key: "quantity",
    },
    {
      title: "Size",
      key: "size",
      render: (_, record) =>
        record.size
          ? `${record.size.length}x${record.size.width}x${record.size.height} ${record.size.unit}`
          : "N/A",
    },
    {
      title: "File",
      dataIndex: "file",
      key: "file",
      render: (file) =>
        file ? (
          <a href={file} target="_blank" rel="noopener noreferrer">
            <img
              src={file}
              alt="Order file"
              style={{ width: 50, height: 50, objectFit: "cover" }}
            />
          </a>
        ) : (
          "N/A"
        ),
    },
    {
      title: "Price",
      dataIndex: "price",
      key: "price",
      render: (price) => `$${price || 0}`,
    },
    {
      title: "Status",
      dataIndex: "status",
      key: "status",
    },
    {
      title: "Shipped Via",
      dataIndex: "shippedvia",
      key: "shippedvia",
      render: (shippedvia) => shippedvia || "N/A",
    },
    {
      title: "Tracking ID",
      dataIndex: "trackingid",
      key: "trackingid",
      render: (trackingid) => trackingid || "N/A",
    },
    {
      title: "Invoice",
      dataIndex: "invoice",
      key: "invoice",
      render: (invoice) =>
        invoice ? (
          <a href={invoice} target="_blank" rel="noopener noreferrer">
            <img
              src={invoice}
              alt="Invoice"
              style={{ width: 50, height: 50, objectFit: "cover" }}
            />
          </a>
        ) : (
          "N/A"
        ),
    },
    {
      title: "Approved Status",
      dataIndex: "approvedStatus",
      key: "approvedStatus",
    },
    {
      title: "Shipping Address",
      key: "shippingAddress",
      render: (_, record) =>
        record.shippingAddress?.[0]
          ? `${record.shippingAddress[0].name}, ${record.shippingAddress[0].streetAddress}, ${record.shippingAddress[0].city}, ${record.shippingAddress[0].country}`
          : "N/A",
    },
    {
      title: "Actions",
      key: "actions",
      render: (_, record) => (
        <Space size="middle">
          <Button
            type="link"
            icon={<EditOutlined />}
            onClick={() => handleEditOrder(record)}
          />
          <Popconfirm
            title="Are you sure to delete this order?"
            onConfirm={() => handleDeleteOrder(record._id)}
            okText="Yes"
            cancelText="No"
          >
            <Button type="link" danger icon={<DeleteOutlined />} />
          </Popconfirm>
        </Space>
      ),
    },
  ];

  return (
    <div className="orders-container">
      {/* Search Input */}
      <div className="orders-header">
        <Input
          placeholder="Search by email..."
          value={searchEmail}
          onChange={(e) => setSearchEmail(e.target.value)}
          className="search-input"
        />
      </div>

      {/* Users Table */}
      <Table
        columns={userColumns}
        dataSource={filteredUsers}
        rowKey="id"
        className="users-table"
        loading={loading}
      />

      {/* Orders Modal */}
      <Modal
        title={`User Orders (${selectedUserOrders.length})`}
        open={isOrdersModalOpen}
        onCancel={() => {
          setIsOrdersModalOpen(false);
          setSelectedUserId(null);
        }}
        footer={[
          <Button
            key="create"
            type="primary"
            className="create-order-btn"
            onClick={() => setIsCreateModalOpen(true)}
          >
            Create Order
          </Button>,
          <Button
            key="close"
            type="default"
            className="modal-close-btn"
            onClick={() => {
              setIsOrdersModalOpen(false);
              setSelectedUserId(null);
            }}
          >
            Close
          </Button>,
        ]}
        width={1500}
      >
        <Card className="orders-card" title="Order Details">
          <Table
            columns={orderColumns}
            dataSource={selectedUserOrders}
            rowKey="_id"
            scroll={{ x: 1500 }}
            bordered
            size="middle"
            loading={loading}
          />
        </Card>
      </Modal>

      {/* Create Order Modal */}
      <Modal
        title="Create New Order"
        open={isCreateModalOpen}
        onCancel={() => {
          setIsCreateModalOpen(false);
          form.resetFields();
        }}
        footer={null}
        width={800}
      >
        <Form
          form={form}
          onFinish={handleCreateOrder}
          layout="vertical"
          initialValues={{
            product: "",
            material: "",
            quantity: 1,
            size: { length: 0, width: 0, height: 0, unit: "in" },
            file: [],
            price: 0,
            status: "Pending",
            shippedvia: "",
            trackingid: "",
            userId: selectedUserId || "",
            invoice: [],
            approvedStatus: "Pending",
            shippingAddress: {
              name: "",
              companyName: "",
              phoneNumber: "",
              streetAddress: "",
              city: "",
              province: "",
              zip朝鮮: "",
              country: "",
            },
          }}
        >
          <Row gutter={16}>
            <Col span={12}>
              <Form.Item
                name="product"
                label="Product"
                rules={[{ required: true, message: "Please select a product" }]}
              >
                <Select placeholder="Select a product">
                  <Option value="random">Random Sample</Option>
                  <Option value="custom">Custom Sample</Option>
                  <Option value="premium">Premium Sample</Option>
                </Select>
              </Form.Item>
            </Col>
            <Col span={12}>
              <Form.Item
                name="material"
                label="Material"
                rules={[{ required: true, message: "Please enter material" }]}
              >
                <Input />
              </Form.Item>
            </Col>
          </Row>
          <Row gutter={16}>
            <Col span={12}>
              <Form.Item
                name="quantity"
                label="Quantity"
                rules={[{ required: true, message: "Please enter quantity" }]}
              >
                <InputNumber min={1} className="w-full" />
              </Form.Item>
            </Col>
            <Col span={12}>
              <Form.Item
                name="price"
                label="Price"
                rules={[{ required: true, message: "Please enter price" }]}
              >
                <InputNumber min={0} className="w-full" />
              </Form.Item>
            </Col>
          </Row>
          <Form.Item label="Size (Length x Width x Height)">
            <div className="size-inputs">
              <Form.Item
                name={["size", "length"]}
                noStyle
                rules={[{ required: true, message: "Please enter length" }]}
              >
                <InputNumber placeholder="Length" min={0} />
              </Form.Item>
              <Form.Item
                name={["size", "width"]}
                noStyle
                rules={[{ required: true, message: "Please enter width" }]}
              >
                <InputNumber placeholder="Width" min={0} />
              </Form.Item>
              <Form.Item
                name={["size", "height"]}
                noStyle
                rules={[{ required: true, message: "Please enter height" }]}
              >
                <InputNumber placeholder="Height" min={0} />
              </Form.Item>
              <Form.Item name={["size", "unit"]} noStyle>
                <Select>
                  <Option value="in">in</Option>
                  <Option value="cm">cm</Option>
                  <Option value="mm">mm</Option>
                </Select>
              </Form.Item>
            </div>
          </Form.Item>
          <Row gutter={16}>
            <Col span={12}>
              <Form.Item
                name="file"
                label="File"
                valuePropName="fileList"
                getValueFromEvent={(e) => {
                  if (!e || !e.fileList) return [];
                  return Array.isArray(e.fileList) ? e.fileList : [];
                }}
              >
                <CloudinaryUploader
                  uploadPreset={uploadPreset}
                  cloudName={cloudName}
                  listType="picture-card"
                  fileList={form.getFieldValue("file") || []}
                  onUploadSuccess={(data) =>
                    handleUploadSuccess(data, "file", form)
                  }
                />
              </Form.Item>
            </Col>
            <Col span={12}>
              <Form.Item
                name="invoice"
                label="Invoice Image"
                valuePropName="fileList"
                getValueFromEvent={(e) => {
                  if (!e || !e.fileList) return [];
                  return Array.isArray(e.fileList) ? e.fileList : [];
                }}
              >
                <CloudinaryUploader
                  uploadPreset={uploadPreset}
                  cloudName={cloudName}
                  listType="picture-card"
                  fileList={form.getFieldValue("invoice") || []}
                  onUploadSuccess={(data) =>
                    handleUploadSuccess(data, "invoice", form)
                  }
                />
              </Form.Item>
            </Col>
          </Row>
          <Row gutter={16}>
            <Col span={12}>
              <Form.Item
                name="status"
                label="Status"
                rules={[{ required: true, message: "Please select status" }]}
              >
                <Select>
                  <Option value="Pending">Pending</Option>
                  <Option value="Shipped">Shipped</Option>
                  <Option value="Delivered">Delivered</Option>
                </Select>
              </Form.Item>
            </Col>
            <Col span={12}>
              <Form.Item
                name="approvedStatus"
                label="Approved Status"
                rules={[
                  { required: true, message: "Please select approved status" },
                ]}
              >
                <Select>
                  <Option value="Pending">Pending</Option>
                  <Option value="Approved">Approved</Option>
                  <Option value="Rejected">Rejected</Option>
                </Select>
              </Form.Item>
            </Col>
          </Row>
          <Row gutter={16}>
            <Col span={12}>
              <Form.Item name="shippedvia" label="Shipped Via">
                <Input />
              </Form.Item>
            </Col>
            <Col span={12}>
              <Form.Item name="trackingid" label="Tracking ID">
                <Input />
              </Form.Item>
            </Col>
          </Row>
          <Row gutter={16}>
            <Col span={12}>
              <Form.Item
                name="userId"
                label="User ID"
                rules={[{ required: true, message: "Please enter user ID" }]}
              >
                <Input disabled />
              </Form.Item>
            </Col>
          </Row>
          <Card title="Shipping Address" className="shipping-address-card">
            <Row gutter={16}>
              <Col span={12}>
                <Form.Item
                  name={["shippingAddress", "name"]}
                  label="Name"
                  rules={[{ required: true, message: "Please enter name" }]}
                >
                  <Input />
                </Form.Item>
              </Col>
              <Col span={12}>
                <Form.Item
                  name={["shippingAddress", "companyName"]}
                  label="Company Name"
                >
                  <Input />
                </Form.Item>
              </Col>
            </Row>
            <Row gutter={16}>
              <Col span={12}>
                <Form.Item
                  name={["shippingAddress", "phoneNumber"]}
                  label="Phone Number"
                  rules={[
                    { required: true, message: "Please enter phone number" },
                  ]}
                >
                  <Input />
                </Form.Item>
              </Col>
              <Col span={12}>
                <Form.Item
                  name={["shippingAddress", "streetAddress"]}
                  label="Street Address"
                  rules={[
                    { required: true, message: "Please enter street address" },
                  ]}
                >
                  <Input />
                </Form.Item>
              </Col>
            </Row>
            <Row gutter={16}>
              <Col span={12}>
                <Form.Item
                  name={["shippingAddress", "city"]}
                  label="City"
                  rules={[{ required: true, message: "Please enter city" }]}
                >
                  <Input />
                </Form.Item>
              </Col>
              <Col span={12}>
                <Form.Item
                  name={["shippingAddress", "province"]}
                  label="Province"
                  rules={[{ required: true, message: "Please enter province" }]}
                >
                  <Input />
                </Form.Item>
              </Col>
            </Row>
            <Row gutter={16}>
              <Col span={12}>
                <Form.Item
                  name={["shippingAddress", "zipCode"]}
                  label="Zip Code"
                  rules={[{ required: true, message: "Please enter zip code" }]}
                >
                  <Input />
                </Form.Item>
              </Col>
              <Col span={12}>
                <Form.Item
                  name={["shippingAddress", "country"]}
                  label="Country"
                  rules={[{ required: true, message: "Please enter country" }]}
                >
                  <Input />
                </Form.Item>
              </Col>
            </Row>
          </Card>
          <div className="form-actions">
            <Button
              onClick={() => {
                setIsCreateModalOpen(false);
                form.resetFields();
              }}
              disabled={loading}
            >
              Cancel
            </Button>
            <Button type="primary" htmlType="submit" loading={loading}>
              Create Order
            </Button>
          </div>
        </Form>
      </Modal>

      {/* Edit Order Modal */}
      <Modal
        title="Edit Order"
        open={isEditModalOpen}
        onCancel={() => {
          setIsEditModalOpen(false);
          editForm.resetFields();
        }}
        footer={null}
        width={800}
      >
        <Form form={editForm} onFinish={handleUpdateOrder} layout="vertical">
          <Row gutter={16}>
            <Col span={12}>
              <Form.Item
                name="product"
                label="Product"
                rules={[{ required: true, message: "Please select a product" }]}
              >
                <Select placeholder="Select a product">
                  <Option value="random">Random Sample</Option>
                  <Option value="custom">Custom Sample</Option>
                  <Option value="premium">Premium Sample</Option>
                </Select>
              </Form.Item>
            </Col>
            <Col span={12}>
              <Form.Item
                name="material"
                label="Material"
                rules={[{ required: true, message: "Please enter material" }]}
              >
                <Input />
              </Form.Item>
            </Col>
          </Row>
          <Row gutter={16}>
            <Col span={12}>
              <Form.Item
                name="quantity"
                label="Quantity"
                rules={[{ required: true, message: "Please enter quantity" }]}
              >
                <InputNumber min={1} className="w-full" />
              </Form.Item>
            </Col>
            <Col span={12}>
              <Form.Item
                name="price"
                label="Price"
                rules={[{ required: true, message: "Please enter price" }]}
              >
                <InputNumber min={0} className="w-full" />
              </Form.Item>
            </Col>
          </Row>
          <Form.Item label="Size (Length x Width x Height)">
            <div className="size-inputs">
              <Form.Item
                name={["size", "length"]}
                noStyle
                rules={[{ required: true, message: "Please enter length" }]}
              >
                <InputNumber placeholder="Length" min={0} />
              </Form.Item>
              <Form.Item
                name={["size", "width"]}
                noStyle
                rules={[{ required: true, message: "Please enter width" }]}
              >
                <InputNumber placeholder="Width" min={0} />
              </Form.Item>
              <Form.Item
                name={["size", "height"]}
                noStyle
                rules={[{ required: true, message: "Please enter height" }]}
              >
                <InputNumber placeholder="Height" min={0} />
              </Form.Item>
              <Form.Item name={["size", "unit"]} noStyle>
                <Select>
                  <Option value="in">in</Option>
                  <Option value="cm">cm</Option>
                  <Option value="mm">mm</Option>
                </Select>
              </Form.Item>
            </div>
          </Form.Item>
          <Row gutter={16}>
            <Col span={12}>
              <Form.Item
                name="file"
                label="File"
                valuePropName="fileList"
                getValueFromEvent={(e) => {
                  if (!e || !e.fileList) return [];
                  return Array.isArray(e.fileList) ? e.fileList : [];
                }}
              >
                <CloudinaryUploader
                  uploadPreset={uploadPreset}
                  cloudName={cloudName}
                  listType="picture-card"
                  fileList={editForm.getFieldValue("file") || []}
                  onUploadSuccess={(data) =>
                    handleUploadSuccess(data, "file", editForm)
                  }
                />
              </Form.Item>
            </Col>
            <Col span={12}>
              <Form.Item
                name="invoice"
                label="Invoice Image"
                valuePropName="fileList"
                getValueFromEvent={(e) => {
                  if (!e || !e.fileList) return [];
                  return Array.isArray(e.fileList) ? e.fileList : [];
                }}
              >
                <CloudinaryUploader
                  uploadPreset={uploadPreset}
                  cloudName={cloudName}
                  listType="picture-card"
                  fileList={editForm.getFieldValue("invoice") || []}
                  onUploadSuccess={(data) =>
                    handleUploadSuccess(data, "invoice", editForm)
                  }
                />
              </Form.Item>
            </Col>
          </Row>
          <Row gutter={16}>
            <Col span={12}>
              <Form.Item
                name="status"
                label="Status"
                rules={[{ required: true, message: "Please select status" }]}
              >
                <Select>
                  <Option value="Pending">Pending</Option>
                  <Option value="Shipped">Shipped</Option>
                  <Option value="Delivered">Delivered</Option>
                </Select>
              </Form.Item>
            </Col>
            <Col span={12}>
              <Form.Item
                name="approvedStatus"
                label="Approved Status"
                rules={[
                  { required: true, message: "Please select approved status" },
                ]}
              >
                <Select>
                  <Option value="Pending">Pending</Option>
                  <Option value="Approved">Approved</Option>
                  <Option value="Rejected">Rejected</Option>
                </Select>
              </Form.Item>
            </Col>
          </Row>
          <Row gutter={16}>
            <Col span={12}>
              <Form.Item name="shippedvia" label="Shipped Via">
                <Input />
              </Form.Item>
            </Col>
            <Col span={12}>
              <Form.Item name="trackingid" label="Tracking ID">
                <Input />
              </Form.Item>
            </Col>
          </Row>
          <Card title="Shipping Address" className="shipping-address-card">
            <Row gutter={16}>
              <Col span={12}>
                <Form.Item
                  name={["shippingAddress", "name"]}
                  label="Name"
                  rules={[{ required: true, message: "Please enter name" }]}
                >
                  <Input />
                </Form.Item>
              </Col>
              <Col span={12}>
                <Form.Item
                  name={["shippingAddress", "companyName"]}
                  label="Company Name"
                >
                  <Input />
                </Form.Item>
              </Col>
            </Row>
            <Row gutter={16}>
              <Col span={12}>
                <Form.Item
                  name={["shippingAddress", "phoneNumber"]}
                  label="Phone Number"
                  rules={[
                    { required: true, message: "Please enter phone number" },
                  ]}
                >
                  <Input />
                </Form.Item>
              </Col>
              <Col span={12}>
                <Form.Item
                  name={["shippingAddress", "streetAddress"]}
                  label="Street Address"
                  rules={[
                    { required: true, message: "Please enter street address" },
                  ]}
                >
                  <Input />
                </Form.Item>
              </Col>
            </Row>
            <Row gutter={16}>
              <Col span={12}>
                <Form.Item
                  name={["shippingAddress", "city"]}
                  label="City"
                  rules={[{ required: true, message: "Please enter city" }]}
                >
                  <Input />
                </Form.Item>
              </Col>
              <Col span={12}>
                <Form.Item
                  name={["shippingAddress", "province"]}
                  label="Province"
                  rules={[{ required: true, message: "Please enter province" }]}
                >
                  <Input />
                </Form.Item>
              </Col>
            </Row>
            <Row gutter={16}>
              <Col span={12}>
                <Form.Item
                  name={["shippingAddress", "zipCode"]}
                  label="Zip Code"
                  rules={[{ required: true, message: "Please enter zip code" }]}
                >
                  <Input />
                </Form.Item>
              </Col>
              <Col span={12}>
                <Form.Item
                  name={["shippingAddress", "country"]}
                  label="Country"
                  rules={[{ required: true, message: "Please enter country" }]}
                >
                  <Input />
                </Form.Item>
              </Col>
            </Row>
          </Card>
          <div className="form-actions">
            <Button
              onClick={() => {
                setIsEditModalOpen(false);
                editForm.resetFields();
              }}
              disabled={loading}
            >
              Cancel
            </Button>
            <Button type="primary" htmlType="submit" loading={loading}>
              Update Order
            </Button>
          </div>
        </Form>
      </Modal>
    </div>
  );
}

export default Orders;
