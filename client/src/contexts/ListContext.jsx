import React, { createContext, useState, useContext, useCallback } from 'react';
import { getLists, getListById, createList, updateList, deleteList } from '../services/listService';

const ListContext = createContext();

export const ListProvider = ({ children }) => {
  const [lists, setLists] = useState([]);
  const [currentList, setCurrentList] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  // Fetch all lists
  const fetchLists = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const data = await getLists();
      setLists(data);
      return data;
    } catch (err) {
      setError(err.message || 'Failed to fetch lists');
      throw err;
    } finally {
      setLoading(false);
    }
  }, []);

  // Fetch a single list
  const fetchList = useCallback(async (listId) => {
    setLoading(true);
    setError(null);
    try {
      const data = await getListById(listId);
      setCurrentList(data);
      return data;
    } catch (err) {
      setError(err.message || 'Failed to fetch list');
      throw err;
    } finally {
      setLoading(false);
    }
  }, []);

  // Create a new list
  const addList = useCallback(async (listData) => {
    setLoading(true);
    setError(null);
    try {
      const newList = await createList(listData);
      setLists(prevLists => [...prevLists, newList]);
      return newList;
    } catch (err) {
      setError(err.message || 'Failed to create list');
      throw err;
    } finally {
      setLoading(false);
    }
  }, []);

  // Update a list
  const updateListData = useCallback(async (listId, listData) => {
    setLoading(true);
    setError(null);
    try {
      const updatedList = await updateList(listId, listData);
      
      // Update lists array
      setLists(prevLists => 
        prevLists.map(list => 
          list._id === listId ? updatedList : list
        )
      );
      
      // Update current list if it's the one being edited
      if (currentList && currentList._id === listId) {
        setCurrentList(updatedList);
      }
      
      return updatedList;
    } catch (err) {
      setError(err.message || 'Failed to update list');
      throw err;
    } finally {
      setLoading(false);
    }
  }, [currentList]);

  // Delete a list
  const removeList = useCallback(async (listId) => {
    setLoading(true);
    setError(null);
    try {
      await deleteList(listId);
      setLists(prevLists => prevLists.filter(list => list._id !== listId));
      
      // Clear current list if it's the one being deleted
      if (currentList && currentList._id === listId) {
        setCurrentList(null);
      }
    } catch (err) {
      setError(err.message || 'Failed to delete list');
      throw err;
    } finally {
      setLoading(false);
    }
  }, [currentList]);

  return (
    <ListContext.Provider
      value={{
        lists,
        currentList,
        loading,
        error,
        fetchLists,
        fetchList,
        addList,
        updateList: updateListData,
        deleteList: removeList,
        setCurrentList
      }}
    >
      {children}
    </ListContext.Provider>
  );
};

// Custom hook to use list context
export const useList = () => useContext(ListContext);