import { RouterProvider } from 'react-router';
import { router } from './routes';
import { useEffect } from 'react';
import { ThemeProvider } from './context/ThemeContext';

export default function App() {
  useEffect(() => {
    document.documentElement.setAttribute('dir', 'rtl');
    document.documentElement.setAttribute('lang', 'ar');
  }, []);

  return (
    <ThemeProvider>
      <RouterProvider router={router} />
    </ThemeProvider>
  );
}
