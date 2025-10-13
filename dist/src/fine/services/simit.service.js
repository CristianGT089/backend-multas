//typescript
import axios from 'axios';
import { externalApiConfig } from '../../../clients/external/config.js';
export class SimitService {
    static instance;
    constructor() { }
    static getInstance() {
        if (!SimitService.instance) {
            SimitService.instance = new SimitService();
        }
        return SimitService.instance;
    }
    apiClient = axios.create({
        baseURL: externalApiConfig.simit.baseUrl,
        headers: {
            'Content-Type': 'application/json',
        },
        timeout: externalApiConfig.simit.timeout,
    });
    // Example: This is highly dependent on Apitude's actual API structure
    async getSIMITFineByPlate(plateNumber) {
        try {
            // IMPORTANT: The URL endpoint `/fines?plate=${plateNumber}` is a GUESS.
            // You MUST consult Apitude's SIMIT API documentation for correct endpoints and parameters.
            const response = await this.apiClient.get(`/your-simit-endpoint-for-fines?plate=${plateNumber}`);
            return response.data;
        }
        catch (error) {
            console.error(`Error fetching SIMIT fine for plate ${plateNumber}:`, error);
            throw error; // Or handle more gracefully
        }
    }
    async getSIMITDriverDetails(driverId) {
        try {
            // GUESS: Replace with actual endpoint
            const response = await this.apiClient.get(`/your-simit-endpoint-for-drivers?id=${driverId}`);
            return response.data;
        }
        catch (error) {
            console.error(`Error fetching SIMIT driver details for ${driverId}:`, error);
            throw error;
        }
    }
}
