import React, { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { getListById, updateList } from '../services/listService';

const EditList = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [name, setName] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    const fetchList = async () => {
      try {
        const list = await getListById(id);
        setName(list.name);
        setError('');
      } catch (err) {
        setError('Failed to fetch list details');
        console.error(err);
      } finally {
        setLoading(false);
      }
    };

    fetchList();
  }, [id]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setSaving(true);
    
    try {
      await updateList(id, { name });
      navigate(`/lists/${id}`);
    } catch (err) {
      setError(err.message || 'Failed to update list');
      console.error(err);
    } finally {
      setSaving(false);
    }
  };

  if (loading) return <div className="loading">Loading list details...</div>;

  return (
    <div className="edit-list-container">
      <h1>Edit Shopping List</h1>
      {error && <div className="error-message">{error}</div>}
      
      <form onSubmit={handleSubmit} className="list-form">
        <div className="form-group">
          <label htmlFor="name">List Name</label>
          <input
            type="text"
            id="name"
            value={name}
            onChange={(e) => setName(e.target.value)}
            required
          />
        </div>
        
        <div className="form-actions">
          <Link to={`/lists/${id}`} className="cancel-btn">Cancel</Link>
          <button type="submit" disabled={saving} className="submit-btn">
            {saving ? 'Saving...' : 'Save Changes'}
          </button>
        </div>
      </form>
    </div>
  );
};

export default EditList;