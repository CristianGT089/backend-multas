import { DomainException } from '../../../../shared/index.js';

/**
 * Value Object: Infraction Type
 * Representa el tipo de infracción de tránsito
 */
export enum InfractionTypeEnum {
    EXCESO_VELOCIDAD = 'EXCESO_VELOCIDAD',
    SEMAFORO_ROJO = 'SEMAFORO_ROJO',
    ESTACIONAMIENTO_PROHIBIDO = 'ESTACIONAMIENTO_PROHIBIDO',
    CONDUCIR_EMBRIAGADO = 'CONDUCIR_EMBRIAGADO',
    NO_RESPETAR_PASO_PEATONAL = 'NO_RESPETAR_PASO_PEATONAL',
    USO_CELULAR = 'USO_CELULAR',
    NO_USAR_CINTURON = 'NO_USAR_CINTURON',
    CONDUCIR_SIN_LICENCIA = 'CONDUCIR_SIN_LICENCIA',
    OTRO = 'OTRO'
}

export class InfractionType {
    private constructor(public readonly value: InfractionTypeEnum) {}

    static create(value: string): InfractionType {
        const upperValue = value.toUpperCase().replace(/\s+/g, '_');

        if (!Object.values(InfractionTypeEnum).includes(upperValue as InfractionTypeEnum)) {
            throw new DomainException(
                `Invalid infraction type: ${value}. Must be one of: ${Object.values(InfractionTypeEnum).join(', ')}`
            );
        }

        return new InfractionType(upperValue as InfractionTypeEnum);
    }

    static fromEnum(value: InfractionTypeEnum): InfractionType {
        return new InfractionType(value);
    }

    equals(other: InfractionType): boolean {
        return this.value === other.value;
    }

    toString(): string {
        return this.value;
    }

    /**
     * Retorna una descripción legible del tipo de infracción
     */
    getDescription(): string {
        const descriptions: Record<InfractionTypeEnum, string> = {
            [InfractionTypeEnum.EXCESO_VELOCIDAD]: 'Exceso de velocidad',
            [InfractionTypeEnum.SEMAFORO_ROJO]: 'Pasarse un semáforo en rojo',
            [InfractionTypeEnum.ESTACIONAMIENTO_PROHIBIDO]: 'Estacionamiento en zona prohibida',
            [InfractionTypeEnum.CONDUCIR_EMBRIAGADO]: 'Conducir en estado de embriaguez',
            [InfractionTypeEnum.NO_RESPETAR_PASO_PEATONAL]: 'No respetar paso peatonal',
            [InfractionTypeEnum.USO_CELULAR]: 'Uso de celular mientras conduce',
            [InfractionTypeEnum.NO_USAR_CINTURON]: 'No usar cinturón de seguridad',
            [InfractionTypeEnum.CONDUCIR_SIN_LICENCIA]: 'Conducir sin licencia',
            [InfractionTypeEnum.OTRO]: 'Otra infracción'
        };

        return descriptions[this.value];
    }
}
