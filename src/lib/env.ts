const env = {
  VITE_API_URL: import.meta.env.VITE_API_URL || 'http://localhost:3000/api',
  VITE_APP_NAME: import.meta.env.VITE_APP_NAME || 'Shadcn Dashboard',
} as const;

export default env;
