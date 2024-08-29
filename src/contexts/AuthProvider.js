import { createContext, useContext, useEffect, useState } from "react";
import axios from "../lib/axios";
import { useNavigate } from "react-router-dom";

const AuthContext = createContext({
  user: null,
  isPending: true,
  login: () => {},
  logout: () => {},
  updateUser: () => {},
});

export function AuthProvider({ children }) {
  const [userValues, setUserValues] = useState({
    user: null,
    isPending: true,
  });

  async function getUser() {
    setUserValues((prevUserValues) => ({
      ...prevUserValues,
      isPending: true,
    }))
    let nextUser
    try {
      const res = await axios.get('/users/me');
      nextUser = res.data;
    } catch (error) {
      throw new Error(error.response.data);
    } finally {
      setUserValues((prevUserValues) => ({
        ...prevUserValues,
        user: nextUser,
        isPending: false,
      }))
    }
  }

  async function updateUser(formData) {
    try {
      const res = await axios.patch('/users/me', formData);
      const nextUser = res.data;
      setUserValues((prevUserValues) => ({
        ...prevUserValues,
        user: nextUser,
      }))
    } catch (error) {
      throw new Error(error.response.data);
    }}

  async function login({ email, password }) {
    try {
      await axios.post('/auth/login', { email, password })
      await getUser()
    } catch (error) {
      throw new Error(error.response.data);
    }
  }

  async function logout() {
    await axios.delete('/auth/logout')
    setUserValues((prevUserValues) => ({
      ...prevUserValues,
      user: null,
    }))
  }

  useEffect(() => {
    getUser()
  }, []);

  return (
    <AuthContext.Provider value={{
      user: userValues.user,
      isPending: userValues.isPending,
      login,
      logout,
      updateUser,
    }}>
      {children}
    </AuthContext.Provider>
  )
}

export function useAuth(required) {
  const authContextReturn = useContext(AuthContext);
  const navigate = useNavigate();

  if (!authContextReturn) {
    throw new Error('useAuth must be used within a AuthProvider');
  }

  useEffect(() => {
    if (required && !authContextReturn.user && !authContextReturn.isPending) {
      navigate('/login')
    }
  }, [authContextReturn.user, authContextReturn.isPending, navigate, required]);

  return authContextReturn;
}