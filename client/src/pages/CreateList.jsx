import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { createList } from '../services/listService';

const CreateList = () => {
  const [name, setName] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    
    try {
      const newList = await createList({ name });
      navigate(`/lists/${newList._id}`);
    } catch (err) {
      setError(err.message || 'Failed to create list');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="create-list-container">
      <h1>Create New Shopping List</h1>
      {error && <div className="error-message">{error}</div>}
      
      <form onSubmit={handleSubmit} className="list-form">
        <div className="form-group">
          <label htmlFor="name">List Name</label>
          <input
            type="text"
            id="name"
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder="e.g., Weekly Groceries"
            required
          />
        </div>
        
        <div className="form-actions">
          <Link to="/dashboard" className="cancel-btn">Cancel</Link>
          <button type="submit" disabled={loading} className="submit-btn">
            {loading ? 'Creating...' : 'Create List'}
          </button>
        </div>
      </form>
    </div>
  );
};

export default CreateList;