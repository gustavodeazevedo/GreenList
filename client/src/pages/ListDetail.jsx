import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { useList } from '../contexts/ListContext';
import { addItem, updateItem, deleteItem, shareList } from '../services/listService';

const ListDetail = () => {
  const { id } = useParams();
  const { currentList, loading, error, fetchList } = useList();
  const [newItem, setNewItem] = useState({ name: '', quantity: 1, unit: 'unit', completed: false });
  const [shareEmail, setShareEmail] = useState('');
  const [shareError, setShareError] = useState('');
  const [localList, setLocalList] = useState(null);
  const [itemLoading, setItemLoading] = useState(false);
  const [actionItemId, setActionItemId] = useState(null);
  const [successMessage, setSuccessMessage] = useState('');

  useEffect(() => {
    fetchList(id);
  }, [fetchList, id]);

  useEffect(() => {
    if (currentList) {
      setLocalList(currentList);
    }
  }, [currentList]);

  // Clear success message after 3 seconds
  useEffect(() => {
    if (successMessage) {
      const timer = setTimeout(() => {
        setSuccessMessage('');
      }, 3000);
      return () => clearTimeout(timer);
    }
  }, [successMessage]);

  const handleAddItem = async (e) => {
    e.preventDefault();
    setItemLoading(true);
    try {
      const addedItem = await addItem(id, newItem);
      setLocalList({
        ...localList,
        items: [...localList.items, addedItem]
      });
      setNewItem({ name: '', quantity: 1, unit: 'unit', completed: false });
      setSuccessMessage('Item added successfully!');
    } catch (err) {
      setShareError(err.message || 'Failed to add item');
      console.error(err);
    } finally {
      setItemLoading(false);
    }
  };

  const handleToggleComplete = async (itemId, completed) => {
    setActionItemId(itemId);
    try {
      await updateItem(id, itemId, { completed: !completed });
      setLocalList({
        ...localList,
        items: localList.items.map(item => 
          item._id === itemId ? { ...item, completed: !completed } : item
        )
      });
    } catch (err) {
      setShareError(err.message || 'Failed to update item');
      console.error(err);
    } finally {
      setActionItemId(null);
    }
  };

  const handleDeleteItem = async (itemId) => {
    if (!window.confirm('Are you sure you want to remove this item?')) return;
    
    setActionItemId(itemId);
    try {
      await deleteItem(id, itemId);
      setLocalList({
        ...localList,
        items: localList.items.filter(item => item._id !== itemId)
      });
      setSuccessMessage('Item removed successfully!');
    } catch (err) {
      setShareError(err.message || 'Failed to delete item');
      console.error(err);
    } finally {
      setActionItemId(null);
    }
  };

  const handleShareList = async (e) => {
    e.preventDefault();
    setItemLoading(true);
    try {
      await shareList(id, { email: shareEmail });
      setShareEmail('');
      setShareError('');
      // Refresh list to get updated shared users
      fetchList(id);
      setSuccessMessage('List shared successfully!');
    } catch (err) {
      setShareError(err.message || 'Failed to share list');
      console.error(err);
    } finally {
      setItemLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="loading-container">
        <div className="loading-spinner"></div>
        <p>Loading your shopping list...</p>
      </div>
    );
  }
  
  if (error) {
    return (
      <div className="error-container">
        <h2>Something went wrong</h2>
        <p className="error-message">{error}</p>
        <div className="error-actions">
          <button onClick={() => fetchList(id)}>Try Again</button>
          <Link to="/dashboard">Back to Dashboard</Link>
        </div>
      </div>
    );
  }
  
  if (!localList) {
    return (
      <div className="not-found-container">
        <h2>List Not Found</h2>
        <p>The shopping list you're looking for doesn't exist or you don't have permission to view it.</p>
        <Link to="/dashboard" className="btn-primary">Back to Dashboard</Link>
      </div>
    );
  }

  return (
    <div className="list-detail-container">
      {successMessage && (
        <div className="success-message">
          {successMessage}
        </div>
      )}
      
      <div className="list-header">
        <h1>{localList.name}</h1>
        <div className="list-actions">
          <Link to="/dashboard" className="back-btn">Back to Lists</Link>
          <Link to={`/lists/${id}/edit`} className="edit-btn">Edit List</Link>
        </div>
      </div>

      <div className="list-content">
        <div className="items-section">
          <h2>Items</h2>
          {localList.items.length === 0 ? (
            <div className="empty-list">
              <p>No items in this list yet.</p>
              <p className="empty-list-hint">Add your first item using the form below.</p>
            </div>
          ) : (
            <ul className="items-list">
              {localList.items.map(item => (
                <li key={item._id} className={`item ${item.completed ? 'completed' : ''}`}>
                  <div className="item-check">
                    <input
                      type="checkbox"
                      checked={item.completed}
                      onChange={() => handleToggleComplete(item._id, item.completed)}
                      disabled={actionItemId === item._id}
                    />
                  </div>
                  <div className="item-details">
                    <span className="item-name">{item.name}</span>
                    <span className="item-quantity">{item.quantity} {item.unit}</span>
                  </div>
                  {actionItemId === item._id ? (
                    <div className="item-loading">
                      <div className="loading-spinner-small"></div>
                    </div>
                  ) : (
                    <button 
                      onClick={() => handleDeleteItem(item._id)}
                      className="delete-item-btn"
                      aria-label="Remove item"
                    >
                      Remove
                    </button>
                  )}
                </li>
              ))}
            </ul>
          )}

          <form onSubmit={handleAddItem} className="add-item-form">
            <h3>Add New Item</h3>
            {shareError && <div className="error-message">{shareError}</div>}
            <div className="form-row">
              <input
                type="text"
                placeholder="Item name"
                value={newItem.name}
                onChange={(e) => setNewItem({...newItem, name: e.target.value})}
                required
                disabled={itemLoading}
              />
              <input
                type="number"
                min="1"
                value={newItem.quantity}
                onChange={(e) => setNewItem({...newItem, quantity: parseInt(e.target.value) || 1})}
                required
                disabled={itemLoading}
              />
              <select
                value={newItem.unit}
                onChange={(e) => setNewItem({...newItem, unit: e.target.value})}
                disabled={itemLoading}
              >
                <option value="unit">unit</option>
                <option value="kg">kg</option>
                <option value="g">g</option>
                <option value="l">l</option>
                <option value="ml">ml</option>
                <option value="pkg">pkg</option>
              </select>
              <button type="submit" disabled={itemLoading}>
                {itemLoading ? 'Adding...' : 'Add'}
              </button>
            </div>
          </form>
        </div>

        <div className="share-section">
          <h2>Share List</h2>
          {shareError && <div className="error-message">{shareError}</div>}
          <form onSubmit={handleShareList} className="share-form">
            <input
              type="email"
              placeholder="Enter email to share with"
              value={shareEmail}
              onChange={(e) => setShareEmail(e.target.value)}
              required
              disabled={itemLoading}
            />
            <button type="submit" disabled={itemLoading}>
              {itemLoading ? 'Sharing...' : 'Share'}
            </button>
          </form>

          {localList.sharedWith && localList.sharedWith.length > 0 && (
            <div className="shared-with">
              <h3>Shared with:</h3>
              <ul className="shared-users-list">
                {localList.sharedWith.map(user => (
                  <li key={user._id} className="shared-user">
                    <span className="user-email">{user.email}</span>
                  </li>
                ))}
              </ul>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default ListDetail;