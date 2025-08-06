import { createApi, fetchBaseQuery } from '@reduxjs/toolkit/query/react';

export const api = createApi({
  baseQuery: fetchBaseQuery({
    baseUrl: import.meta.env.VITE_API_BASE_URL || 'http://localhost:8000/api/v1',
    credentials: 'include',
  }),
  tagTypes: ['User', 'Jobs', 'Companies', 'Posts'],
  endpoints: () => ({}),
});
