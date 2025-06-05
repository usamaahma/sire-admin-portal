import React, { useState, useEffect } from 'react';
import { Table, Button, Modal, Input, Upload, message, Popconfirm } from 'antd';
import { UploadOutlined } from '@ant-design/icons';
import ReactQuill from 'react-quill';
import 'react-quill/dist/quill.snow.css';
import { blogauthors } from '../../utils/axios'; 

const Blogauthor = () => {
  const [blogAuthors, setBlogAuthors] = useState([]);
  const [modalVisible, setModalVisible] = useState(false);
  const [editAuthor, setEditAuthor] = useState(null);
  const [loading, setLoading] = useState(false);
  const [modalLoading, setModalLoading] = useState(false);

  // Form states
  const [name, setName] = useState('');
  const [imageUrl, setImageUrl] = useState('');
  const [description, setDescription] = useState('');

  // Fetch authors on component mount
  useEffect(() => {
    fetchAuthors();
  }, []);

  const fetchAuthors = async () => {
    try {
      setLoading(true);
      const res = await blogauthors.get('/');
      console.log('API response:', res.data);

      // Updated logic to match API response structure
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

  // Open modal for add/edit
  const openModal = (author = null) => {
    setEditAuthor(author);
    if (author) {
      setName(author.name);
      setImageUrl(author.image);
      setDescription(author.description || '');
    } else {
      setName('');
      setImageUrl('');
      setDescription('');
    }
    setModalVisible(true);
  };

  const closeModal = () => {
    setModalVisible(false);
    setEditAuthor(null);
    setName('');
    setImageUrl('');
    setDescription('');
  };

  // Upload handler: convert to base64, no actual upload, for demo purpose
  const beforeUpload = (file) => {
    const isImage = file.type.startsWith('image/');
    if (!isImage) {
      message.error('You can only upload image files!');
      return false;
    }
    const reader = new FileReader();
    reader.onload = () => {
      setImageUrl(reader.result);
    };
    reader.readAsDataURL(file);
    return false; // Prevent upload to server, we're handling manually
  };

  // Submit add/update author
  const handleSubmit = async () => {
    if (!name.trim()) {
      message.error('Name is required');
      return;
    }
    if (!imageUrl) {
      message.error('Image is required');
      return;
    }
    try {
      setModalLoading(true);
      if (editAuthor) {
        await blogauthors.put(`/${editAuthor._id}`, {
          name,
          image: imageUrl,
          description,
        });
        message.success('Author updated successfully!');
      } else {
        await blogauthors.post('/', {
          name,
          image: imageUrl,
          description,
        });
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

  // Delete author with confirmation
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
        visible={modalVisible}
        onCancel={closeModal}
        onOk={handleSubmit}
        okText={editAuthor ? 'Update' : 'Create'}
        confirmLoading={modalLoading}
        destroyOnClose
        width={700}
      >
        <Input
          placeholder="Enter author name"
          value={name}
          onChange={(e) => setName(e.target.value)}
          style={{ marginBottom: 15 }}
          maxLength={100}
        />

        <Upload
          beforeUpload={beforeUpload}
          showUploadList={false}
          accept="image/*"
          style={{ marginBottom: 15 }}
          disabled={modalLoading}
        >
          <Button icon={<UploadOutlined />} loading={modalLoading}>
            {imageUrl ? 'Change Image' : 'Upload Image'}
          </Button>
        </Upload>
        {imageUrl && (
          <img
            src={imageUrl}
            alt="author preview"
            style={{
              width: 120,
              height: 120,
              marginBottom: 15,
              objectFit: 'cover',
              borderRadius: 6,
              border: '1px solid #ddd',
            }}
          />
        )}

        <ReactQuill
          theme="snow"
          value={description}
          onChange={setDescription}
          placeholder="Enter author description"
          readOnly={modalLoading}
          style={{ height: 150 }}
        />
      </Modal>
    </div>
  );
};

export default Blogauthor;
