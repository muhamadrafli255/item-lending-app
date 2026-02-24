import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { getProfile, loginUser, logoutUser, registerUser } from '../api/client';

interface User {
    id: string;
    name: string;
    email: string;
    image?: string | null;
    role: string;
    createdAt?: string;
}

interface AuthContextType {
    user: User | null;
    isLoading: boolean;
    isAuthenticated: boolean;
    login: (email: string, password: string) => Promise<void>;
    register: (name: string, email: string, password: string) => Promise<void>;
    logout: () => Promise<void>;
    refreshUser: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType>({} as AuthContextType);

export function AuthProvider({ children }: { children: React.ReactNode }) {
    const [user, setUser] = useState<User | null>(null);
    const [isLoading, setIsLoading] = useState(true);

    const refreshUser = useCallback(async () => {
        try {
            const profile = await getProfile();
            setUser(profile);
        } catch {
            setUser(null);
        }
    }, []);

    useEffect(() => {
        // Try to restore session on app start
        (async () => {
            try {
                const profile = await getProfile();
                setUser(profile);
            } catch {
                setUser(null);
            } finally {
                setIsLoading(false);
            }
        })();
    }, []);

    const login = async (email: string, password: string) => {
        setIsLoading(true);
        try {
            const res = await loginUser(email, password);
            // After login, fetch profile to get user data
            const profile = await getProfile();
            setUser(profile);
        } catch (error: any) {
            const message = error?.response?.data?.message || error?.message || 'Login gagal';
            throw new Error(message);
        } finally {
            setIsLoading(false);
        }
    };

    const register = async (name: string, email: string, password: string) => {
        try {
            await registerUser(name, email, password);
        } catch (error: any) {
            const message = error?.response?.data?.message || error?.message || 'Registrasi gagal';
            throw new Error(message);
        }
    };

    const logout = async () => {
        await logoutUser();
        setUser(null);
    };

    return (
        <AuthContext.Provider
            value={{
                user,
                isLoading,
                isAuthenticated: !!user,
                login,
                register,
                logout,
                refreshUser,
            }}
        >
            {children}
        </AuthContext.Provider>
    );
}

export function useAuth() {
    const context = useContext(AuthContext);
    if (!context) {
        throw new Error('useAuth must be used within an AuthProvider');
    }
    return context;
}
