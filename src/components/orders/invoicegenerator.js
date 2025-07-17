import { useRef, useState, useEffect } from "react";
import { Form, Input, Button, Card, InputNumber, message, Row, Col } from "antd";
import html2canvas from "html2canvas";
import './invoicegenerator.css';

const InvoiceGenerator = ({ orderData = {}, onComplete }) => {
  const invoiceRef = useRef();
  const [formData, setFormData] = useState(null);
  const [loading, setLoading] = useState(false);
  const [form] = Form.useForm();

  const cloudName = "dxhpud7sx";
  const uploadPreset = "sireprinting";

  useEffect(() => {
    if (orderData) {
      form.setFieldsValue(orderData);
    }
  }, [orderData, form]);

  const onFinish = (values) => {
    const completeData = {
      ...values,
      date: new Date().toLocaleDateString(),
      invoiceNumber: `INV-${Math.floor(1000 + Math.random() * 9000)}`,
      total: values.quantity * values.price,
    };
    setFormData(completeData);

    setTimeout(() => {
      generateAndUploadInvoice();
    }, 100);
  };

  const uploadToCloudinary = async (imageData) => {
    const blob = await fetch(imageData).then(res => res.blob());
    const formData = new FormData();
    formData.append("file", blob);
    formData.append("upload_preset", uploadPreset);
    const response = await fetch(`https://api.cloudinary.com/v1_1/${cloudName}/upload`, {
      method: "POST",
      body: formData,
    });
    const data = await response.json();
    return data.secure_url;
  };

  const generateAndUploadInvoice = async () => {
    try {
      setLoading(true);
      const canvas = await html2canvas(invoiceRef.current);
      const imageData = canvas.toDataURL("image/png");
      const cloudinaryUrl = await uploadToCloudinary(imageData);

      message.success("Invoice uploaded to Cloudinary!");

      if (onComplete) {
        onComplete(cloudinaryUrl);
      }
    } catch (err) {
      message.error("Upload failed.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="invoice-container">
      <Card title="Invoice Details">
        <Form form={form} layout="vertical" onFinish={onFinish}>
          <Row gutter={16}>
            <Col span={12}>
              <Form.Item name="fromName" label="From - Name" rules={[{ required: true }]}><Input /></Form.Item>
              <Form.Item name="fromPhone" label="From - Phone" rules={[{ required: true }]}><Input /></Form.Item>
              <Form.Item name="fromAddress" label="From - Address" rules={[{ required: true }]}><Input /></Form.Item>
            </Col>
            <Col span={12}>
              <Form.Item name="toName" label="To - Name" rules={[{ required: true }]}><Input /></Form.Item>
              <Form.Item name="toPhone" label="To - Phone" rules={[{ required: true }]}><Input /></Form.Item>
              <Form.Item name="toAddress" label="To - Address" rules={[{ required: true }]}><Input /></Form.Item>
            </Col>
          </Row>

          <Form.Item name="product" label="Product" rules={[{ required: true }]}><Input /></Form.Item>
          <Form.Item name="quantity" label="Quantity" rules={[{ required: true }]}><InputNumber min={1} style={{ width: "100%" }} /></Form.Item>
          <Form.Item name="price" label="Price (EUR)" rules={[{ required: true }]}><InputNumber min={0} style={{ width: "100%" }} /></Form.Item>
          <Form.Item name="note" label="Note"><Input /></Form.Item>
          <Form.Item name="bankName" label="Bank Name" rules={[{ required: true }]}><Input /></Form.Item>
          <Form.Item name="bankNumber" label="Bank Number" rules={[{ required: true }]}><Input /></Form.Item>
          <Form.Item name="email" label="Email" rules={[{ required: true }]}><Input /></Form.Item>

          <Form.Item>
            <Button type="primary" htmlType="submit" loading={loading}>
              {loading ? "Uploading..." : "Generate & Upload Invoice"}
            </Button>
          </Form.Item>
        </Form>
      </Card>

      {formData && (
        <div
          ref={invoiceRef}
          className="invoice-preview"
          style={{ padding: 20, marginTop: 20, background: "#fff" }}
        >
          <h2>Invoice</h2>
          <p><strong>Invoice No:</strong> {formData.invoiceNumber}</p>
          <p><strong>Date:</strong> {formData.date}</p>
          <hr />
          <p><strong>From:</strong><br />{formData.fromName}<br />{formData.fromPhone}<br />{formData.fromAddress}</p>
          <p><strong>To:</strong><br />{formData.toName}<br />{formData.toPhone}<br />{formData.toAddress}</p>
          <table border="1" cellPadding="8" width="100%" style={{ marginTop: 10 }}>
            <thead>
              <tr>
                <th>Product</th><th>Qty</th><th>Price</th><th>Total</th>
              </tr>
            </thead>
            <tbody>
              <tr>
                <td>{formData.product}</td>
                <td>{formData.quantity}</td>
                <td>EUR {formData.price}</td>
                <td>EUR {formData.total}</td>
              </tr>
            </tbody>
          </table>
          <p><strong>Note:</strong> {formData.note}</p>
          <p><strong>Bank:</strong> {formData.bankName}</p>
          <p><strong>Account:</strong> {formData.bankNumber}</p>
          <p><strong>Email:</strong> {formData.email}</p>
          <h3 style={{ textAlign: "center", marginTop: 20 }}>Thank You!</h3>
        </div>
      )}
    </div>
  );
};

export default InvoiceGenerator;
