import { useEffect, useState } from "react";
import { faq } from "../utils/axios";
import { Table, Button, Modal, Form, Input, message, Space } from "antd";
import {
  PlusOutlined,
  DeleteOutlined,
  EditOutlined,
  SaveOutlined,
} from "@ant-design/icons";

const Faqs = () => {
  const [faqs, setFaqs] = useState([]);
  const [isModalVisible, setIsModalVisible] = useState(false);
  const [isBulkEditModalVisible, setIsBulkEditModalVisible] = useState(false);
  const [form] = Form.useForm();
  const [newFaqs, setNewFaqs] = useState([{ question: "", answer: "" }]);
  const [editingIndex, setEditingIndex] = useState(null);
  const [editingFaq, setEditingFaq] = useState({ question: "", answer: "" });
  const [bulkEditFaqs, setBulkEditFaqs] = useState([]);

  // Fetch all FAQs on component mount
  useEffect(() => {
    fetchFaqs();
  }, []);

  const fetchFaqs = async () => {
    try {
      const response = await faq.get("/");
      if (response.data && Array.isArray(response.data.faqs)) {
        setFaqs(response.data.faqs);
      }
    } catch (err) {
      console.error("Error fetching FAQs:", err);
      message.error("Failed to load FAQs.");
    }
  };

  const showModal = () => setIsModalVisible(true);

  const showBulkEditModal = () => {
    setBulkEditFaqs([...faqs]);
    setIsBulkEditModalVisible(true);
  };

  const handleCancel = () => {
    setIsModalVisible(false);
    setNewFaqs([{ question: "", answer: "" }]);
    form.resetFields();
  };

  const handleBulkEditCancel = () => {
    setIsBulkEditModalVisible(false);
  };

  const handleAddFaq = () => {
    setNewFaqs([...newFaqs, { question: "", answer: "" }]);
  };

  const handleSubmit = async () => {
    if (newFaqs.some((f) => !f.question.trim() || !f.answer.trim())) {
      message.error("Please fill in all questions and answers.");
      return;
    }

    try {
      const response = await faq.post("/", { faqs: newFaqs });
      setFaqs(response.data.faqs);
      message.success("FAQs added successfully!");
      handleCancel();
    } catch (err) {
      console.error(err);
      message.error("Failed to add FAQs.");
    }
  };

  const handleBulkEditSubmit = async () => {
    if (bulkEditFaqs.some((f) => !f.question.trim() || !f.answer.trim())) {
      message.error("Please fill in all questions and answers.");
      return;
    }

    try {
      await faq.put("/faq/all", { faqs: bulkEditFaqs });
      setFaqs(bulkEditFaqs);
      message.success("FAQs updated successfully!");
      setIsBulkEditModalVisible(false);
    } catch (err) {
      console.error(err);
      message.error("Failed to update FAQs.");
    }
  };

  const handleDeleteFaq = async (index) => {
    try {
      await faq.delete(`/${index}`);
      const updatedFaqs = faqs.filter((_, i) => i !== index);
      setFaqs(updatedFaqs);
      message.success("FAQ deleted successfully!");
    } catch (err) {
      console.error(err);
      message.error("Failed to delete FAQ.");
    }
  };

  const handleEditClick = (faq, index) => {
    setEditingIndex(index);
    setEditingFaq({ ...faq });
  };

  const handleEditSubmit = async () => {
    if (!editingFaq.question.trim() || !editingFaq.answer.trim()) {
      message.error("Please fill in both question and answer.");
      return;
    }

    try {
      await faq.put(`/${editingIndex}`, editingFaq);
      const updatedFaqs = [...faqs];
      updatedFaqs[editingIndex] = { ...editingFaq };
      setFaqs(updatedFaqs);
      setEditingIndex(null);
      message.success("FAQ updated successfully!");
    } catch (err) {
      console.error(err);
      message.error("Failed to update FAQ.");
    }
  };

  const handleBulkFaqChange = (index, field, value) => {
    const updated = [...bulkEditFaqs];
    updated[index][field] = value;
    setBulkEditFaqs(updated);
  };

  const handleAddFaqInBulkEdit = () => {
    setBulkEditFaqs([...bulkEditFaqs, { question: "", answer: "" }]);
  };

  const handleDeleteFaqInBulkEdit = (index) => {
    const updated = bulkEditFaqs.filter((_, i) => i !== index);
    setBulkEditFaqs(updated);
  };

  const columns = [
    {
      title: "Question",
      dataIndex: "question",
      key: "question",
    },
    {
      title: "Answer",
      dataIndex: "answer",
      key: "answer",
    },
    {
      title: "Actions",
      key: "actions",
      render: (_, record, index) => (
        <Space>
          <Button
            icon={<EditOutlined />}
            onClick={() => handleEditClick(record, index)}
          >
            Edit
          </Button>
          <Button
            danger
            icon={<DeleteOutlined />}
            onClick={() => handleDeleteFaq(index)}
          >
            Delete
          </Button>
        </Space>
      ),
    },
  ];

  return (
    <div style={{ padding: "20px" }}>
      <h2>FAQs Management</h2>

      <Space style={{ marginBottom: 16 }}>
        <Button type="primary" icon={<PlusOutlined />} onClick={showModal}>
          Add FAQ
        </Button>
        <Button
          type="primary"
          icon={<SaveOutlined />}
          onClick={showBulkEditModal}
        >
          Edit All FAQs
        </Button>
      </Space>

      <Table
        columns={columns}
        dataSource={faqs}
        rowKey={(record, index) => index}
        pagination={{ pageSize: 5 }}
        bordered
        locale={{
          emptyText: "No FAQs available. Click 'Add FAQ' to create some.",
        }}
      />

      {/* Add FAQ Modal */}
      <Modal
        title="Add FAQs"
        open={isModalVisible}
        onCancel={handleCancel}
        footer={null}
      >
        <Form form={form} layout="vertical">
          {newFaqs.map((faq, index) => (
            <div key={index} style={{ marginBottom: 16 }}>
              <Form.Item label={`Question ${index + 1}`} required>
                <Input
                  value={faq.question}
                  onChange={(e) => {
                    const updated = [...newFaqs];
                    updated[index].question = e.target.value;
                    setNewFaqs(updated);
                  }}
                />
              </Form.Item>
              <Form.Item label={`Answer ${index + 1}`} required>
                <Input.TextArea
                  value={faq.answer}
                  onChange={(e) => {
                    const updated = [...newFaqs];
                    updated[index].answer = e.target.value;
                    setNewFaqs(updated);
                  }}
                />
              </Form.Item>
            </div>
          ))}
          <Button type="dashed" onClick={handleAddFaq} block>
            Add Another FAQ
          </Button>
          <Button
            type="primary"
            onClick={handleSubmit}
            style={{ marginTop: 16 }}
            block
          >
            Submit FAQs
          </Button>
        </Form>
      </Modal>

      {/* Edit FAQ Modal */}
      <Modal
        title="Edit FAQ"
        open={editingIndex !== null}
        onOk={handleEditSubmit}
        onCancel={() => setEditingIndex(null)}
      >
        <Form layout="vertical">
          <Form.Item label="Question" required>
            <Input
              value={editingFaq.question}
              onChange={(e) =>
                setEditingFaq({ ...editingFaq, question: e.target.value })
              }
            />
          </Form.Item>
          <Form.Item label="Answer" required>
            <Input.TextArea
              rows={4}
              value={editingFaq.answer}
              onChange={(e) =>
                setEditingFaq({ ...editingFaq, answer: e.target.value })
              }
            />
          </Form.Item>
        </Form>
      </Modal>

      {/* Bulk Edit FAQ Modal */}
      <Modal
        title="Edit All FAQs"
        open={isBulkEditModalVisible}
        onCancel={handleBulkEditCancel}
        footer={null}
        width={800}
      >
        <Form layout="vertical">
          {bulkEditFaqs.map((faq, index) => (
            <div
              key={index}
              style={{
                marginBottom: 16,
                border: "1px solid #f0f0f0",
                padding: 16,
                borderRadius: 4,
              }}
            >
              <Form.Item label={`Question ${index + 1}`} required>
                <Input
                  value={faq.question}
                  onChange={(e) =>
                    handleBulkFaqChange(index, "question", e.target.value)
                  }
                />
              </Form.Item>
              <Form.Item label={`Answer ${index + 1}`} required>
                <Input.TextArea
                  value={faq.answer}
                  onChange={(e) =>
                    handleBulkFaqChange(index, "answer", e.target.value)
                  }
                />
              </Form.Item>
              <Button
                danger
                icon={<DeleteOutlined />}
                onClick={() => handleDeleteFaqInBulkEdit(index)}
                style={{ float: "right" }}
              >
                Delete
              </Button>
            </div>
          ))}
          <Button type="dashed" onClick={handleAddFaqInBulkEdit} block>
            Add Another FAQ
          </Button>
          <Button
            type="primary"
            onClick={handleBulkEditSubmit}
            style={{ marginTop: 16 }}
            block
          >
            Save All Changes
          </Button>
        </Form>
      </Modal>
    </div>
  );
};

export default Faqs;
