import axios from "axios";
const baseURL = process.env.REACT_APP_API_URL; // Make sure your .env file is correctly set

// Create instances with consistent base URLs for each service
 
const product = axios.create({
  baseURL: `${baseURL}/products`,
});

// Create instances with consistent base URLs for each service
const login = axios.create({
  baseURL: `${baseURL}/auth`, // Ensure this is the correct endpoint for login
});
const signup = axios.create({
  baseURL: `${baseURL}/auth`,
});

// Generic request interceptor for all instances
const requestInterceptor = (req) => {
  // Optionally add authorization headers or custom logic
  // req.headers.Authorization = `Bearer ${localStorage.getItem("token") || ""}`;
  return req;
};

const errorInterceptor = (err) => {
  console.error("Request failed:", err);
  return Promise.reject(err);
};

// Apply interceptors for each axios instance

product.interceptors.request.use(requestInterceptor, errorInterceptor);

export { product };
signup.interceptors.request.use(requestInterceptor, errorInterceptor);
login.interceptors.request.use(requestInterceptor, errorInterceptor);

export { signup, login };
