import React, { useState, useEffect } from "react";
import ReactQuill from "react-quill";
import "react-quill/dist/quill.snow.css";
import { message,Modal } from "antd";
import {
  FiEdit2,
  FiTrash2,
  FiPlus,
  FiUpload,
  FiX,
  FiSave,
} from "react-icons/fi";
import { subcategory } from "../utils/axios";
import "./sub-category.css";

function Subcategory() {
  // State for subcategories list
  const [subcategories, setSubcategories] = useState([]);
  const [showForm, setShowForm] = useState(false);
  const [editingIndex, setEditingIndex] = useState(null);
  const categoryId = localStorage.getItem("selectedCategoryId");

  // State for form data
  const [formData, setFormData] = useState({
    title: "",
    image: "",
    pageImage: "",
    description: "",
    detailTitle: "",
    detailSubtitle: "",
    seoTitle: "",
    seoKeyword: "",
    seoDescription: "",
    details: [{ detailDescription: "", images: [] }],
  });

  // Quill modules and formats
  const modules = {
    toolbar: [
      [{ header: [1, 2, 3, false] }],
      ["bold", "italic", "underline", "strike"],
      [{ list: "ordered" }, { list: "bullet" }],
      ["link", "image"],
      ["clean"],
      [{ align: [] }],
    ],
  };

  const formats = [
    "header",
    "bold",
    "italic",
    "underline",
    "strike",
    "list",
    "bullet",
    "link",
    "image",
    "align",
  ];

  // Toggle form visibility
  const toggleForm = () => {
    setShowForm(!showForm);
    if (showForm) {
      resetForm();
    }
  };

  // Reset form
  const resetForm = () => {
    setFormData({
      title: "",
      image: "",
      pageImage: "",
      description: "",
      detailTitle: "",
      detailSubtitle: "",
      seoTitle: "",
      seoKeyword: "",
      seoDescription: "",
      details: [{ detailDescription: "", images: [] }],
    });
    setEditingIndex(null);
  };

  // Handle input changes
  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  // Handle quill editor changes
  const handleQuillChange = (value, field) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
  };

  // Handle detail quill changes
  const handleDetailQuillChange = (index, value) => {
    const updatedDetails = [...formData.details];
    updatedDetails[index].detailDescription = value;
    setFormData((prev) => ({ ...prev, details: updatedDetails }));
  };

  // Add new detail item
  const addDetailItem = () => {
    setFormData((prev) => ({
      ...prev,
      details: [...prev.details, { detailDescription: "", images: [] }],
    }));
  };

  // Remove detail item
  const removeDetailItem = (index) => {
    const updatedDetails = formData.details.filter((_, i) => i !== index);
    setFormData((prev) => ({ ...prev, details: updatedDetails }));
  };

  // Handle image upload
  const handleImageUpload = (e, fieldName) => {
    const file = e.target.files[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setFormData((prev) => ({ ...prev, [fieldName]: reader.result }));
      };
      reader.readAsDataURL(file);
    }
  };

  // Handle multiple image upload for details
  const handleDetailImagesUpload = (index, e) => {
    const files = Array.from(e.target.files);
    if (files.length > 0) {
      const readers = [];
      const images = [];

      files.forEach((file) => {
        const reader = new FileReader();
        reader.onloadend = () => {
          images.push(reader.result);
          if (images.length === files.length) {
            const updatedDetails = [...formData.details];
            updatedDetails[index].images = [
              ...updatedDetails[index].images,
              ...images,
            ];
            setFormData((prev) => ({ ...prev, details: updatedDetails }));
          }
        };
        reader.readAsDataURL(file);
        readers.push(reader);
      });
    }
  };

  // Remove detail image
  const removeDetailImage = (detailIndex, imageIndex) => {
    const updatedDetails = [...formData.details];
    updatedDetails[detailIndex].images = updatedDetails[
      detailIndex
    ].images.filter((_, i) => i !== imageIndex);
    setFormData((prev) => ({ ...prev, details: updatedDetails }));
  };
  const stripHtml = (html) => {
    const tmp = document.createElement("DIV");
    tmp.innerHTML = html;
    return tmp.textContent || tmp.innerText || "";
  };
  // Submit form
  const handleSubmit = async (e) => {
    e.preventDefault();

    const payload = {
      ...formData,
      details: formData.details.map((d) => ({
        detailDescription: stripHtml(d.detailDescription),
        image: d.images[0] || "", // assuming single image for backend structure
      })),
      categoryId: categoryId,
    };

    try {
      const res = await subcategory.post("/", payload, {
        headers: {
          "Content-Type": "application/json",
        },
      });

      message.success("Subcategory created successfully!");
      setSubcategories([...subcategories, res.data]);
      resetForm();
      setShowForm(false);
    } catch (error) {
      console.error("Error saving subcategory:", error);
      message.error("Failed to save subcategory. Please try again.");
    }
  };

  // Edit subcategory
  const handleEdit = (index) => {
    const subcatToEdit = subcategories[index];
    setFormData({
      _id: subcatToEdit._id,
      title: subcatToEdit.title,
      image: subcatToEdit.image,
      pageImage: subcatToEdit.pageImage,
      description: subcatToEdit.description,
      detailTitle: subcatToEdit.detailTitle,
      detailSubtitle: subcatToEdit.detailSubtitle,
      seoTitle: subcatToEdit.seoTitle,
      seoKeyword: subcatToEdit.seoKeyword,
      seoDescription: subcatToEdit.seoDescription,
      details: subcatToEdit.details?.map((detail) => ({
        detailDescription: detail.detailDescription,
        images: detail.image ? [detail.image] : [],
      })) || [{ detailDescription: "", images: [] }],
    });
    setEditingIndex(index);
    setShowForm(true);
  };

  // Update subcategory
  const handleEditSubmit = async (e) => {
    e.preventDefault();

    try {
      const updatedSubcategory = {
        ...formData,
        details: formData.details.map((detail) => ({
          detailDescription: detail.detailDescription,
          image: detail.images[0] || "", // Replace with uploaded URLs if needed
        })),
        categoryId: categoryId,
      };

      await subcategory.patch(`/${formData._id}`, updatedSubcategory);

      const updatedSubcategories = subcategories.map((item, idx) =>
        idx === editingIndex ? { ...item, ...updatedSubcategory } : item
      );

      setSubcategories(updatedSubcategories);
      setShowForm(false);
      setEditingIndex(null);
      message.success("Subcategory updated successfully!");
    } catch (error) {
      console.error("Error updating subcategory:", error);
      message.error("Failed to update subcategory. Please try again.");
    }
  };

  // Delete subcategory
