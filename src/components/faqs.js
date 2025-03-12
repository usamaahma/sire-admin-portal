import React, { useState } from "react";
import {
  Table,
  Button,
  Modal,
  Form,
  Input,
  Select,
  message,
  Space,
} from "antd";
import { PlusOutlined, DeleteOutlined } from "@ant-design/icons";

const Faqs = () => {
  // State to store FAQs for each product
  const [faqs, setFaqs] = useState({
    "Product A": [
      {
        key: "1",
        question: "What is the warranty on Product A?",
        answer: "The warranty is 1 year.",
      },
    ],
    "Product B": [
      {
        key: "2",
        question: "How do I use Product B?",
        answer: "Please refer to the user manual.",
      },
    ],
  });

  const [isModalVisible, setIsModalVisible] = useState(false);
  const [currentProduct, setCurrentProduct] = useState(null);
  const [form] = Form.useForm();
  const [newFaqs, setNewFaqs] = useState([{ question: "", answer: "" }]);

  // Handle open modal for adding FAQs
  const showModal = () => {
    setIsModalVisible(true);
  };

  // Handle modal cancel (close modal)
  const handleCancel = () => {
    setIsModalVisible(false);
    setCurrentProduct(null);
    setNewFaqs([{ question: "", answer: "" }]); // Reset FAQ form fields
  };

  // Handle submit for adding multiple FAQs
  const handleSubmit = (values) => {
    // Check if the questions and answers are not empty
    if (newFaqs.some((faq) => faq.question === "" || faq.answer === "")) {
      message.error("Please fill in all fields before submitting.");
      return;
    }

    // Add new FAQs to the current product
    setFaqs({
      ...faqs,
      [currentProduct]: [
        ...faqs[currentProduct],
        ...newFaqs.map((faq, index) => ({
          key: `${faqs[currentProduct].length + index + 1}`,
          question: faq.question,
          answer: faq.answer,
        })),
      ],
    });

    // Show success message and close modal
    message.success("FAQs added successfully!");
    setIsModalVisible(false);
    setCurrentProduct(null);
    setNewFaqs([{ question: "", answer: "" }]); // Reset FAQ form fields
  };

  // Handle adding another FAQ entry in the modal
  const handleAddFaq = () => {
    setNewFaqs([...newFaqs, { question: "", answer: "" }]);
  };

  // Handle delete FAQ action
  const handleDeleteFaq = (product, key) => {
    // Filter out the deleted FAQ from the selected product's FAQs
    setFaqs({
      ...faqs,
      [product]: faqs[product].filter((faq) => faq.key !== key),
    });
    message.success("FAQ deleted successfully!");
  };

  // Table columns
  const columns = [
    {
      title: "Product Name",
      dataIndex: "product",
      key: "product",
      responsive: ["sm"], // Show only on small screens and larger
    },
    {
      title: "Question",
      dataIndex: "question",
      key: "question",
      responsive: ["sm"], // Show only on small screens and larger
    },
    {
      title: "Answer",
      dataIndex: "answer",
      key: "answer",
      responsive: ["sm"], // Show only on small screens and larger
    },
    {
      title: "Actions",
      key: "actions",
      render: (text, record) => (
        <Space size="middle">
          <Button
            danger
            icon={<DeleteOutlined />}
            onClick={() => handleDeleteFaq(record.product, record.key)} // Delete FAQ for specific product
          >
            Delete
          </Button>
        </Space>
      ),
    },
  ];

  // Generate the data source for the table
  const generateTableData = () => {
    return Object.keys(faqs).flatMap((product) =>
      faqs[product].map((faq) => ({
        key: faq.key,
        product: product,
        question: faq.question,
        answer: faq.answer,
      }))
    );
  };

  return (
    <div>
      <h2>FAQs</h2>

      {/* Button to trigger modal */}
      <Button
        type="primary"
        icon={<PlusOutlined />}
        onClick={showModal}
        style={{ marginBottom: "20px" }}
      >
        Add FAQ
      </Button>

      {/* Table for displaying FAQs with horizontal scrolling and responsiveness */}
      <Table
        columns={columns}
        dataSource={generateTableData()}
        rowKey="key"
        pagination={{ pageSize: 5 }}
        scroll={{ x: "max-content" }} // Horizontal scroll for larger content
        bordered // Add borders around the table
        responsive // Automatically adjust table layout based on screen size
        style={{ width: "80%", margin: "0 auto" }} // Adjust the table width and center it
      />

      {/* Modal for adding FAQs */}
      <Modal
        title="Add FAQ"
        visible={isModalVisible}
        onCancel={handleCancel}
        footer={null}
      >
        <Form form={form} onFinish={handleSubmit}>
          {/* Dropdown to select product */}
          <Form.Item
            label="Select Product"
            name="product"
            rules={[{ required: true, message: "Please select a product!" }]}
          >
            <Select
              onChange={(value) => setCurrentProduct(value)}
              placeholder="Select a product"
            >
              {Object.keys(faqs).map((product) => (
                <Select.Option key={product} value={product}>
                  {product}
                </Select.Option>
              ))}
            </Select>
          </Form.Item>

          {/* Loop through newFaqs and create form items for each */}
          {newFaqs.map((_, index) => (
            <div key={index} style={{ marginBottom: "15px" }}>
              <Form.Item
                label="Question"
                name={`question_${index}`}
                rules={[
                  { required: true, message: "Please enter a question!" },
                ]}
              >
                <Input
                  value={newFaqs[index].question}
                  onChange={(e) => {
                    const newFaqsArray = [...newFaqs];
                    newFaqsArray[index].question = e.target.value;
                    setNewFaqs(newFaqsArray);
                  }}
                  placeholder="Enter your question"
                />
              </Form.Item>

              <Form.Item
                label="Answer"
                name={`answer_${index}`}
                rules={[{ required: true, message: "Please enter an answer!" }]}
              >
                <Input.TextArea
                  value={newFaqs[index].answer}
                  onChange={(e) => {
                    const newFaqsArray = [...newFaqs];
                    newFaqsArray[index].answer = e.target.value;
                    setNewFaqs(newFaqsArray);
                  }}
                  placeholder="Enter the answer"
                />
              </Form.Item>
            </div>
          ))}

          <Form.Item>
            <Button
              type="dashed"
              onClick={handleAddFaq}
              style={{ width: "100%" }}
            >
              Add Another FAQ
            </Button>
          </Form.Item>

          <Form.Item>
            <Button type="primary" htmlType="submit" style={{ width: "100%" }}>
              Submit FAQs
            </Button>
          </Form.Item>
        </Form>
      </Modal>
    </div>
  );
};

export default Faqs;
