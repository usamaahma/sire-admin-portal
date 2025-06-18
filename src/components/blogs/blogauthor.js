import React, { useState, useEffect } from 'react';
import { Table, Button, Modal, Input, message, Popconfirm, Form } from 'antd';
import { PlusOutlined } from '@ant-design/icons';
import ReactQuill from 'react-quill';
import 'react-quill/dist/quill.snow.css';
import { blogauthors } from '../../utils/axios';
import CloudinaryUploader from '../cloudinary/CloudinaryUploader';

const cloudName = "dxhpud7sx";
const uploadPreset = "sireprinting";

const Blogauthor = () => {
  const [blogAuthors, setBlogAuthors] = useState([]);
  const [modalVisible, setModalVisible] = useState(false);
  const [editAuthor, setEditAuthor] = useState(null);
  const [loading, setLoading] = useState(false);
  const [modalLoading, setModalLoading] = useState(false);
  const [form] = Form.useForm();

  useEffect(() => {
    fetchAuthors();
  }, []);

  const fetchAuthors = async () => {
    try {
      setLoading(true);
      const res = await blogauthors.get('/');
      if (res.data && Array.isArray(res.data.data)) {
        setBlogAuthors(res.data.data);
      } else if (res.data && Array.isArray(res.data.authors)) {
        setBlogAuthors(res.data.authors);
      } else if (Array.isArray(res.data)) {
        setBlogAuthors(res.data);
      } else {
        setBlogAuthors([]);
        message.error('Unexpected data format from API');
      }
    } catch (err) {
      message.error('Failed to fetch authors');
    } finally {
      setLoading(false);
    }
  };

  const openModal = (author = null) => {
    setEditAuthor(author);
    if (author) {
      form.setFieldsValue({
        name: author.name,
        image: author.image
          ? [{
              uid: '-1',
              name: 'author-image.png',
              status: 'done',
              url: author.image,
              thumbUrl: author.image,
            }]
          : [],
        description: author.description || '',
        seoTitle: author.seoTitle || '',
        seoDescription: author.seoDescription || '',
      });
    } else {
      form.resetFields();
    }
    setModalVisible(true);
  };

  const closeModal = () => {
    setModalVisible(false);
    setEditAuthor(null);
    form.resetFields();
  };

  const handleUploadSuccess = (data, formFieldName) => {
    if (Array.isArray(data)) {
      // Handle image removal or existing fileList
      form.setFieldsValue({ [formFieldName]: data });
    } else if (data?.url) {
      // Handle new image upload
      const newFileList = [{
        uid: data.uid,
        name: data.name,
        status: data.status,
        url: data.url,
        thumbUrl: data.thumbUrl,
      }];
      form.setFieldsValue({ [formFieldName]: newFileList });
    } else {
      message.error('Image upload failed!');
    }
  };

  const handleSubmit = async (values) => {
    try {
      setModalLoading(true);
      const payload = {
        name: values.name,
        image: values.image?.[0]?.url || '',
        description: values.description,
        seoTitle: values.seoTitle,
        seoDescription: values.seoDescription,
      };

      if (editAuthor) {
        await blogauthors.put(`/${editAuthor._id}`, payload);
        message.success('Author updated successfully!');
      } else {
        await blogauthors.post('/', payload);
        message.success('Author created successfully!');
      }

      closeModal();
      fetchAuthors();
    } catch (err) {
      message.error('Failed to save author');
    } finally {
      setModalLoading(false);
    }
  };

  const handleDelete = async (id) => {
    try {
      setLoading(true);
      await blogauthors.delete(`/${id}`);
      message.success('Author deleted!');
      fetchAuthors();
    } catch {
      message.error('Failed to delete author');
    } finally {
      setLoading(false);
    }
  };

  const columns = [
    {
      title: 'Name',
      dataIndex: 'name',
      key: 'name',
    },
    {
      title: 'Image',
      dataIndex: 'image',
      key: 'image',
      render: (url) =>
        url ? (
          <img
            src={url}
            alt="author"
            style={{ width: 80, height: 80, objectFit: 'cover', borderRadius: 6 }}
          />
        ) : (
          'No Image'
        ),
    },
    {
      title: 'Description',
      dataIndex: 'description',
      key: 'description',
      render: (text) => (
        <div
          style={{
            maxWidth: 300,
            whiteSpace: 'nowrap',
            overflow: 'hidden',
            textOverflow: 'ellipsis',
          }}
          dangerouslySetInnerHTML={{ __html: text }}
        />
      ),
    },
    {
      title: 'Actions',
      key: 'actions',
      render: (_, record) => (
        <>
          <Button type="link" onClick={() => openModal(record)}>
            Edit
          </Button>
          <Popconfirm
            title="Are you sure to delete this author?"
            onConfirm={() => handleDelete(record._id)}
            okText="Yes"
            cancelText="No"
          >
            <Button type="link" danger>
              Delete
            </Button>
          </Popconfirm>
        </>
      ),
    },
  ];

  return (
    <div style={{ padding: 20 }}>
      <Button type="primary" onClick={() => openModal()} style={{ marginBottom: 20 }}>
        Add Blog Author
      </Button>

      <Table
        dataSource={blogAuthors}
        columns={columns}
        rowKey={(record) => record._id}
        loading={loading}
        pagination={{ pageSize: 5 }}
      />

      <Modal
        title={editAuthor ? 'Edit Blog Author' : 'Add Blog Author'}
        open={modalVisible}
        onCancel={closeModal}
        footer={null}
        confirmLoading={modalLoading}
        destroyOnClose
        width={700}
      >
        <Form form={form} onFinish={handleSubmit} layout="vertical">
          <Form.Item
            label="Author Name"
            name="name"
            rules={[{ required: true, message: 'Please enter author name' }]}
          >
            <Input placeholder="Enter author name" maxLength={100} />
          </Form.Item>

          <Form.Item
            label="Author Image"
            name="image"
            valuePropName="fileList"
            getValueFromEvent={(e) => (Array.isArray(e) ? e : e?.fileList || [])}
            rules={[{ required: true, message: 'Please upload an image' }]}
          >
            <CloudinaryUploader
              cloudName={cloudName}
              uploadPreset={uploadPreset}
              listType="picture-card"
              fileList={form.getFieldValue('image') || []}
              onUploadSuccess={(data) => handleUploadSuccess(data, 'image')}
              disabled={modalLoading}
            >
              <div>
                <PlusOutlined />
                <div style={{ marginTop: 8 }}>
                  {form.getFieldValue('image')?.length ? 'Change Image' : 'Upload Image'}
                </div>
              </div>
            </CloudinaryUploader>
          </Form.Item>

          <Form.Item
            label="Description"
            name="description"
          >
            <ReactQuill
              theme="snow"
              value={form.getFieldValue('description') || ''}
              onChange={(value) => form.setFieldsValue({ description: value })}
              placeholder="Enter author description"
              readOnly={modalLoading}
              style={{ height: 150, marginBottom: 50 }}
            />
          </Form.Item>

          <Form.Item
            label="SEO Title"
            name="seoTitle"
          >
            <Input placeholder="SEO Title" maxLength={60} />
          </Form.Item>

          <Form.Item
            label="SEO Description"
            name="seoDescription"
          >
            <Input.TextArea
              placeholder="SEO Description"
              rows={3}
              maxLength={160}
            />
          </Form.Item>

          <Form.Item>
            <Button type="primary" htmlType="submit" block disabled={modalLoading}>
              {editAuthor ? 'Update' : 'Create'} Author
            </Button>
          </Form.Item>
        </Form>
      </Modal>
    </div>
  );
};

export default Blogauthor;