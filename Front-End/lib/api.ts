import { BASE_API_URL } from '@/lib/constants';

async function fetchData(endpoint: string) {
    try {
        const response = await fetch(`${BASE_API_URL}${endpoint}`);
        if (!response.ok) {
            throw new Error(`${response.status} - Failed to fetch data from: ${BASE_API_URL}${endpoint}`);
        }
        return response.json();
    } catch (error) {
        console.error('500 - Failed to fetch data:', error);
        throw error;
    }
}

export {fetchData}