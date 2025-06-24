// client/src/context/AuthContext.js
import { createContext, useContext, useState } from 'react';

export const AuthContext = createContext(); // Fixed: Export AuthContext directly

export function AuthProvider({ children }) {
  const [currentUser, setCurrentUser] = useState(null);

  const mockLogin = (role) => {
    setCurrentUser({
      id: 1,
      name: "Admin User",
      role: role || 'admin'
    });
  };

  const logout = () => {
    setCurrentUser(null);
  };

  return (
    <AuthContext.Provider value={{ currentUser, mockLogin, logout }}>
      {children}
    </AuthContext.Provider>
  );
}

export const useAuth = () => useContext(AuthContext);
