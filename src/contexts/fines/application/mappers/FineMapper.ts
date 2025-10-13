import { Fine } from '../../domain/entities/Fine.js';
import { FineId } from '../../domain/value-objects/FineId.js';
import { PlateNumber } from '../../domain/value-objects/PlateNumber.js';
import { EvidenceCID } from '../../domain/value-objects/EvidenceCID.js';
import { Location } from '../../domain/value-objects/Location.js';
import { InfractionType } from '../../domain/value-objects/InfractionType.js';
import { Cost } from '../../domain/value-objects/Cost.js';
import { FineState } from '../../domain/value-objects/FineState.js';
import type { FineDetailsDTO } from '../../domain/ports/input/IGetFineUseCase.js';

/**
 * Mapper para convertir entre la entidad Fine y DTOs
 */
export class FineMapper {
    /**
     * Convierte una entidad Fine a un DTO de detalles
     */
    static toDetailsDTO(fine: Fine): FineDetailsDTO {
        const costWithLateFee = fine.isOverdue(new Date())
            ? fine.calculateCostWithLateFee().value
            : undefined;

        return {
            id: fine.id.value,
            plateNumber: fine.plateNumber.value,
            evidenceCID: fine.evidenceCID.value,
            location: fine.location.toString(),
            infractionType: fine.infractionType.value,
            cost: fine.cost.value,
            costWithLateFee,
            ownerIdentifier: fine.ownerIdentifier,
            currentState: fine.currentState.value,
            stateDescription: fine.currentState.getDescription(),
            registeredBy: fine.registeredBy,
            timestamp: fine.timestamp,
            externalSystemId: fine.externalSystemId || undefined,
            isOverdue: fine.isOverdue(new Date()),
            canBeAppealed: fine.canBeAppealed()
        };
    }

    /**
     * Crea una entidad Fine desde datos primitivos (ej. blockchain)
     */
    static toDomain(data: {
        id: number;
        plateNumber: string;
        evidenceCID: string;
        location: string;
        timestamp: Date;
        infractionType: string;
        cost: number;
        ownerIdentifier: string;
        currentState: number;
        registeredBy: string;
        externalSystemId?: string;
    }): Fine {
        const fineId = FineId.create(data.id);
        const plateNumber = PlateNumber.create(data.plateNumber);
        const evidenceCID = EvidenceCID.create(data.evidenceCID);
        const location = Location.fromString(data.location);
        const infractionType = InfractionType.create(data.infractionType);
        const cost = Cost.create(data.cost);
        const currentState = FineState.create(data.currentState);

        return new Fine(
            fineId,
            plateNumber,
            evidenceCID,
            location,
            infractionType,
            cost,
            data.ownerIdentifier,
            currentState,
            data.registeredBy,
            data.timestamp,
            data.externalSystemId || ''
        );
    }

    /**
     * Convierte una lista de multas a un array de DTOs
     */
    static toDetailsDTOList(fines: Fine[]): FineDetailsDTO[] {
        return fines.map(fine => this.toDetailsDTO(fine));
    }
}
