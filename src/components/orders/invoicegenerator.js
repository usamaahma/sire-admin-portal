import React, { useRef, useState } from "react";
import { Form, Input, Button, Card, InputNumber } from "antd";
import jsPDF from "jspdf";
import html2canvas from "html2canvas";

const InvoiceGenerator = () => {
  const invoiceRef = useRef();
  const [formData, setFormData] = useState(null);

  const onFinish = (values) => {
    setFormData({
      ...values,
      date: new Date().toLocaleDateString(),
      invoiceNumber: `INV-${Math.floor(1000 + Math.random() * 9000)}`
    });
  };

  const generatePDF = async () => {
    const element = invoiceRef.current;
    const canvas = await html2canvas(element);
    const imgData = canvas.toDataURL("image/png");

    const pdf = new jsPDF("p", "mm", "a4");
    const imgProps = pdf.getImageProperties(imgData);
    const pdfWidth = pdf.internal.pageSize.getWidth();
    const pdfHeight = (imgProps.height * pdfWidth) / imgProps.width;

    pdf.addImage(imgData, "PNG", 0, 0, pdfWidth, pdfHeight);
    pdf.save(`${formData?.invoiceNumber || "invoice"}.pdf`);
  };

  return (
    <div style={{ padding: 20 }}>
      <Card title="Admin Invoice Form" style={{ marginBottom: 20 }}>
        <Form layout="vertical" onFinish={onFinish}>
          <Form.Item name="customerName" label="Customer Name" rules={[{ required: true }]}>
            <Input />
          </Form.Item>
          <Form.Item name="product" label="Product" rules={[{ required: true }]}>
            <Input />
          </Form.Item>
          <Form.Item name="quantity" label="Quantity" rules={[{ required: true }]}>
            <InputNumber min={1} />
          </Form.Item>
          <Form.Item name="price" label="Price (PKR)" rules={[{ required: true }]}>
            <InputNumber min={0} />
          </Form.Item>
          <Form.Item>
            <Button type="primary" htmlType="submit">Generate Invoice Preview</Button>
          </Form.Item>
        </Form>
      </Card>

      {formData && (
        <>
          <Card title="Invoice Preview" ref={invoiceRef} style={{ width: "100%", marginBottom: 20 }}>
            <h2 style={{ textAlign: "center" }}>INVOICE</h2>
            <p><strong>Invoice No:</strong> {formData.invoiceNumber}</p>
            <p><strong>Date:</strong> {formData.date}</p>
            <p><strong>Customer:</strong> {formData.customerName}</p>
            <hr />
            <p><strong>Product:</strong> {formData.product}</p>
            <p><strong>Quantity:</strong> {formData.quantity}</p>
            <p><strong>Price (PKR):</strong> {formData.price}</p>
            <p><strong>Total:</strong> {formData.quantity * formData.price} PKR</p>
          </Card>

          <Button type="primary" onClick={generatePDF}>
            Download PDF
          </Button>
        </>
      )}
    </div>
  );
};

export default InvoiceGenerator;
