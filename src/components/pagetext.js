import React, { useEffect, useState } from "react";
import { pagetext } from "../utils/axios"; // your axios instance
import "./pagetext.css";

const TextContentAdmin = () => {
  const [list, setList] = useState([]);
  const [pageName, setPageName] = useState("");
  const [content, setContent] = useState("");
  const [editId, setEditId] = useState(null);

  const fetchData = async () => {
    const res = await pagetext.get("/");
    setList(res.data);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (editId) {
      await pagetext.put(`/${editId}`, { pageName, content });
    } else {
      await pagetext.post("/", { pageName, content });
    }

    setPageName("");
    setContent("");
    setEditId(null);
    fetchData();
  };

  const handleEdit = (item) => {
    setPageName(item.pageName);
    setContent(item.content);
    setEditId(item._id);
  };

  const handleDelete = async (id) => {
    await pagetext.delete(`/${id}`);
    fetchData();
  };

  useEffect(() => {
    fetchData();
  }, []);

  return (
    <div className="panelContainer">
      <h2>Manage Page Text</h2>

      <form className="adminForm" onSubmit={handleSubmit}>
        <label>Page Name</label>
        <input
          type="text"
          value={pageName}
          onChange={(e) => setPageName(e.target.value)}
          placeholder="home, category, product..."
          required
        />

        <label>Content</label>
        <textarea
          value={content}
          onChange={(e) => setContent(e.target.value)}
          required
        ></textarea>

        <button type="submit">{editId ? "Update" : "Create"}</button>
      </form>

      <table className="adminTable">
        <thead>
          <tr>
            <th>Page</th>
            <th>Text</th>
            <th>Actions</th>
          </tr>
        </thead>
        <tbody>
          {list.map((item) => (
            <tr key={item._id}>
              <td>{item.pageName}</td>
              <td>{item.content}</td>
              <td>
                <button className="editBtn" onClick={() => handleEdit(item)}>
                  Edit
                </button>
                <button
                  className="deleteBtn"
                  onClick={() => handleDelete(item._id)}
                >
                  Delete
                </button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};

export default TextContentAdmin;
