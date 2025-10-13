import { DomainException } from '../../../../shared/index.js';

/**
 * Value Object: Plate Number
 * Representa el número de placa de un vehículo (formato colombiano)
 */
export class PlateNumber {
    private static readonly PLATE_REGEX = /^[A-Z]{3}[0-9]{3}$/;

    private constructor(public readonly value: string) {
        this.validate(value);
    }

    private validate(value: string): void {
        if (!value || value.trim().length === 0) {
            throw new DomainException('Plate number cannot be empty');
        }

        const upperValue = value.toUpperCase();

        if (!PlateNumber.PLATE_REGEX.test(upperValue)) {
            throw new DomainException(
                'Invalid plate number format. Expected format: ABC123 (3 letters + 3 numbers)'
            );
        }
    }

    static create(value: string): PlateNumber {
        return new PlateNumber(value.toUpperCase());
    }

    equals(other: PlateNumber): boolean {
        return this.value === other.value;
    }

    toString(): string {
        return this.value;
    }
}
