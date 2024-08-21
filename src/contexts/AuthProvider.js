import {createContext, useCallback, useContext, useEffect, useState} from 'react';
import axios from '../lib/axios';
import { useNavigate } from 'react-router-dom';

const AuthContext = createContext({
  user: null,
  isPending: false,
  login: () => {},
  logout: () => {},
  updateMe: () => {},
});

export function AuthProvider({ children }) {
  const [values, setValues] = useState({
    user: null,
    isPending: true,
  });

  const getMe = useCallback( async () => {
    setValues((prevValues) => ({
      user: prevValues.user,
      isPending: true,
    }));
    let nextUser = null; // 로그인하지 않은 경우 null
    try {
      const res = await axios.get('/users/me');
      nextUser = res.data;
    } catch (error) {
      alert('로그인이 필요합니다.');
    } finally {
      setValues(() => ({
        user: nextUser,
        isPending: false,
      }));
    }
  }, []);

  async function login({ email, password }) {
    try {
      await axios.post('/auth/login', { email, password });
      await getMe();
    } catch (error) {
      console.error('Login failed', error)
      alert('로그인에 실패했습니다.');
    }
  }

  async function logout() {
    try {
      await axios.delete('/auth/logout');
      setValues((prevValues) => ({
        isPending: prevValues.isPending,
        user: null,
      }));
    } catch (error) {
      console.error('Logout failed', error)
      alert('로그아웃에 실패했습니다.');
    }
  }

  async function updateMe(formData) {
    try {
      const res = await axios.patch('/users/me', formData);
      const nextUser = res.data;
      setValues((prevValues) => ({
        isPending: prevValues.isPending,
        user: nextUser,
      }));
    } catch (error) {
      console.error('Update failed', error)
      alert('회원정보 수정에 실패했습니다.');
    }
  }

  useEffect(() => {
    getMe().then();
  }, [getMe]);

  return (
    <AuthContext.Provider
      value={{
        user: values.user,
        isPending: values.isPending,
        login,
        logout,
        updateMe,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}


export function useAuth(required) {
  const context = useContext(AuthContext);
  const navigate = useNavigate();

  if (!context) {
    throw new Error('반드시 AuthProvider 안에서 사용해야 합니다.');
  }

  useEffect(() => {
    if (required && !context.user && !context.isPending) {
      navigate('/login');
    }
  }, [context.user, context.isPending, navigate, required]);

  return context;
}
