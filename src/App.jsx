import { useState, useEffect } from "react";
import {
  BrowserRouter as Router,
  Routes,
  Route,
  Navigate,
} from "react-router-dom";
import Login from "./components/Login";
import Signup from "./components/Signup";
import ResetPassword from "./components/ResetPassword";
import Logo from "../src/images/GreenListLogoSVG.svg";
import axios from "axios";
import api from "./api";

function App() {
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [isSignupMode, setIsSignupMode] = useState(true);
  const [toast, setToast] = useState({ show: false, message: "" });
  const [items, setItems] = useState([]);
  const [newItem, setNewItem] = useState("");
  const [editingId, setEditingId] = useState(null);
  const [currentUser, setCurrentUser] = useState(null);
  const [currentList, setCurrentList] = useState(null);
  const [isLoading, setIsLoading] = useState(false);

  // Check if user is logged in on component mount
  // Vamos modificar o useEffect que verifica se o usuário está logado
  useEffect(() => {
    const token = localStorage.getItem("token");
    const user = localStorage.getItem("user");

    if (token && user) {
      try {
        // Adicione um try/catch para evitar erros de JSON inválido
        const parsedUser = JSON.parse(user);
        setIsLoggedIn(true);
        setCurrentUser(parsedUser);
      } catch (error) {
        // Se houver um erro ao fazer parse do JSON, limpe o localStorage
        console.error("Erro ao analisar dados do usuário:", error);
        localStorage.removeItem("token");
        localStorage.removeItem("user");
      }
    }
  }, []);

  // Fetch or create default list when user logs in
  useEffect(() => {
    if (isLoggedIn && currentUser) {
      fetchUserLists();
    }
  }, [isLoggedIn, currentUser]);

  // Fetch user's lists from the backend
  const fetchUserLists = async () => {
    setIsLoading(true);
    try {
      // Using the API utility instead of axios directly
      const response = await api.get("/api/lists");

      if (response.data.length > 0) {
        setCurrentList(response.data[0]);
        fetchItems(response.data[0]._id);
      } else {
        // Create a default list if user has no lists
        const newListResponse = await api.post("/api/lists", {
          name: "Minha Lista de Compras",
        });
        setCurrentList(newListResponse.data);
        setItems([]);
      }
    } catch (error) {
      console.error("Error fetching lists:", error);
      showToast("Erro ao carregar listas", "error");
    } finally {
      setIsLoading(false);
    }
  };

  // Fetch items for a specific list
  const fetchItems = async (listId) => {
    if (!listId) return;

    try {
      // Using the API utility
      const response = await api.get(`/api/lists/${listId}/items`);

      // Transform the items to match your frontend structure
      const transformedItems = response.data.map((item) => ({
        id: item._id,
        text: item.name,
        completed: item.completed,
      }));

      setItems(transformedItems);
    } catch (error) {
      console.error("Error fetching items:", error);
      // Don't show error toast here as it might be normal for a new list
      setItems([]);
    }
  };

  // Adicionar um novo item à lista atual
  const addItem = async (e) => {
    e.preventDefault();
    if (!newItem.trim() || !currentList) return;

    try {
      const response = await api.post(`/api/lists/${currentList._id}/items`, {
        name: newItem.trim(),
        quantity: 1,
        unit: "unit",
        completed: false,
      });

      // Adicionar o novo item ao nosso estado
      const newItemData = {
        id: response.data._id,
        text: response.data.name,
        completed: response.data.completed,
      };

      setItems([...items, newItemData]);
      setNewItem("");
    } catch (error) {
      console.error("Error adding item:", error);
      showToast("Erro ao adicionar item", "error");
    }
  };

  // Toggle item completion status
  const toggleItem = async (id) => {
    try {
      const item = items.find((item) => item.id === id);
      if (!item || !currentList) return;

      await api.put(`/api/lists/${currentList._id}/items/${id}`, {
        completed: !item.completed,
      });

      // Update local state
      setItems(
        items.map((item) =>
          item.id === id ? { ...item, completed: !item.completed } : item
        )
      );
    } catch (error) {
      console.error("Error toggling item:", error);
      showToast("Erro ao atualizar item", "error");
    }
  };

  // Remove an item from the list
  const removeItem = async (id) => {
    try {
      const itemToRemove = items.find((item) => item.id === id);
      if (!itemToRemove || !currentList) return;

      // Using the API utility
      await api.delete(`/api/lists/${currentList._id}/items/${id}`);

      // Update local state
      setItems(items.filter((item) => item.id !== id));
      showToast(`Item "${itemToRemove.text}" foi excluído`, "success");
    } catch (error) {
      console.error("Error removing item:", error);
      showToast("Erro ao remover item", "error");
    }
  };

  // Update an existing item
  const updateItem = async (id) => {
    if (!newItem.trim() || !currentList) return;

    try {
      // Using the API utility
      await api.put(`/api/lists/${currentList._id}/items/${id}`, {
        name: newItem.trim(),
      });

      // Update local state
      setItems(
        items.map((item) =>
          item.id === id ? { ...item, text: newItem.trim() } : item
        )
      );
      setEditingId(null);
      setNewItem("");
    } catch (error) {
      console.error("Error updating item:", error);
      showToast("Erro ao atualizar item", "error");
    }
  };

  // Start editing an item
  const startEditing = (id, text) => {
    setEditingId(id);
    setNewItem(text);
  };

  // Clear the entire list
  const clearList = async () => {
    if (!currentList) return;

    if (window.confirm("Tem certeza de que deseja limpar toda a lista?")) {
      try {
        // Delete each item individually using the API utility
        for (const item of items) {
          await api.delete(`/api/lists/${currentList._id}/items/${item.id}`);
        }

        setItems([]);
      } catch (error) {
        console.error("Error clearing list:", error);
        showToast("Erro ao limpar lista", "error");
      }
    }
  };

  // Handle user logout
  const handleLogout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("user");
    setIsLoggedIn(false);
    setCurrentUser(null);
    setCurrentList(null);
    setItems([]);
  };

  // Show toast message
  const showToast = (message, type = "success") => {
    setToast({
      show: true,
      message,
      type,
    });
    setTimeout(
      () => setToast({ show: false, message: "", type: "success" }),
      3000
    );
  };

  // Add a function to render custom checkbox
  const renderCheckbox = (isChecked, onChange) => {
    return (
      <div className="relative flex items-center justify-center">
        <input
          type="checkbox"
          checked={isChecked}
          onChange={onChange}
          className="absolute opacity-0 w-5 h-5 cursor-pointer z-10"
        />
        <div
          className={`w-5 h-5 rounded-lg border ${
            isChecked
              ? "bg-[#3D9A59] border-[#3D9A59]"
              : "bg-white border-gray-300"
          } flex items-center justify-center`}
        >
          {isChecked && (
            <svg
              width="10"
              height="8"
              viewBox="0 0 10 8"
              fill="none"
              xmlns="http://www.w3.org/2000/svg"
            >
              <path
                d="M1 4L3.5 6.5L9 1"
                stroke="white"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
            </svg>
          )}
        </div>
      </div>
    );
  };

  return (
    <Router>
      <Routes>
        <Route path="/reset-password/:token" element={<ResetPassword />} />
        <Route
          path="/"
          element={
            !isLoggedIn ? (
              isSignupMode ? (
                <Signup
                  setIsLoggedIn={setIsLoggedIn}
                  switchToLogin={() => setIsSignupMode(false)}
                />
              ) : (
                <Login
                  setIsLoggedIn={setIsLoggedIn}
                  switchToSignup={() => setIsSignupMode(true)}
                />
              )
            ) : (
              // Wrap everything in a single parent div
              <div className="min-h-screen bg-gray-100 relative">
                {/* Header Section */}
                <div className="bg-gray-100 p-4">
                  <div className="flex items-center justify-center mb-4">
                    <img
                      src={Logo}
                      alt="GreenList Logo"
                      className="h-12 w-12"
                    />
                    <h1 className="text-3xl font-bold text-gray-700 ml-2">
                      GreenList
                    </h1>
                  </div>

                  <div className="max-w-2xl mx-auto">
                    <div className="flex justify-between items-center mb-2">
                      <button
                        className="text-green-600 flex items-center"
                        onClick={handleLogout}
                      >
                        <span className="mr-1">←</span> Sair
                      </button>
                      {currentUser && (
                        <span className="text-gray-600">
                          Olá, {currentUser.name}
                        </span>
                      )}
                    </div>
                    <h2 className="text-2xl font-bold text-gray-800 mb-4">
                      {currentList ? currentList.name : "Carregando..."}
                    </h2>
                  </div>
                </div>
                {/* End Header Section */}

                {toast.show && (
                  <div
                    className={`fixed bottom-4 left-1/2 transform -translate-x-1/2 ${
                      toast.type === "error" ? "bg-red-500" : "bg-green-500"
                    } text-white px-6 py-3 rounded-lg shadow-lg z-50 animate-fade-in flex items-center gap-2`}
                  >
                    <span>{toast.message}</span>
                    <button
                      onClick={() =>
                        setToast({ show: false, message: "", type: "success" })
                      }
                      className="ml-2 text-white hover:text-gray-200"
                    >
                      ✕
                    </button>
                  </div>
                )}

                {isLoading ? (
                  <div className="w-full max-w-2xl mx-auto bg-white rounded-lg shadow-lg p-6 text-center">
                    <p>Carregando...</p>
                  </div>
                ) : (
                  <div className="w-full max-w-2xl mx-auto bg-white rounded-lg shadow-lg p-4 sm:p-6 animate-fade-in">
                    <form
                      onSubmit={
                        editingId
                          ? (e) => {
                              e.preventDefault();
                              updateItem(editingId);
                            }
                          : addItem
                      }
                      className="mb-4 sm:mb-6"
                    >
                      <div className="flex flex-col sm:flex-row gap-2">
                        <input
                          type="text"
                          value={newItem}
                          onChange={(e) => setNewItem(e.target.value)}
                          placeholder="Adicione um item..."
                          className="w-full px-3 sm:px-4 py-2 border rounded-lg focus:outline-none focus:border-[#3D9A59] transition-colors text-sm sm:text-base"
                        />

                        <button
                          type="submit"
                          className="w-full sm:w-auto px-4 sm:px-6 py-2 bg-[#3D9A59] text-white rounded-lg hover:bg-[#2d7342] transition-colors text-sm sm:text-base whitespace-nowrap"
                        >
                          {editingId ? "Atualizar" : "Adicionar item"}
                        </button>
                      </div>
                    </form>

                    {items.length === 0 ? (
                      <p className="text-center text-gray-500 py-4">
                        Sua lista está vazia. Adicione alguns itens!
                      </p>
                    ) : (
                      <ul className="space-y-2">
                        {items.map((item) => (
                          <li
                            key={item.id}
                            className={`flex items-center gap-2 p-2 sm:p-3 bg-gray-50 rounded-lg animate-slide-in ${
                              item.completed ? "opacity-75" : ""
                            }`}
                          >
                            {renderCheckbox(item.completed, () =>
                              toggleItem(item.id)
                            )}
                            <span
                              className={`flex-1 text-sm sm:text-base ${
                                item.completed
                                  ? "line-through text-gray-500"
                                  : "text-[#000000]"
                              }`}
                            >
                              {item.text}
                            </span>
                            <button
                              onClick={() => startEditing(item.id, item.text)}
                              className="p-1.5 sm:p-2 text-secondary- hover:text-primary transition-colors"
                            >
                              ✏️
                            </button>
                            <button
                              onClick={() => removeItem(item.id)}
                              className="p-1.5 sm:p-2 text-danger hover:text-red-600 transition-colors"
                            >
                              🗑️
                            </button>
                          </li>
                        ))}
                      </ul>
                    )}

                    {items.length > 0 && (
                      <div className="mt-4 sm:mt-6 text-center">
                        <button
                          onClick={clearList}
                          className="px-3 sm:px-4 py-1.5 sm:py-2 text-xs sm:text-sm text-danger bg-[#3D9A59] rounded-lg transition-colors"
                        >
                          <span className="text-[#ffffff]">Limpar lista</span>
                        </button>
                      </div>
                    )}
                  </div>
                )}
              </div>
            )
          }
        />
      </Routes>
    </Router>
  ); // End of App function
}
export default App;
