import { configureStore } from "@reduxjs/toolkit";
import { api } from "./api";
import userSlice from "./slices/userSlice";
import jobSlice from "./slices/jobSlice";
import companySlice from "./slices/companySlice";
import { jobsApi } from "./api/jobsApi";
import { companyApi } from "./api/companyApi";
import { applicationsApi } from "./api/applicationsApi";
import { postApi } from "./api/postApi";

const store = configureStore({
  reducer: {
    user: userSlice,
    job: jobSlice,
    company: companySlice,
    [api.reducerPath]: api.reducer,
    [jobsApi.reducerPath]: jobsApi.reducer,
    [companyApi.reducerPath]: companyApi.reducer,
    [applicationsApi.reducerPath]: applicationsApi.reducer,
    [postApi.reducerPath]: postApi.reducer,
  },
  middleware: (getDefaultMiddleware) =>
    getDefaultMiddleware()
      .concat(api.middleware)
      .concat(jobsApi.middleware)
      .concat(companyApi.middleware)
      .concat(applicationsApi.middleware)
      .concat(postApi.middleware),
});

export default store;
