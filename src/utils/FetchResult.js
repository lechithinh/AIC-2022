import axios from "axios";

const FetchResult = async (url, method, data = "") => {
  return await axios({
    url: url,
    method: method,
    data: data,
  });
};

export { FetchResult };
