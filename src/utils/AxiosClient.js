import axios from "axios";

// Tạo một instance axios với baseURL
export const axiosClient = axios.create({
    baseURL: "https://backend-weather-nine.vercel.app",
});

// Thêm interceptor cho yêu cầu
axiosClient.interceptors.request.use(
    async (config) => {
        config.headers = {
            "Content-Type": "application/json",
            "Access-Control-Allow-Origin": "*",
            "Access-Control-Allow-Credentials": "true",
            "Access-Control-Max-Age": "1800",
            "Access-Control-Allow-Headers": "content-type",
            "Access-Control-Allow-Methods": "PUT, POST, GET, DELETE, PATCH, OPTIONS",
            ...config.headers,
        };
        return config;
    }
);

// Thêm interceptor cho phản hồi
axiosClient.interceptors.response.use(
    (response) => {
        if (response.status === 200 && response.data) {
            return response.data;
        }
        return response;
    },
    (error) => {
        console.log(error.message);
        return Promise.reject(error);  // Đảm bảo ném lỗi để xử lý sau này
    }
);
