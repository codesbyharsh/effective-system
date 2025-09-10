import { createContext, useContext, useState, useEffect } from "react";

const AuthContext = createContext();

const DELIVERY_PARTNERS = [
  { id: 1, username: "rider1", password: "pass1", name: "Raj Sharma" },
  { id: 2, username: "rider2", password: "pass2", name: "Vikram Singh" },
  { id: 3, username: "rider3", password: "pass3", name: "Sunil Kumar" }
];

export const AuthProvider = ({ children }) => {
  const [currentUser, setCurrentUser] = useState(null);

  useEffect(() => {
    const saved = localStorage.getItem("rider");
    if (saved) setCurrentUser(JSON.parse(saved));
  }, []);

  const login = (user) => {
    setCurrentUser(user);
    localStorage.setItem("rider", JSON.stringify(user));
  };

  const logout = () => {
    setCurrentUser(null);
    localStorage.removeItem("rider");
  };

  return (
    <AuthContext.Provider value={{ currentUser, login, logout, deliveryPartners: DELIVERY_PARTNERS }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);
