import { callApiSecure } from "./apiCall";

export const getProfile = async () => {
    const data = await callApiSecure(`${process.env.NEXT_PUBLIC_API_URL}/user/profile`, {
        method: 'GET',
        headers: {
            'Content-Type': 'application/json'
        }
    })
    return data;
}