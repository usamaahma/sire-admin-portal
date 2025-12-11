import React, { useState, useEffect } from "react";
import ReactQuill from "react-quill";
import "react-quill/dist/quill.snow.css";
import { message, Modal } from "antd";
import { FiEdit2, FiTrash2, FiPlus, FiSave } from "react-icons/fi";
import CloudinaryUploader from "./cloudinary/CloudinaryUploader";
import { subcategory, category } from "../utils/axios";
import "./sub-category.css";

// Utility function to convert text to slug
const convertToSlug = (text) => {
  return text
    .toLowerCase()
    .replace(/[^\w ]+/g, "")
    .replace(/ +/g, "-");
};

function Subcategory() {
  const [subcategories, setSubcategories] = useState([]);
  const [showForm, setShowForm] = useState(false);
  const [editingIndex, setEditingIndex] = useState(null);
  const [selectedCategory, setSelectedCategory] = useState(null);
  const categoryId = localStorage.getItem("selectedCategoryId");

  const [formData, setFormData] = useState({
    title: "",
    slug: "",
    image: [],
    pageImage: [],
    description: "",
    detailTitle: "",
    detailSubtitle: "",
    seoTitle: "",
    // seoKeyword: "",
    seoDescription: "",
    details: [{ detailDescription: "", images: [] }],
  });

  const cloudName = "dxhpud7sx";
  const uploadPreset = "sireprinting";

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

  // Fetch selected category
  useEffect(() => {
    const fetchCategory = async () => {
      try {
        const res = await category.get(`/${categoryId}`);
        setSelectedCategory(res.data);
      } catch (error) {
        console.error("Error fetching category:", error);
      }
    };

    if (categoryId) fetchCategory();
  }, [categoryId]);

  const toggleForm = () => {
    setShowForm(!showForm);
    if (showForm) resetForm();
  };

  const resetForm = () => {
    setFormData({
      title: "",
      slug: "",
      image: [],
      pageImage: [],
      description: "",
      detailTitle: "",
      detailSubtitle: "",
      seoTitle: "",
      // seoKeyword: "",
      seoDescription: "",
      details: [{ detailDescription: "", images: [] }],
    });
    setEditingIndex(null);
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
      ...(name === "title" && {
        slug: selectedCategory
          ? `${selectedCategory.slug}/${convertToSlug(value)}`
          : convertToSlug(value),
      }),
    }));
  };

  const handleQuillChange = (value, field) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
  };

  const handleDetailQuillChange = (index, value) => {
    const updatedDetails = [...formData.details];
    updatedDetails[index].detailDescription = value;
    setFormData((prev) => ({ ...prev, details: updatedDetails }));
  };

  const addDetailItem = () => {
    setFormData((prev) => ({
      ...prev,
      details: [...prev.details, { detailDescription: "", images: [] }],
    }));
  };

  const removeDetailItem = (index) => {
    const updatedDetails = formData.details.filter((_, i) => i !== index);
    setFormData((prev) => ({ ...prev, details: updatedDetails }));
  };

  const handleImageUpload = (fileList, fieldName) => {
    setFormData((prev) => ({ ...prev, [fieldName]: fileList }));
  };

  const handleDetailImagesUpload = (fileList, detailIndex) => {
    const updatedDetails = [...formData.details];
    updatedDetails[detailIndex].images = fileList;
    setFormData((prev) => ({ ...prev, details: updatedDetails }));
  };

  const stripHtml = (html) => {
    const tmp = document.createElement("DIV");
    tmp.innerHTML = html;
    return tmp.textContent || tmp.innerText || "";
  };

  const handleSubmit = async () => {
    try {
      const payload = {
        ...formData,
        slug:
          formData.slug ||
          `${selectedCategory.slug}/${convertToSlug(formData.title)}`,
        image: formData.image[0]?.url || "",
        pageImage: formData.pageImage[0]?.url || "",
        details: formData.details.map((d) => ({
          detailDescription: stripHtml(d.detailDescription) || "",
          image: d.images[0]?.url || "",
        })),
        categoryId: categoryId,
      };

      if (!payload.title || !payload.categoryId) {
        message.error("Title and Category ID are required!");
        return;
      }

      const res = await subcategory.post("/", payload);
      setSubcategories([...subcategories, res.data]);
      message.success("Subcategory created successfully!");
      resetForm();
      setShowForm(false);
    } catch (error) {
      console.error("Error saving subcategory:", error);
      message.error("Failed to save subcategory. Please try again.");
    }
  };

  const handleEdit = (index) => {
    const subcatToEdit = subcategories[index];
    setFormData({
      _id: subcatToEdit._id,
      title: subcatToEdit.title,
      slug: subcatToEdit.slug,
      image: subcatToEdit.image
        ? [
            {
              uid: "-1",
              name: "subcategory-image.png",
              status: "done",
              url: subcatToEdit.image,
              thumbUrl: subcatToEdit.image,
            },
          ]
        : [],
      pageImage: subcatToEdit.pageImage
        ? [
            {
              uid: "-2",
              name: "page-image.png",
              status: "done",
              url: subcatToEdit.pageImage,
              thumbUrl: subcatToEdit.pageImage,
            },
          ]
        : [],
      description: subcatToEdit.description,
      detailTitle: subcatToEdit.detailTitle,
      detailSubtitle: subcatToEdit.detailSubtitle,
      seoTitle: subcatToEdit.seoTitle,
      // seoKeyword: subcatToEdit.seoKeyword,
      seoDescription: subcatToEdit.seoDescription,
      details: (subcatToEdit.details || []).map((detail, i) => ({
        detailDescription: detail.detailDescription,
        images: detail.image
          ? [
              {
                uid: `detail-${i}`,
                name: `detail-image-${i}.png`,
                status: "done",
                url: detail.image,
                thumbUrl: detail.image,
              },
            ]
          : [],
      })),
    });
    setEditingIndex(index);
    setShowForm(true);
  };

  const handleEditSubmit = async () => {
    try {
      const updatedSubcategory = {
        ...formData,
        slug:
          formData.slug ||
          `${selectedCategory.slug}/${convertToSlug(formData.title)}`,
        image: formData.image[0]?.url || "",
        pageImage: formData.pageImage[0]?.url || "",
        details: formData.details.map((detail) => ({
          detailDescription: stripHtml(detail.detailDescription) || "",
          image: detail.images[0]?.url || "",
        })),
        categoryId: categoryId,
      };

      await subcategory.patch(`/${formData._id}`, updatedSubcategory);
      const updatedSubcategories = subcategories.map((item, idx) =>
        idx === editingIndex ? updatedSubcategory : item
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

  const handleDelete = (index) => {
    const subcatId = subcategories[index]._id;
    Modal.confirm({
      title: "Are you sure you want to delete this subcategory?",
      onOk: async () => {
        try {
          await subcategory.delete(`/${subcatId}`);
          setSubcategories(subcategories.filter((_, i) => i !== index));
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
    if (categoryId) fetchSubcategories();
  }, [categoryId]);

  return (
    <div className="admin-portal-container">
      <div className="admin-header">
        <h1>Subcategories Management</h1>
        {selectedCategory && (
          <p className="selected-category">
            Selected Category: <strong>{selectedCategory.title}</strong> (slug:{" "}
            <code>{selectedCategory.slug}</code>)
          </p>
        )}
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
            onSubmit={(e) => {
              e.preventDefault();
              editingIndex !== null ? handleEditSubmit() : handleSubmit();
            }}
          >
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

            <div className="form-group">
              <label>Slug (Auto-generated)</label>
              <input
                type="text"
                name="slug"
                value={formData.slug}
                readOnly
                placeholder="Slug will be auto-generated"
              />
              <small className="slug-preview">
                Full URL:{" "}
                <code>
                  {formData.slug ||
                    `${selectedCategory?.slug || "category"}/subcategory`}
                </code>
              </small>
            </div>

            <div className="form-row">
              <div className="form-group">
                <label>Main Image</label>
                <CloudinaryUploader
                  cloudName={cloudName}
                  uploadPreset={uploadPreset}
                  listType="picture-card"
                  onUploadSuccess={(fileList) =>
                    handleImageUpload(fileList, "image")
                  }
                  fileList={formData.image}
                />
              </div>
              <div className="form-group">
                <label>Page Image</label>
                <CloudinaryUploader
                  cloudName={cloudName}
                  uploadPreset={uploadPreset}
                  listType="picture-card"
                  onUploadSuccess={(fileList) =>
                    handleImageUpload(fileList, "pageImage")
                  }
                  fileList={formData.pageImage}
                />
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

            {/* <div className="form-group">
              <label>SEO Keywords</label>
              <input
                type="text"
                name="seoKeyword"
                value={formData.seoKeyword}
                onChange={handleChange}
                placeholder="Enter keywords separated by commas"
              />
            </div> */}

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
                    <label>Section Image</label>
                    <CloudinaryUploader
                      cloudName={cloudName}
                      uploadPreset={uploadPreset}
                      listType="picture-card"
                      onUploadSuccess={(fileList) =>
                        handleDetailImagesUpload(fileList, index)
                      }
                      fileList={detail.images}
                    />
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

      {subcategories.length > 0 && (
        <div className="subcategories-table">
          <h2>Subcategories List</h2>
          <table>
            <thead>
              <tr>
                <th>ID</th>
                <th>Image</th>
                <th>Title</th>
                <th>Slug</th>
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
                  <td>
                    <code>{subcat.slug}</code>
                  </td>
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
