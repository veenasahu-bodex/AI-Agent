import axios from "axios";

const API = axios.create({
  baseURL: "https://ai-agent-ylzp.onrender.com/api",
  headers: {
    "Content-Type": "application/json",
  },
});

export const searchJobs = async ({
  keyword,
  location = "India",
  results_wanted = 20,
  hours_old = 72,
  remote = false,
}) => {
  const response = await API.post("/jobs/search", {
    keyword,
    location,
    results_wanted,
    hours_old,
    remote,
  });

  return response.data;
};

export default API;