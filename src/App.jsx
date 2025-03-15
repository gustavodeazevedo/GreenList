import { useState, useEffect } from "react";
import Login from "./components/Login";

function App() {
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [toast, setToast] = useState({ show: false, message: "" });
  const [items, setItems] = useState(() => {
    const savedItems = localStorage.getItem("shoppingList");
    return savedItems ? JSON.parse(savedItems) : [];
  });
  const [newItem, setNewItem] = useState("");
  const [editingId, setEditingId] = useState(null);

  useEffect(() => {
    localStorage.setItem("shoppingList", JSON.stringify(items));
  }, [items]);

  const addItem = (e) => {
    e.preventDefault();
    if (!newItem.trim()) return;

    const item = {
      id: Date.now(),
      text: newItem.trim(),
      completed: false,
    };

    setItems([...items, item]);
    setNewItem("");
  };

  const toggleItem = (id) => {
    setItems(
      items.map((item) =>
        item.id === id ? { ...item, completed: !item.completed } : item
      )
    );
  };

  const removeItem = (id) => {
    const itemToRemove = items.find((item) => item.id === id);
    if (itemToRemove) {
      setItems(items.filter((item) => item.id !== id));
      setToast({
        show: true,
        message: `Item "${itemToRemove.text}" foi excluído`,
      });
      setTimeout(() => setToast({ show: false, message: "" }), 3000);
    }
  };

  const startEditing = (id, text) => {
    setEditingId(id);
    setNewItem(text);
  };

  const updateItem = (id) => {
    if (!newItem.trim()) return;
    setItems(
      items.map((item) =>
        item.id === id ? { ...item, text: newItem.trim() } : item
      )
    );
    setEditingId(null);
    setNewItem("");
  };

  const clearList = () => {
    if (window.confirm("Are you sure you want to clear the entire list?")) {
      setItems([]);
    }
  };

  return !isLoggedIn ? (
    <Login setIsLoggedIn={setIsLoggedIn} />
  ) : (
    <div className="min-h-screen bg-background p-4 sm:p-6 md:p-8 lg:p-10 relative">
      {toast.show && (
        <div className="fixed bottom-4 left-1/2 transform -translate-x-1/2 bg-red-500 text-white px-6 py-3 rounded-lg shadow-lg z-50 animate-fade-in flex items-center gap-2">
          <span>{toast.message}</span>
          <button
            onClick={() => setToast({ show: false, message: "" })}
            className="ml-2 text-white hover:text-gray-200"
          >
            ✕
          </button>
        </div>
      )}
      <div className="w-full max-w-2xl mx-auto bg-white rounded-lg shadow-lg p-4 sm:p-6 animate-fade-in">
        <h1 className="text-2xl sm:text-3xl font-bold text-[#000000] mb-4 sm:mb-6 text-center">
          Compras da semana
        </h1>

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
              className="w-full px-3 sm:px-4 py-2 border rounded-lg focus:outline-none focus:border-primary transition-colors text-sm sm:text-base"
            />

            {/* Botão de adicionar item */}
            <button
              type="submit"
              className="w-full sm:w-auto px-4 sm:px-6 py-2 bg-[#3D9A59] text-white rounded-lg hover:bg[#0e3f1d] transition-colors text-sm sm:text-base whitespace-nowrap"
            >
              {editingId ? "Update" : "Adicionar item"}
            </button>
          </div>
        </form>

        <ul className="space-y-2">
          {items.map((item) => (
            <li
              key={item.id}
              className={`flex items-center gap-2 p-2 sm:p-3 bg-gray-50 rounded-lg animate-slide-in ${
                item.completed ? "opacity-75" : ""
              }`}
            >
              <input
                type="checkbox"
                checked={item.completed}
                onChange={() => toggleItem(item.id)}
                className="w-4 h-4 sm:w-5 sm:h-5 text-primary rounded focus:ring-primary"
              />
              <span
                className={`flex-1 text-sm sm:text-base ${
                  item.completed
                    ? "line-through text-gray-500"
                    : "text-gray-800"
                }`}
              >
                {item.text}
              </span>
              <button
                onClick={() => startEditing(item.id, item.text)}
                className="p-1.5 sm:p-2 text-secondary hover:text-primary transition-colors"
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

        {items.length > 0 && (
          <div className="mt-4 sm:mt-6 text-center">
            <button
              onClick={clearList}
              className="px-3 sm:px-4 py-1.5 sm:py-2 text-xs sm:text-sm text-danger bg-[#0e3f1d] rounded-lg transition-colors"
            >
              <span className="text-[#ffffff]">Limpar lista</span>
            </button>
          </div>
        )}
      </div>
    </div>
  );
}

export default App;
