import {create} from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware'
import AsyncStorage from '@react-native-async-storage/async-storage';
// Optional: If you use React Query and want to clear its cache on logout
// import { queryClient } from '../path/to/your/queryClient'; // Adjust path

interface User {
    id: number;
    username: string;
    email: string;
    role?: string;
    // Add other user properties as needed
}

interface AuthState {
    user: User | null;
    token: string | null;
    setUser: (user: User | null) => void;
    setToken: (token: string | null) => void;
    logout: () => void;
}

export const useAuth = create(
    persist<AuthState>((set) => ({
        user: null,
        token: null,
        setUser: (user) => set({user}),
        setToken: (token) => set({token}),
        logout: () => {
            set({ user: null, token: null });
            // queryClient.clear(); // Optional: If using React Query, clear its cache
            console.log('User logged out, auth store reset.');
        },
    }), {
        name: 'auth-store',
        storage: createJSONStorage(() => AsyncStorage),
    })
);