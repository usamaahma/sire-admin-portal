import React, { useState } from 'react';
import { Table, Button } from 'antd';
import { useDrag, useDrop } from 'react-dnd';
import { DndProvider } from 'react-dnd';
import { HTML5Backend } from 'react-dnd-html5-backend';
import { product } from "../utils/axios";

const initialProducts = [
  { _id: '1', name: 'Product A' },
  { _id: '2', name: 'Product B' },
  { _id: '3', name: 'Product C' },
  { _id: '4', name: 'Product D' },
];

const ProductSorting = () => {
  const [products, setProducts] = useState(initialProducts);

  const moveProduct = (dragIndex, hoverIndex) => {
    const draggedItem = products[dragIndex];
    const newProducts = [...products];
    newProducts.splice(dragIndex, 1);
    newProducts.splice(hoverIndex, 0, draggedItem);
    setProducts(newProducts);
  };

  const columns = [
    { title: 'Product ID', dataIndex: 'id', key: 'id' },
    { title: 'Product', dataIndex: 'name', key: 'name' },
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
    // Send the new sorted product order to the backend
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
        components={{ body: { row: DraggableTableRow } }}
        onRow={(record, index) => ({ index, moveProduct })}
      />
      <Button type="primary" style={{ marginTop: '16px' }} onClick={handleSave}>
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
