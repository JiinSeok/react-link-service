import {createContext, useContext, useEffect, useState} from "react";
import axios from "../lib/axios";

const AuthContext = createContext({
  user: null,
  login: () => {},
  logout: () => {},
  updateUser: () => {},
});

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);

  async function getUser() {
    const res = await axios.get('/users/me');
    const nextUser = res.data;
    setUser(nextUser);
  }

  async function login({ email, password }) {
    await axios.post('/auth/login', { email, password })
    await getUser()
  }

  async function logout() {
    // 로그아웃 구현
  }

  async function updateUser(formData) {
    const res = await axios.patch('/users/me', formData);
    const nextUser = res.data;
    setUser(nextUser);
  }

  useEffect(() => {
    getUser()
  }, []);

  return (
    <AuthContext.Provider value={{
      user,
      login,
      logout,
      updateUser,
    }}>
      {children}
    </AuthContext.Provider>
  )
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within a AuthProvider');
  }
  return context;
}