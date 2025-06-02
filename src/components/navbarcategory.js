import { useState, useEffect } from 'react';
import './navbarcategory.css';
import { message } from 'antd';
import { category } from "../utils/axios";  

function Navbarcategory() {
  const [categories, setCategories] = useState([]);
  const [maxVisible, setMaxVisible] = useState(6);

  useEffect(() => {
    const fetchCategories = async () => {
      try {
        const response = await category.get("/");
        const formatted = response.data.map((item, index) => ({
          id: item._id || index + 1, // Use item._id if available
          name: item.name || item.title || `Category ${index + 1}`, // Fallback to title or generic
          visible: index < 6, // Default: first 6 visible
        }));
        setCategories(formatted);
      } catch (error) {
        console.error("Error fetching categories:", error);
        message.error("Failed to load categories. Please try again later.");
      }
    };

    fetchCategories();
  }, []);

  const toggleVisibility = (id) => {
    setCategories(categories.map(category =>
      category.id === id ? { ...category, visible: !category.visible } : category
    ));
  };

  const makeVisible = (id) => {
    const visibleCount = categories.filter(c => c.visible).length;
    if (visibleCount >= maxVisible) {
      alert(`Maximum ${maxVisible} categories can be visible at a time.`);
      return;
    }
    toggleVisibility(id);
  };

  return (
    <div className="navbarcategory-container">
      <h2>Navbar Categories Management</h2>
      <div className="controls">
        <label>
          Max Visible Categories:
          <input
            type="number"
            value={maxVisible}
            onChange={(e) => setMaxVisible(parseInt(e.target.value) || 1)}
            min="1"
            max="9"
          />
        </label>
      </div>

      <div className="categories-section">
        <div className="visible-categories">
          <h3>Visible on Website ({categories.filter(c => c.visible).length}/{maxVisible})</h3>
          <div className="categories-list">
            {categories.filter(c => c.visible).map(category => (
              <div key={category.id} className="category-item">
                <span>{category.name}</span>
                <label className="switch">
                  <input
                    type="checkbox"
                    checked={category.visible}
                    onChange={() => toggleVisibility(category.id)}
                  />
                  <span className="slider round"></span>
                </label>
              </div>
            ))}
          </div>
        </div>

        <div className="hidden-categories">
          <h3>Hidden Categories</h3>
          <div className="categories-list">
            {categories.filter(c => !c.visible).map(category => (
              <div key={category.id} className="category-item">
                <span>{category.name}</span>
                <button
                  className="show-button"
                  onClick={() => makeVisible(category.id)}
                >
                  Show
                </button>
              </div>
            ))}
          </div>
        </div>
      </div>

      <div className="preview-section">
        <h3>Navbar Preview</h3>
        <div className="navbar-preview">
          {categories.filter(c => c.visible).map(category => (
            <div key={category.id} className="nav-item">
              {category.name}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

export default Navbarcategory;