const handleDelete = (index) => {
  const subcatId = subcategories[index]._id;

  Modal.confirm({
    title: "Are you sure you want to delete this subcategory?",
    onOk: async () => {
      try {
        // ✅ Send DELETE request
        await subcategory.delete(`/${subcatId}`);

        // ✅ Update local state
        const updatedSubcategories = subcategories.filter((_, i) => i !== index);
        setSubcategories(updatedSubcategories);

        message.success("Subcategory deleted successfully!");
      } catch (error) {
        console.error("Error deleting subcategory:", error);
        message.error("Failed to delete subcategory. Please try again.");
      }
    },
  });
};


  useEffect(() => {
    const fetchSubcategories = async () => {
      try {
        const res = await subcategory.get(`/category/${categoryId}`);
        setSubcategories(res.data);
      } catch (error) {
        console.error("Error fetching subcategories:", error);
        message.error("Failed to fetch subcategories.");
      }
    };

    if (categoryId) {
      fetchSubcategories();
    }
  }, [categoryId]);

  return (
    <div className="admin-portal-container">
      <div className="admin-header">
        <h1>Subcategories Management</h1>
        <button className="add-btn" onClick={toggleForm}>
          <FiPlus /> {showForm ? "Cancel" : "Add Subcategory"}
        </button>
      </div>

      {showForm && (
        <div className="admin-form-section">
          <h2>
            {editingIndex !== null ? "Edit Subcategory" : "Add New Subcategory"}
          </h2>
          <form
            onSubmit={editingIndex !== null ? handleEditSubmit : handleSubmit}
          >
            {/* Main Fields */}
            <div className="form-group">
              <label>Title *</label>
              <input
                type="text"
                name="title"
                value={formData.title}
                onChange={handleChange}
                required
                placeholder="Enter subcategory title"
              />
            </div>

            <div className="form-row">
              <div className="form-group">
                <label>Main Image</label>
                <div className="image-upload-container">
                  <label className="image-upload-btn">
                    <FiUpload className="upload-icon" />
                    <span>Upload Image</span>
                    <input
                      type="file"
                      accept="image/*"
                      onChange={(e) => handleImageUpload(e, "image")}
                      hidden
                    />
                  </label>
                  {formData.image && (
                    <div className="image-preview-container">
                      <img
                        src={formData.image}
                        alt="Preview"
                        className="image-preview"
                      />
                      <button
                        type="button"
                        className="remove-image-btn"
                        onClick={() =>
                          setFormData((prev) => ({ ...prev, image: "" }))
                        }
                      >
                        <FiX />
                      </button>
                    </div>
                  )}
                </div>
              </div>

              <div className="form-group">
                <label>Page Image</label>
                <div className="image-upload-container">
                  <label className="image-upload-btn">
                    <FiUpload className="upload-icon" />
                    <span>Upload Image</span>
                    <input
                      type="file"
                      accept="image/*"
                      onChange={(e) => handleImageUpload(e, "pageImage")}
                      hidden
                    />
                  </label>
                  {formData.pageImage && (
                    <div className="image-preview-container">
                      <img
                        src={formData.pageImage}
                        alt="Preview"
                        className="image-preview"
                      />
                      <button
                        type="button"
                        className="remove-image-btn"
                        onClick={() =>
                          setFormData((prev) => ({ ...prev, pageImage: "" }))
                        }
                      >
                        <FiX />
                      </button>
                    </div>
                  )}
                </div>
              </div>
            </div>

            <div className="form-group">
              <label>Description</label>
              <ReactQuill
                value={formData.description}
                onChange={(value) => handleQuillChange(value, "description")}
                modules={modules}
                formats={formats}
                theme="snow"
                placeholder="Enter detailed description..."
              />
            </div>

            <div className="form-row">
              <div className="form-group">
                <label>Detail Title</label>
                <input
                  type="text"
                  name="detailTitle"
                  value={formData.detailTitle}
                  onChange={handleChange}
                  placeholder="Enter detail section title"
                />
              </div>
              <div className="form-group">
                <label>Detail Subtitle</label>
                <input
                  type="text"
                  name="detailSubtitle"
                  value={formData.detailSubtitle}
                  onChange={handleChange}
                  placeholder="Enter detail section subtitle"
                />
              </div>
            </div>

            {/* SEO Fields */}
            <div className="form-group">
              <label>SEO Title</label>
              <input
                type="text"
                name="seoTitle"
                value={formData.seoTitle}
                onChange={handleChange}
                placeholder="Enter SEO title (50-60 characters)"
              />
            </div>

            <div className="form-group">
              <label>SEO Keywords</label>
              <input
                type="text"
                name="seoKeyword"
                value={formData.seoKeyword}
                onChange={handleChange}
                placeholder="Enter keywords separated by commas"
              />
            </div>

            <div className="form-group">
              <label>SEO Description</label>
              <textarea
                name="seoDescription"
                value={formData.seoDescription}
                onChange={handleChange}
                rows="3"
                placeholder="Enter SEO description (150-160 characters)"
              />
            </div>

            {/* Details Section */}
            <div className="details-section">
              <h3>Content Sections</h3>
              {formData.details.map((detail, index) => (
                <div key={index} className="detail-form-group">
                  <div className="form-group">
                    <label>Section Content</label>
                    <ReactQuill
                      value={detail.detailDescription}
                      onChange={(value) =>
                        handleDetailQuillChange(index, value)
                      }
                      modules={modules}
                      formats={formats}
                      theme="snow"
                      placeholder="Enter section content..."
                    />
                  </div>

                  <div className="form-group">
                    <label>Section Images (Multiple)</label>
                    <div className="image-upload-container">
                      <label className="image-upload-btn">
                        <FiUpload className="upload-icon" />
                        <span>Upload Images</span>
                        <input
                          type="file"
                          accept="image/*"
                          multiple
                          onChange={(e) => handleDetailImagesUpload(index, e)}
                          hidden
                        />
                      </label>
                      <div className="image-preview-grid">
                        {detail.images.map((image, imgIndex) => (
                          <div
                            key={imgIndex}
                            className="image-preview-container"
                          >
                            <img
                              src={image}
                              alt={`Preview ${imgIndex + 1}`}
                              className="image-preview"
                            />
                            <button
                              type="button"
                              className="remove-image-btn"
                              onClick={() => removeDetailImage(index, imgIndex)}
                            >
                              <FiX />
                            </button>
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>

                  {formData.details.length > 1 && (
                    <button
                      type="button"
                      className="remove-btn"
                      onClick={() => removeDetailItem(index)}
                    >
                      <FiTrash2 /> Remove Section
                    </button>
                  )}
                </div>
              ))}

              <button
                type="button"
                className="add-section-btn"
                onClick={addDetailItem}
              >
                <FiPlus /> Add Content Section
              </button>
            </div>

            <div className="form-actions">
              <button type="submit" className="submit-btn">
                <FiSave /> {editingIndex !== null ? "Update" : "Save"}{" "}
                Subcategory
              </button>
            </div>
          </form>
        </div>
      )}

      {/* Subcategories Table */}
      {subcategories.length > 0 && (
        <div className="subcategories-table">
          <h2>Subcategories List</h2>
          <table>
            <thead>
              <tr>
                <th>ID</th>
                <th>Image</th>
                <th>Title</th>
                <th>Description</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {subcategories.map((subcat, index) => (
                <tr key={index}>
                  <td>{index + 1}</td>
                  <td>
                    {subcat.image ? (
                      <img
                        src={subcat.image}
                        alt={`Subcategory ${index + 1}`}
                        style={{
                          width: "60px",
                          height: "60px",
                          objectFit: "cover",
                          borderRadius: "4px",
                        }}
                      />
                    ) : (
                      <span>No Image</span>
                    )}
                  </td>
                  <td>{subcat.title}</td>
                  <td className="description-cell">
                    <div
                      dangerouslySetInnerHTML={{
                        __html:
                          subcat.description?.substring(0, 100) +
                          (subcat.description?.length > 100 ? "..." : ""),
                      }}
                    />
                  </td>
                  <td className="actions-cell">
                    <button
                      className="edit-btn"
                      onClick={() => handleEdit(index)}
                    >
                      <FiEdit2 /> Edit
                    </button>
                    <button
                      className="delete-btn"
                      onClick={() => handleDelete(index)}
                    >
                      <FiTrash2 /> Delete
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {!showForm && subcategories.length === 0 && (
        <div className="empty-state">
          <p>
            No subcategories added yet. Click "Add Subcategory" to get started.
          </p>
        </div>
      )}
    </div>
  );
}

export default Subcategory;
