import { DomainException } from '../../../../shared/index.js';

/**
 * Value Object: Evidence CID
 * Representa un Content Identifier de IPFS
 */
export class EvidenceCID {
    private static readonly CID_V0_REGEX = /^Qm[1-9A-HJ-NP-Za-km-z]{44}$/;
    private static readonly CID_V1_REGEX = /^b[a-z2-7]{58}$/;

    private constructor(public readonly value: string) {
        this.validate(value);
    }

    private validate(value: string): void {
        if (!value || value.trim().length === 0) {
            throw new DomainException('Evidence CID cannot be empty');
        }

        const isCIDv0 = EvidenceCID.CID_V0_REGEX.test(value);
        const isCIDv1 = EvidenceCID.CID_V1_REGEX.test(value);

        if (!isCIDv0 && !isCIDv1) {
            throw new DomainException(
                'Invalid IPFS CID format. Expected CIDv0 (Qm...) or CIDv1 (b...)'
            );
        }
    }

    static create(value: string): EvidenceCID {
        return new EvidenceCID(value);
    }

    equals(other: EvidenceCID): boolean {
        return this.value === other.value;
    }

    toString(): string {
        return this.value;
    }

    /**
     * Indica si es un CID version 0
     */
    isCIDv0(): boolean {
        return this.value.startsWith('Qm');
    }

    /**
     * Indica si es un CID version 1
     */
    isCIDv1(): boolean {
        return this.value.startsWith('b');
    }
}
