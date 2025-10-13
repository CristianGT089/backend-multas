import { DomainException } from '../../../../shared/index.js';

/**
 * Value Object: Cost
 * Representa el costo monetario de una multa en COP (Pesos Colombianos)
 */
export class Cost {
    private static readonly MIN_COST = 0;
    private static readonly MAX_COST = 100_000_000; // 100 millones COP

    private constructor(public readonly value: number) {
        this.validate(value);
    }

    private validate(value: number): void {
        if (value < Cost.MIN_COST) {
            throw new DomainException('Cost cannot be negative');
        }

        if (value > Cost.MAX_COST) {
            throw new DomainException(`Cost cannot exceed ${Cost.MAX_COST} COP`);
        }

        if (!Number.isFinite(value)) {
            throw new DomainException('Cost must be a finite number');
        }
    }

    static create(value: number): Cost {
        return new Cost(Math.round(value)); // Redondear a entero
    }

    static fromString(value: string): Cost {
        const numValue = parseFloat(value);
        if (isNaN(numValue)) {
            throw new DomainException('Invalid cost format');
        }
        return Cost.create(numValue);
    }

    equals(other: Cost): boolean {
        return this.value === other.value;
    }

    toString(): string {
        return this.value.toString();
    }

    /**
     * Formatea el costo con separadores de miles
     */
    format(): string {
        return new Intl.NumberFormat('es-CO', {
            style: 'currency',
            currency: 'COP',
            minimumFractionDigits: 0
        }).format(this.value);
    }

    /**
     * Suma dos costos
     */
    add(other: Cost): Cost {
        return Cost.create(this.value + other.value);
    }

    /**
     * Aplica un descuento porcentual
     */
    applyDiscount(percentage: number): Cost {
        if (percentage < 0 || percentage > 100) {
            throw new DomainException('Discount percentage must be between 0 and 100');
        }
        const discountAmount = (this.value * percentage) / 100;
        return Cost.create(this.value - discountAmount);
    }
}
