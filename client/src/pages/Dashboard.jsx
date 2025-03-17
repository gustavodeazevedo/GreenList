import React, { useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { useList } from '../contexts/ListContext';

const Dashboard = () => {
  const { user, logout } = useAuth();
  const { lists, loading, error, fetchLists, deleteList } = useList();

  useEffect(() => {
    fetchLists();
  }, [fetchLists]);

  const handleDeleteList = async (id) => {
    if (window.confirm('Are you sure you want to delete this list?')) {
      try {
        await deleteList(id);
      } catch (err) {
        console.error(err);
      }
    }
  };

  return (
    <div className="dashboard-container">
      <header className="dashboard-header">
        <h1>My Shopping Lists</h1>
        <div className="user-controls">
          <span>Welcome, {user?.name}</span>
          <button onClick={logout} className="logout-btn">Logout</button>
        </div>
      </header>

      {error && <div className="error-message">{error}</div>}

      <div className="dashboard-actions">
        <Link to="/lists/create" className="create-list-btn">
          Create New List
        </Link>
      </div>

      {loading ? (
        <div className="loading">Loading your lists...</div>
      ) : (
        <div className="lists-container">
          {lists.length === 0 ? (
            <div className="no-lists">
              <p>You don't have any shopping lists yet.</p>
              <Link to="/lists/create">Create your first list</Link>
            </div>
          ) : (
            lists.map(list => (
              <div key={list._id} className="list-card">
                <h3>{list.name}</h3>
                <p>{list.items.length} items</p>
                <div className="list-actions">
                  <Link to={`/lists/${list._id}`} className="view-btn">
                    View
                  </Link>
                  <Link to={`/lists/${list._id}/edit`} className="edit-btn">
                    Edit
                  </Link>
                  <button 
                    onClick={() => handleDeleteList(list._id)}
                    className="delete-btn"
                  >
                    Delete
                  </button>
                </div>
              </div>
            ))
          )}
        </div>
      )}
    </div>
  );
};

export default Dashboard;