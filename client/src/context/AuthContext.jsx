import React, { createContext, useContext, useState, useEffect } from 'react';
import api from '../services/api';

const AuthContext = createContext();

export const useAuth = () => {
    return useContext(AuthContext);
};

export const AuthProvider = ({ children }) => {
    const [currentUser, setCurrentUser] = useState(null);
    const [token, setToken] = useState(localStorage.getItem('token'));
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchUser = async () => {
            const storedToken = localStorage.getItem('token');
            // Check for valid token string
            if (storedToken && storedToken !== 'undefined' && storedToken !== 'null') {
                setToken(storedToken);
                try {
                    // If using /me endpoint, fetch user details
                    const response = await api.get('/auth/me');
                    setCurrentUser(response.data);
                } catch (error) {
                    console.error("Failed to fetch user:", error);
                    localStorage.removeItem('token');
                    setToken(null);
                    setCurrentUser(null);
                }
            } else {
                localStorage.removeItem('token');
                setToken(null);
            }
            setLoading(false);
        };

        fetchUser();
    }, []);

    const login = async (email, password) => {
        try {
            const response = await api.post('/auth/login', { email, password });
            const { token, ...userData } = response.data;

            if (token) {
                localStorage.setItem('token', token);
                setToken(token);
                setCurrentUser(userData); // Includes role
                return response.data;
            } else {
                throw new Error('No token received');
            }
        } catch (error) {
            throw error.response?.data?.message || 'Login failed';
        }
    };

    const signup = async (name, email, password, role) => {
        try {
            const response = await api.post('/auth/register', { name, email, password, role });
            const { token, ...userData } = response.data;

            if (token) {
                localStorage.setItem('token', token);
                setToken(token);
                setCurrentUser(userData);
                return response.data;
            } else {
                throw new Error('No token received');
            }
        } catch (error) {
            console.error("Signup error:", error); // Debugging
            throw error.response?.data?.message || 'Signup failed';
        }
    };

    const logout = () => {
        localStorage.removeItem('token');
        setToken(null);
        setCurrentUser(null);
        // Optionally call APIs to invalidate session on backend
    };

    const value = {
        currentUser,
        token,
        login,
        signup,
        logout,
        loading
    };

    return (
        <AuthContext.Provider value={value}>
            {!loading && children}
        </AuthContext.Provider>
    );
};
