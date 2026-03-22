import { createContext, useState, useContext, useEffect } from 'react';
import axios from 'axios';

const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
    const initialUser = () => {
        const storedUser = localStorage.getItem('user');
        return storedUser ? JSON.parse(storedUser) : null;
    };

    const [user, setUser] = useState(initialUser);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        // Check for token on load
        const token = localStorage.getItem('token');

        if (token && user) {
            // Set default header for future requests
            axios.defaults.headers.common['Authorization'] = `Bearer ${token}`;
        }

        // Use a timeout to avoid synchronous state updates during render
        setTimeout(() => setLoading(false), 0);
    }, [user]);

    const login = async (email, password) => {
        try {
            const response = await axios.post('http://localhost:3000/api/auth/login', { email, password });
            const { token, user } = response.data;

            localStorage.setItem('token', token);
            localStorage.setItem('user', JSON.stringify(user));
            axios.defaults.headers.common['Authorization'] = `Bearer ${token}`;
            setUser(user);
            return user;
        } catch (error) {
            console.error('Login failed', error);
            throw error;
        }
    };

    const register = async (name, email, password, role) => {
        try {
            const response = await axios.post('http://localhost:3000/api/auth/register', { name, email, password, role });
            const { token, user } = response.data;

            localStorage.setItem('token', token);
            localStorage.setItem('user', JSON.stringify(user));
            axios.defaults.headers.common['Authorization'] = `Bearer ${token}`;
            setUser(user);
            return user;
        } catch (error) {
            console.error('Registration failed', error);
            throw error;
        }
    };

    const logout = () => {
        localStorage.removeItem('token');
        localStorage.removeItem('user');
        delete axios.defaults.headers.common['Authorization'];
        setUser(null);
    };

    return (
        <AuthContext.Provider value={{ user, login, register, logout, loading }}>
            {children}
        </AuthContext.Provider>
    );
};

export const useAuth = () => useContext(AuthContext);
