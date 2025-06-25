interface ApitudeFineData {
    id: string;
    plate: string;
    date: string;
    time: string;
    location_desc: string;
    infraction_code: string;
    infraction_details: string;
    owner_dni: string;
    evidence_url?: string;
    cost: number;
}
declare class ApitudeService {
    private static instance;
    private constructor();
    static getInstance(): ApitudeService;
    fetchFineFromApitude: (plateNumber: string, date: string) => Promise<ApitudeFineData | null>;
}
export declare const apitudeService: ApitudeService;
export {};
