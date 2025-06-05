import React, { useState, useEffect } from 'react';
import { Table, Button } from 'antd';
import { useDrag, useDrop } from 'react-dnd';
import { DndProvider } from 'react-dnd';
import { HTML5Backend } from 'react-dnd-html5-backend';
import { product } from "../utils/axios";

const ProductSorting = () => {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchProducts = async () => {
      try {
        const response = await product.get("/");
        setProducts(response.data);
      } catch (error) {
        console.error('Error fetching products:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchProducts();
  }, []);

  const moveProduct = (dragIndex, hoverIndex) => {
    const draggedItem = products[dragIndex];
    const newProducts = [...products];
    newProducts.splice(dragIndex, 1);
    newProducts.splice(hoverIndex, 0, draggedItem);
    setProducts(newProducts);
  };

  const columns = [
    {
      title: 'Sr. No.',
      key: 'serialNumber',
      render: (text, record, index) => index + 1, // Auto-incrementing serial number
      width: 80,
      align: 'center'
    },
    { 
      title: 'Product Name', 
      dataIndex: 'title',
      key: 'title',
      render: (text) => text || 'Untitled Product'
    },
    { 
      title: 'Brand', 
      dataIndex: 'brand', 
      key: 'brand' 
    }
  ];

  const DraggableTableRow = ({ index, moveProduct, ...restProps }) => {
    const [, drag] = useDrag({
      type: 'row',
      item: { index },
    });

    const [, drop] = useDrop({
      accept: 'row',
      hover: (item) => {
        if (item.index !== index) {
          moveProduct(item.index, index);
          item.index = index;
        }
      },
    });

    return (
      <tr ref={(node) => drop(drag(node))} {...restProps} />
    );
  };

  const handleSave = async () => {
    try {
      const response = await product.post("/", { products });
      console.log(response);
      // Handle success
    } catch (error) {
      console.error('Error saving sorted products:', error);
    }
  };

  return (
    <div>
      <Table
        rowKey="_id"
        columns={columns}
        dataSource={products}
        pagination={false}
        loading={loading}
        components={{ body: { row: DraggableTableRow } }}
        onRow={(record, index) => ({ index, moveProduct })}
      />
      <Button 
        type="primary" 
        style={{ marginTop: '16px' }} 
        onClick={handleSave}
        disabled={loading}
      >
        Save Sorting
      </Button>
    </div>
  );
};

const ProductSortingWrapper = () => {
  return (
    <DndProvider backend={HTML5Backend}>
      <ProductSorting />
    </DndProvider>
  );
};

export default ProductSortingWrapper;
