import React, { useState, useEffect } from "react";
import { Table, Button, Modal, Form, Input, message } from "antd";
import { EditOutlined, DeleteOutlined, EyeOutlined, PlusOutlined } from "@ant-design/icons";
import ReactQuill from "react-quill";
import "react-quill/dist/quill.snow.css";
import { aboutus } from '../utils/axios';  // tumhara axios instance

const About = () => {
  const [data, setData] = useState([]);
  const [isModalVisible, setIsModalVisible] = useState(false);
  const [isViewModalVisible, setIsViewModalVisible] = useState(false);
  const [currentMode, setCurrentMode] = useState("add");
  const [currentRecord, setCurrentRecord] = useState(null);
  const [items, setItems] = useState([{ title: "", description: "" }]);
  const [loading, setLoading] = useState(false);
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
    fetchAboutData();
  }, []);

  const fetchAboutData = async () => {
    setLoading(true);
    try {
      const response = await aboutus.get("/");
      if (response.data && response.data.length > 0) {
        setData(response.data.map(item => ({
          ...item,
          key: item._id || Math.random()
        })));
      } else {
        setData([]);
      }
    } catch (error) {
      message.error("Failed to fetch data");
      console.error("Fetch error:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleAddClick = () => {
    setCurrentMode("add");
    setItems([{ title: "", description: "" }]);
    form.resetFields();
    setIsModalVisible(true);
  };

  const handleViewClick = (record) => {
    setCurrentRecord(record);
    const recordItems = (record.title || []).map((t, idx) => ({
      title: t,
      description: record.description?.[idx] || ""
    }));
    setItems(recordItems);
    setIsViewModalVisible(true);
  };

  const handleEditClick = (record) => {
    setCurrentMode("edit");
    setCurrentRecord(record);
    const recordItems = (record.title || []).map((t, idx) => ({
      title: t,
      description: record.description?.[idx] || ""
    }));
    setItems(recordItems);
    form.setFieldsValue({ items: recordItems });
    setIsModalVisible(true);
  };

  const handleDelete = (key) => {
    Modal.confirm({
      title: "Confirm Delete",
      content: "Are you sure you want to delete this entry?",
      okText: "Delete",
      okType: "danger",
      cancelText: "Cancel",
      onOk: async () => {
        try {
          await aboutus.delete(`/${key}`);
          message.success("Deleted successfully");
          fetchAboutData();
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
      const itemsToSave = values.items;

      const titles = itemsToSave.map(item => item.title);
      const descriptions = itemsToSave.map(item => item.description);

      const payload = {
        title: titles,
        description: descriptions
      };

      if (currentMode === "edit" && currentRecord) {
        await aboutus.patch(`/${currentRecord.key}`, payload);
        message.success("Updated successfully");
      } else {
        await aboutus.post("/", payload);
        message.success("Added successfully");
      }

      fetchAboutData();
      setIsModalVisible(false);
    } catch (error) {
      console.error("Save failed:", error);
      message.error("Something went wrong");
    }
  };

  const addItem = async () => {
    try {
      const currentValues = await form.validateFields();
      const currentItems = currentValues.items || [];
      const newItems = [...currentItems, { title: "", description: "" }];
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
      dataIndex: "title",
      key: "titles",
      render: (titles) => (
        <div>
          {titles?.slice(0, 2).map((title, i) => (
            <div key={i}>{title}</div>
          ))}
          {titles?.length > 2 && <span>+{titles.length - 2} more</span>}
        </div>
      ),
    },
    {
      title: "Description Preview",
      dataIndex: "description",
      key: "description",
      render: (desc) => (
        <div
          dangerouslySetInnerHTML={{
            __html: (desc?.[0] || "").slice(0, 100) + "...",
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
      <Button
        type="primary"
        onClick={handleAddClick}
        icon={<PlusOutlined />}
        style={{ marginBottom: 16 }}
      >
        Add About Us
      </Button>

      <Table
        columns={columns}
        dataSource={data}
        loading={loading}
        pagination={false}
        rowKey="key"
        bordered
      />

      {/* Modal for Add/Edit */}
      <Modal
        title={currentMode === "edit" ? "Edit About Us" : "Add About Us"}
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
        title="View About Us"
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

export default About;
