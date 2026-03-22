import '../global.css';
import { Slot } from 'expo-router';
import { AuthProvider } from '../context/AuthContext';

export default function RootLayout() {
  return (
    // We wrap our entire app in the AuthProvider so every page can access the role!
    <AuthProvider>
      <Slot />
    </AuthProvider>
  );
}