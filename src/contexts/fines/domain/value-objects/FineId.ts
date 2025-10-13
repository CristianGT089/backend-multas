import { DomainException } from '../../../../shared/index.js';

/**
 * Value Object: Fine ID
 * Representa el identificador único de una multa
 */
export class FineId {
    private constructor(public readonly value: number) {
        this.validate(value);
    }

    private validate(value: number): void {
        if (value < 0) {
            throw new DomainException('Fine ID must be a positive number');
        }
        if (!Number.isInteger(value)) {
            throw new DomainException('Fine ID must be an integer');
        }
    }

    static create(value: number): FineId {
        return new FineId(value);
    }

    static fromString(value: string): FineId {
        const numValue = parseInt(value, 10);
        if (isNaN(numValue)) {
            throw new DomainException('Invalid Fine ID format');
        }
        return new FineId(numValue);
    }

    equals(other: FineId): boolean {
        return this.value === other.value;
    }

    toString(): string {
        return this.value.toString();
    }
}
