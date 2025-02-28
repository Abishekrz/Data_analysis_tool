import axios from "axios";

export const uploadFile = async (file) => {
  const formData = new FormData();
  formData.append("file", file);
  return await axios.post("http://localhost:5000/upload", formData);
};
