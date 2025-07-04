import axios from "axios";
const baseURL = process.env.REACT_APP_API_URL; // Make sure your .env file is correctly set

// Create instances with consistent base URLs for each service

const product = axios.create({
  baseURL: `${baseURL}/products`,
});
const user = axios.create({
  baseURL: `${baseURL}/users`,
});

// Create instances with consistent base URLs for each service
const login = axios.create({
  baseURL: `${baseURL}/auth`, // Ensure this is the correct endpoint for login
});
const signup = axios.create({
  baseURL: `${baseURL}/auth`,
});
const getquote = axios.create({
  baseURL: `${baseURL}/getquote`,
});
const category = axios.create({
  baseURL: `${baseURL}/category`,
});
const subcategory = axios.create({
  baseURL: `${baseURL}/subcategory`,
});
const aboutus = axios.create({
  baseURL: `${baseURL}/aboutus`,
});
const privacy = axios.create({
  baseURL: `${baseURL}/privacy`,
});
const contact = axios.create({
  baseURL: `${baseURL}/contactus`,
});
const terms = axios.create({
  baseURL: `${baseURL}/term`,
});
const faq = axios.create({
  baseURL: `${baseURL}/faq`,
});
const blogcategorys = axios.create({
  baseURL: `${baseURL}/blogcategory`,
});
const blogauthors = axios.create({
  baseURL: `${baseURL}/blogauthor`,
});
const blogss = axios.create({
  baseURL: `${baseURL}/blogs`,
});
const navitems = axios.create({
  baseURL: `${baseURL}/navitems`,
});
const portfolio = axios.create({
  baseURL: `${baseURL}/portfolio`,
});
const instantquot = axios.create({
  baseURL: `${baseURL}/instantquote`,
});
const newsletter = axios.create({
  baseURL: `${baseURL}/newsletter`,
});
const dieline = axios.create({
  baseURL: `${baseURL}/dielineform`,
});
const orders = axios.create({
  baseURL: `${baseURL}/order`,
});
const samplerequests = axios.create({
  baseURL: `${baseURL}/samplerequests`,
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
getquote.interceptors.request.use(requestInterceptor, errorInterceptor);
category.interceptors.request.use(requestInterceptor, errorInterceptor);
subcategory.interceptors.request.use(requestInterceptor, errorInterceptor);
aboutus.interceptors.request.use(requestInterceptor, errorInterceptor);
privacy.interceptors.request.use(requestInterceptor, errorInterceptor);
contact.interceptors.request.use(requestInterceptor, errorInterceptor);
terms.interceptors.request.use(requestInterceptor, errorInterceptor);
faq.interceptors.request.use(requestInterceptor, errorInterceptor);
blogcategorys.interceptors.request.use(requestInterceptor, errorInterceptor);
blogauthors.interceptors.request.use(requestInterceptor, errorInterceptor);
blogss.interceptors.request.use(requestInterceptor, errorInterceptor);
navitems.interceptors.request.use(requestInterceptor, errorInterceptor);
portfolio.interceptors.request.use(requestInterceptor, errorInterceptor);
instantquot.interceptors.request.use(requestInterceptor, errorInterceptor);
newsletter.interceptors.request.use(requestInterceptor, errorInterceptor);
dieline.interceptors.request.use(requestInterceptor, errorInterceptor);
orders.interceptors.request.use(requestInterceptor, errorInterceptor);
user.interceptors.request.use(requestInterceptor, errorInterceptor);
samplerequests.interceptors.request.use(requestInterceptor, errorInterceptor);

export {
  signup,
  login,
  getquote,
  category,
  subcategory,
  aboutus,
  privacy,
  contact,
  terms,
  faq,
  blogcategorys,
  blogauthors,
  blogss,
  navitems,
  portfolio,
  instantquot,
  newsletter,
  dieline,
  orders,
  user,
  samplerequests,
};
