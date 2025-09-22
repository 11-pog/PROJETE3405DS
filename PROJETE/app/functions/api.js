import axios from 'axios'
import AsyncStorage from '@react-native-async-storage/async-storage'
import { router } from 'expo-router'

export const BASE_API_URL = "http://192.168.0.200:8000/api/"
axios.defaults.baseURL = BASE_API_URL

const api = axios.create({
    baseURL: BASE_API_URL
})

api.interceptors.request.use(
    async config => {
        console.log(`[API] Fazendo requisição ${config.method?.toUpperCase()} para: ${config.url}`);
        console.log(`[API] URL completa: ${config.baseURL}${config.url}`);
        
        const token = await AsyncStorage.getItem("access");

        if (!token) {
            // No access token -> redirect immediately
            alert("Sessão expirada. Faça login novamente.");
            setTimeout(() => router.push('/pages/login/Login'), 0)
            return Promise.reject({ message: "No access token found" });
        }

        config.headers["Authorization"] = `Bearer ${token}`;
        return config;
    },
    error => Promise.reject(error)
)

api.interceptors.response.use(
    response => response,
    async error => {
        const originalRequest = error.config

        if (error.response?.status === 401 && !originalRequest._retry) {
            originalRequest._retry = true
            const refreshToken = await AsyncStorage.getItem('refresh')

            console.log(refreshToken)

            if (refreshToken) {
                try {
                    const res = await axios.post(
                        BASE_API_URL + 'login/refresh/',
                        {
                            refresh: refreshToken
                        }
                    )

                    await AsyncStorage.setItem('access', res.data.access)
                    originalRequest.headers['Authorization'] = `Bearer ${res.data.access}`
                    return axios(originalRequest)
                } catch (err) {
                    await AsyncStorage.removeItem('access')
                    await AsyncStorage.removeItem('refresh')
                    alert('Sessão expirada. Faça login novamente.')
                    setTimeout(() => router.push('/pages/login/Login'), 0)
                    return Promise.reject(err)
                }
            } else {
                setTimeout(() => router.push('/pages/login/Login'), 0)
            }
        }

        return Promise.reject(error)
    }
)

export default api
