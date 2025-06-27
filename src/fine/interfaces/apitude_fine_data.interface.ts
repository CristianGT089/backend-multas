export interface ApitudeFineData {
    id: string; // Their internal ID
    plate: string;
    date: string; // "YYYY-MM-DD"
    time: string; // "HH:MM:SS"
    location_desc: string;
    infraction_code: string; // e.g., "C29"
    infraction_details: string; // Description of infraction
    owner_dni: string;
    evidence_url?: string; // If they provide a URL to evidence
    // ... other fields as per Apitude API
    cost: number;
}