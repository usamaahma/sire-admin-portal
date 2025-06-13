import { useState, useEffect } from 'react';
import './navbarcategory.css';
import { message } from 'antd';
import { category, navitems } from "../utils/axios";

function Navbarcategory() {
  const [categories, setCategories] = useState([]);
  const [navItems, setNavItems] = useState([]);
  const [maxVisible, setMaxVisible] = useState(6);
  const [selectedNavItem, setSelectedNavItem] = useState(null);

  useEffect(() => {
    const fetchData = async () => {
      try {
        // Fetch all categories
        const categoryResponse = await category.get("/");
        const formattedCategories = categoryResponse.data.map((item, index) => ({
          id: item._id,
          name: item.title || `Category ${index + 1}`,
          visible: false, // Initially all categories are hidden
        }));
        setCategories(formattedCategories);

        // Fetch navitems
        const navItemsResponse = await navitems.get("/");
        setNavItems(navItemsResponse.data);

        // If there's at least one navItem, set the first one as selected and update visibility
        if (navItemsResponse.data.length > 0) {
          const firstNavItem = navItemsResponse.data[0];
          setSelectedNavItem(firstNavItem._id);
          setCategories(prev => prev.map(cat => ({
            ...cat,
            visible: firstNavItem.categories.some(c => c._id === cat.id)
          })));
        }
      } catch (error) {
        console.error("Error fetching data:", error);
        message.error("Failed to load data. Please try again later.");
      }
    };

    fetchData();
  }, []);

  const handleNavItemSelect = async (navItemId) => {
    try {
      const navItemResponse = await navitems.get(`/${navItemId}`);
      setSelectedNavItem(navItemId);
      setCategories(prev => prev.map(cat => ({
        ...cat,
        visible: navItemResponse.data.categories.some(c => c._id === cat.id)
      })));
    } catch (error) {
      console.error("Error fetching navitem:", error);
      message.error("Failed to load navitem data.");
    }
  };

  const toggleVisibility = async (categoryId) => {
    if (!selectedNavItem) {
      message.error("Please select or create a NavItem first.");
      return;
    }

    const visibleCount = categories.filter(c => c.visible).length;
    const categoryToToggle = categories.find(c => c.id === categoryId);

    if (!categoryToToggle.visible && visibleCount >= maxVisible) {
      message.error(`Maximum ${maxVisible} categories can be visible at a time.`);
      return;
    }

    try {
      const navItemResponse = await navitems.get(`/${selectedNavItem}`);
      const currentCategories = navItemResponse.data.categories.map(c => c._id);
      
      let updatedCategories;
      if (categoryToToggle.visible) {
        updatedCategories = currentCategories.filter(id => id !== categoryId);
      } else {
        updatedCategories = [...currentCategories, categoryId];
      }

      await navitems.put(`/${selectedNavItem}`, {
        categories: updatedCategories,
        isActive: true,
      });

      setCategories(prev => prev.map(category =>
        category.id === categoryId ? { ...category, visible: !category.visible } : category
      ));
      message.success("Category visibility updated successfully.");
    } catch (error) {
      console.error("Error updating navitem:", error);
      message.error("Failed to update category visibility.");
    }
  };

  const createNewNavItem = async () => {
    try {
      const response = await navitems.post("/", {
        categories: [],
        isActive: true,
        position: navItems.length,
      });
      console.log(response,"nav ki cat post")
      setNavItems([...navItems, response.data]);
      setSelectedNavItem(response.data._id);
      setCategories(prev => prev.map(cat => ({ ...cat, visible: false })));
      message.success("New NavItem created successfully.");
    } catch (error) {
      console.error("Error creating navitem:", error);
      message.error("Failed to create new NavItem.");
    }
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
        <div>
          <label>Select NavItem:</label>
          <select
            value={selectedNavItem || ""}
            onChange={(e) => handleNavItemSelect(e.target.value)}
          >
            <option value="" disabled>Select a NavItem</option>
            {navItems.map(navItem => (
              <option key={navItem._id} value={navItem._id}>
                NavItem {navItem.position + 1} {navItem.isActive ? "(Active)" : "(Inactive)"}
              </option>
            ))}
          </select>
          <button onClick={createNewNavItem} style={{ marginLeft: '10px' }}>
            Create New NavItem
          </button>
        </div>
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
                  onClick={() => toggleVisibility(category.id)}
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