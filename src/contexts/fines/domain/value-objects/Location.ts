import { DomainException } from '../../../../shared/index.js';

/**
 * Value Object: Location
 * Representa una ubicación geográfica (dirección + coordenadas opcionales)
 */
export class Location {
    private constructor(
        public readonly address: string,
        public readonly latitude?: number,
        public readonly longitude?: number
    ) {
        this.validate();
    }

    private validate(): void {
        if (!this.address || this.address.trim().length === 0) {
            throw new DomainException('Location address cannot be empty');
        }

        if (this.address.length > 500) {
            throw new DomainException('Location address is too long (max 500 characters)');
        }

        if (this.latitude !== undefined || this.longitude !== undefined) {
            this.validateCoordinates();
        }
    }

    private validateCoordinates(): void {
        if (this.latitude !== undefined && (this.latitude < -90 || this.latitude > 90)) {
            throw new DomainException('Latitude must be between -90 and 90');
        }

        if (this.longitude !== undefined && (this.longitude < -180 || this.longitude > 180)) {
            throw new DomainException('Longitude must be between -180 and 180');
        }

        // Si se proporciona una coordenada, deben proporcionarse ambas
        if ((this.latitude === undefined) !== (this.longitude === undefined)) {
            throw new DomainException('Both latitude and longitude must be provided together');
        }
    }

    static create(address: string, latitude?: number, longitude?: number): Location {
        return new Location(address, latitude, longitude);
    }

    static fromString(address: string): Location {
        return new Location(address);
    }

    equals(other: Location): boolean {
        return this.address === other.address &&
               this.latitude === other.latitude &&
               this.longitude === other.longitude;
    }

    toString(): string {
        if (this.hasCoordinates()) {
            return `${this.address} (${this.latitude}, ${this.longitude})`;
        }
        return this.address;
    }

    /**
     * Indica si la ubicación tiene coordenadas GPS
     */
    hasCoordinates(): boolean {
        return this.latitude !== undefined && this.longitude !== undefined;
    }

    /**
     * Obtiene las coordenadas en formato "lat,lng"
     */
    getCoordinatesString(): string | null {
        if (!this.hasCoordinates()) {
            return null;
        }
        return `${this.latitude},${this.longitude}`;
    }
}
