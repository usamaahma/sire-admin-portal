import React, { useEffect, useState } from "react";
import {
  Table,
  Button,
  Modal,
  Form,
  Input,
  message
} from "antd";
import {
  EditOutlined,
  DeleteOutlined,
  EyeOutlined,
  PlusOutlined
} from "@ant-design/icons";
import ReactQuill from "react-quill";
import "react-quill/dist/quill.snow.css";
import { privacy } from "../utils/axios"; // 👈 import your Axios instance

const PrivacyPolicy = () => {
  const [data, setData] = useState([]);
  const [isModalVisible, setIsModalVisible] = useState(false);
  const [isViewModalVisible, setIsViewModalVisible] = useState(false);
  const [currentMode, setCurrentMode] = useState("add");
  const [currentRecord, setCurrentRecord] = useState(null);
  const [items, setItems] = useState([{ title: "", description: "" }]);
  const [form] = Form.useForm();

  const modules = {
    toolbar: [
      [{ header: [1, 2, 3, false] }],
      ["bold", "italic", "underline", "strike"],
      [{ color: [] }, { background: [] }],
      [{ script: "sub" }, { script: "super" }],
      [{ align: [] }],
      ["blockquote", "code-block"],
      [{ list: "ordered" }, { list: "bullet" }],
      ["link", "image", "video"],
      ["clean"],
    ],
  };

  const formats = [
    "header", "bold", "italic", "underline", "strike",
    "color", "background", "script", "align",
    "blockquote", "code-block", "list", "bullet",
    "link", "image", "video"
  ];

  useEffect(() => {
    fetchPrivacyData();
  }, []);

  const fetchPrivacyData = async () => {
    try {
      const response = await privacy.get("/");
      const responseData = response.data;

      if (responseData && responseData.length > 0) {
        const formattedData = responseData.map((item) => ({
          key: item._id,
          items: item.title.map((t, i) => ({
            title: t,
            description: item.description[i] || "",
          })),
        }));
        setData(formattedData);
      } else {
        setData([]);
      }
    } catch (error) {
      message.error("Failed to fetch privacy policy data");
      console.error("GET error:", error);
    }
  };

  const handleAddClick = () => {
    setCurrentMode("add");
    setItems([{ title: "", description: "" }]);
    form.resetFields();
    setIsModalVisible(true);
  };

  const handleEditClick = (record) => {
    setCurrentMode("edit");
    setCurrentRecord(record);
    setItems(record.items);
    form.setFieldsValue({ items: record.items });
    setIsModalVisible(true);
  };

  const handleViewClick = (record) => {
    setItems(record.items);
    setIsViewModalVisible(true);
  };

  const handleDelete = (key) => {
    Modal.confirm({
      title: "Confirm Delete",
      content: "Are you sure you want to delete this policy?",
      okText: "Delete",
      okType: "danger",
      cancelText: "Cancel",
      onOk: async () => {
        try {
          await privacy.delete(`/${key}`);
          message.success("Deleted successfully");
          fetchPrivacyData();
        } catch (error) {
          message.error("Delete failed");
          console.error(error);
        }
      },
    });
  };

  const handleSave = async () => {
    try {
      const values = await form.validateFields();
      const titles = values.items.map((item) => item.title);
      const descriptions = values.items.map((item) => item.description);

      const payload = {
        title: titles,
        description: descriptions,
      };

      if (currentMode === "edit" && currentRecord) {
        await privacy.patch(`/${currentRecord.key}`, payload);
        message.success("Updated successfully");
      } else {
        await privacy.post("/", payload);
        message.success("Added successfully");
      }

      fetchPrivacyData();
      setIsModalVisible(false);
    } catch (err) {
      console.error("Validation failed:", err);
      message.error("Something went wrong");
    }
  };

  const addItem = async () => {
    try {
      const currentValues = await form.validateFields();
      const newItems = [...currentValues.items, { title: "", description: "" }];
      setItems(newItems);
      form.setFieldsValue({ items: newItems });
    } catch {
      const newItems = [...items, { title: "", description: "" }];
      setItems(newItems);
      form.setFieldsValue({ items: newItems });
    }
  };

  const removeItem = (index) => {
    const newItems = items.filter((_, i) => i !== index);
    setItems(newItems);
    form.setFieldsValue({ items: newItems });
  };

  const columns = [
    {
      title: "Titles",
      dataIndex: "items",
      key: "titles",
      render: (items) => (
        <div>
          {items?.slice(0, 2).map((item, i) => (
            <div key={i}>{item.title}</div>
          ))}
          {items?.length > 2 && <span>+{items.length - 2} more</span>}
        </div>
      ),
    },
    {
      title: "Description Preview",
      dataIndex: "items",
      key: "description",
      render: (items) => (
        <div
          dangerouslySetInnerHTML={{
            __html: (items?.[0]?.description || "").slice(0, 100) + "...",
          }}
        />
      ),
    },
    {
      title: "Actions",
      key: "actions",
      render: (_, record) => (
        <div style={{ display: "flex", gap: "8px" }}>
          <Button icon={<EyeOutlined />} onClick={() => handleViewClick(record)} />
          <Button icon={<EditOutlined />} onClick={() => handleEditClick(record)} />
          <Button icon={<DeleteOutlined />} onClick={() => handleDelete(record.key)} danger />
        </div>
      ),
    },
  ];

  return (
    <div>
      {data.length === 0 && (
        <Button
          type="primary"
          onClick={handleAddClick}
          icon={<PlusOutlined />}
          style={{ marginBottom: 16 }}
        >
          Add Privacy Policy
        </Button>
      )}

      <Table
        columns={columns}
        dataSource={data}
        pagination={false}
        rowKey="key"
        bordered
      />

      {/* Modal for Add/Edit */}
      <Modal
        title={currentMode === "edit" ? "Edit Privacy Policy" : "Add Privacy Policy"}
        open={isModalVisible}
        onOk={handleSave}
        onCancel={() => setIsModalVisible(false)}
        okText={currentMode === "edit" ? "Update" : "Save"}
        cancelText="Cancel"
        width="80%"
        destroyOnClose
      >
        <Form form={form} layout="vertical">
          {items.map((item, index) => (
            <div key={index} style={{ marginBottom: 32, borderBottom: '1px solid #ddd', paddingBottom: 16 }}>
              <Form.Item
                label={`Title ${index + 1}`}
                name={['items', index, 'title']}
                rules={[{ required: true, message: "Title is required" }]}
              >
                <Input placeholder="Enter title" />
              </Form.Item>
              <Form.Item
                label={`Description ${index + 1}`}
                name={['items', index, 'description']}
                rules={[{ required: true, message: "Description is required" }]}
              >
                <ReactQuill
                  theme="snow"
                  modules={modules}
                  formats={formats}
                  style={{ height: 200 }}
                />
              </Form.Item>
              {items.length > 1 && (
                <Button danger onClick={() => removeItem(index)}>
                  Remove
                </Button>
              )}
            </div>
          ))}
          <Button type="dashed" onClick={addItem} icon={<PlusOutlined />}>
            Add Another Section
          </Button>
        </Form>
      </Modal>

      {/* View Modal */}
      <Modal
        title="View Privacy Policy"
        open={isViewModalVisible}
        onCancel={() => setIsViewModalVisible(false)}
        footer={<Button onClick={() => setIsViewModalVisible(false)}>Close</Button>}
        width="80%"
      >
        {items.map((item, index) => (
          <div key={index} style={{ marginBottom: 32 }}>
            <h3>{item.title}</h3>
            <div
              className="ql-editor"
              dangerouslySetInnerHTML={{ __html: item.description }}
              style={{ padding: 0 }}
            />
          </div>
        ))}
      </Modal>
    </div>
  );
};

export default PrivacyPolicy;
