// SPDX-License-Identifier: MIT
pragma solidity ^0.8.28;

import "@openzeppelin/contracts/access/Ownable.sol";

contract FineManagement is Ownable {
    uint256 private _fineIds;

    enum FineState { PENDING, PAID, APPEALED, RESOLVED_APPEAL, CANCELLED }

    struct Fine {
        uint256 id;
        string plateNumber; // Número de placa
        string evidenceCID; // CID de IPFS de la evidencia
        string location; // Ubicación de la infracción
        uint256 timestamp; // Marca de tiempo (Unix timestamp)
        string infractionType; // Tipo de infracción
        uint256 cost; // Costo de la multa
        string ownerIdentifier; // Identificador del propietario (DNI, RUC, etc.)
        FineState currentState; // Estado actual de la multa
        address registeredBy; // Dirección que registró la multa
        string externalSystemId; // ID externo (opcional, por ejemplo, de SIMIT)
    }

    struct FineStatusUpdate {
        uint256 lastUpdatedTimestamp; // Marca de tiempo de la actualización
        FineState oldState; // Estado anterior
        FineState newState; // Nuevo estado
        string reason; // Razón del cambio de estado
        address updatedBy; // Dirección que realizó la actualización
    }

    mapping(uint256 => Fine) public fines; // ID de multa => detalles de la multa
    mapping(uint256 => FineStatusUpdate[]) public fineStatusHistory; // ID de multa => historial de estados
    mapping(string => uint256[]) public finesByPlate; // Número de placa => IDs de multas
    mapping(string => uint256[]) public finesByOwner; // Identificador del propietario => IDs de multas

    event FineRegistered(
        uint256 indexed fineId,
        string indexed plateNumber,
        string evidenceCID,
        string ownerIdentifier,
        uint256 cost,
        uint256 timestamp
    );

    event FineStatusUpdated(
        uint256 indexed fineId,
        FineState indexed oldState,
        FineState indexed newState,
        string reason,
        uint256 timestamp
    );

    mapping(address => bool) public operators;

    modifier onlyOperator() {
        require(operators[msg.sender] || owner() == msg.sender, "Not an operator");
        _;
    }

    constructor() Ownable(msg.sender) {
        operators[msg.sender] = true; // The deployer is an operator by default
    }

    /**
     * Agrega un operador autorizado.
     * @param _operator Dirección del operador a agregar
     */
    function addOperator(address _operator) public onlyOwner {
        operators[_operator] = true;
    }

    /**
     * Elimina un operador autorizado.
     * @param _operator Dirección del operador a eliminar
     */
    function removeOperator(address _operator) public onlyOwner {
        operators[_operator] = false;
    }

    /**
     * Registra una nueva multa.
     * @param _plateNumber Número de placa
     * @param _evidenceCID CID de IPFS de la evidencia
     * @param _location Ubicación de la infracción
     * @param _infractionType Tipo de infracción
     * @param _cost Costo de la multa
     * @param _ownerIdentifier Identificador del propietario
     * @param _externalSystemId ID externo (opcional)
     */
    function registerFine(
        string memory _plateNumber,
        string memory _evidenceCID,
        string memory _location,
        string memory _infractionType,
        uint256 _cost,
        string memory _ownerIdentifier,
        string memory _externalSystemId // Opcional
    ) public onlyOperator returns (uint256) {
        require(bytes(_plateNumber).length > 0, "Plate number is required");
        require(bytes(_evidenceCID).length > 0, "Evidence CID is required");
        require(bytes(_location).length > 0, "Location is required");
        require(bytes(_infractionType).length > 0, "Infraction type is required");
        require(_cost > 0, "Cost must be greater than zero");

        // Incrementa manualmente el contador
        _fineIds += 1;
        uint256 newFineId = _fineIds;

        fines[newFineId] = Fine({
            id: newFineId,
            plateNumber: _plateNumber,
            evidenceCID: _evidenceCID,
            location: _location,
            timestamp: block.timestamp,
            infractionType: _infractionType,
            cost: _cost,
            ownerIdentifier: _ownerIdentifier,
            currentState: FineState.PENDING,
            registeredBy: msg.sender,
            externalSystemId: _externalSystemId
        });

        finesByPlate[_plateNumber].push(newFineId);
        finesByOwner[_ownerIdentifier].push(newFineId);

        // Registrar el primer estado en el historial de la multa
        fineStatusHistory[newFineId].push(FineStatusUpdate({
            lastUpdatedTimestamp: block.timestamp,
            oldState: FineState.PENDING,
            newState: FineState.PENDING,
            reason: "Fine registered",
            updatedBy: msg.sender
        }));

        emit FineRegistered(
            newFineId,
            _plateNumber,
            _evidenceCID,
            _ownerIdentifier,
            _cost,
            block.timestamp
        );

        return newFineId;
    }

    /**
     * Actualiza el estado de una multa.
     * @param _fineId ID de la multa
     * @param _newState Nuevo estado de la multa
     * @param _reason Razón del cambio de estado
     */
    function updateFineStatus(
        uint256 _fineId,
        FineState _newState,
        string memory _reason
    ) public onlyOperator {
        Fine storage fine = fines[_fineId];
        require(fine.id != 0, "Fine does not exist");
        require(fine.currentState != _newState, "State is already the same");

        FineState oldState = fine.currentState;
        fine.currentState = _newState;

        fineStatusHistory[_fineId].push(FineStatusUpdate({
            lastUpdatedTimestamp: block.timestamp,
            oldState: oldState,
            newState: _newState,
            reason: _reason,
            updatedBy: msg.sender
        }));

        emit FineStatusUpdated(_fineId, oldState, _newState, _reason, block.timestamp);
    }

    /**
     * Obtiene los detalles de una multa.
     * @param _fineId ID de la multa
     * @return fine Detalles de la multa
     */
    function getFineDetails(uint256 _fineId) public view returns (Fine memory) {
        require(fines[_fineId].id != 0, "Fine does not exist");
        return fines[_fineId];
    }

    /**
     * Obtiene los IDs de multas asociadas a un número de placa.
     * @param _plateNumber Número de placa
     * @return finesByPlate Array de IDs de multas
     */
    function getFinesByPlate(string memory _plateNumber) public view returns (uint256[] memory) {
        return finesByPlate[_plateNumber];
    }

    /**
     * Obtiene el número total de multas registradas.
     * @return totalFines Número total de multas
     */
    function getAllFineCount() public view returns (uint256) {
        return _fineIds;
    }

    /**
     * Obtiene multas paginadas.
     * @param _page Número de página (comienza en 1)
     * @param _pageSize Tamaño de la página
     * @return paginatedFines Array de multas paginadas
     */
    function getPaginatedFines(uint256 _page, uint256 _pageSize) public view returns (Fine[] memory) {
        require(_pageSize > 0, "Page size must be greater than zero");

        uint256 totalFines = _fineIds; // Usar _fineIds directamente
        uint256 startIndex = (_page - 1) * _pageSize;
        uint256 endIndex = startIndex + _pageSize;

        if (startIndex >= totalFines) {
            return new Fine[](0);
        }

        if (endIndex > totalFines) {
            endIndex = totalFines;
        }

        Fine[] memory paginatedFines = new Fine[](endIndex - startIndex);
        for (uint256 i = startIndex; i < endIndex; i++) {
            paginatedFines[i - startIndex] = fines[i + 1];
        }

        return paginatedFines;
    }

    /**
    * Obtiene los detalles de registro de una multa.
    * @param _fineId ID de la multa
    * @return blockNumber Número del bloque donde se registró la multa
    * @return timestamp Timestamp del bloque
    * @return statusHistoryLength Longitud del historial de estados
    * @return registeredBy Dirección que registró la multa
    * @return externalSystemId ID externo de la multa (si existe)
    */
    function getFineRegistrationDetails(uint256 _fineId) public view returns (
        uint256 blockNumber,
        uint256 timestamp,
        uint256 statusHistoryLength,
        address registeredBy,
        string memory externalSystemId
    ) {
        require(fines[_fineId].id != 0, "Fine does not exist");
        
        Fine storage fine = fines[_fineId];
        
        return (
            block.number,
            block.timestamp,
            fineStatusHistory[_fineId].length,
            fine.registeredBy,
            fine.externalSystemId
        );
    }

    /**
     * Obtiene el historial de estados de una multa de forma paginada.
     * @param _fineId ID de la multa
     * @param _page Número de página (comienza en 1)
     * @param _pageSize Tamaño de la página
     * @return updates Array de actualizaciones de estado
     * @return totalUpdates Número total de actualizaciones
     */
    function getFineStatusHistory(
        uint256 _fineId,
        uint256 _page,
        uint256 _pageSize
    ) public view returns (FineStatusUpdate[] memory updates, uint256 totalUpdates) {
        require(fines[_fineId].id != 0, "Fine does not exist");
        require(_pageSize > 0, "Page size must be greater than zero");
        
        FineStatusUpdate[] storage history = fineStatusHistory[_fineId];
        totalUpdates = history.length;
        
        uint256 startIndex = (_page - 1) * _pageSize;
        if (startIndex >= totalUpdates) {
            return (new FineStatusUpdate[](0), totalUpdates);
        }
        
        uint256 endIndex = startIndex + _pageSize;
        if (endIndex > totalUpdates) {
            endIndex = totalUpdates;
        }
        
        updates = new FineStatusUpdate[](endIndex - startIndex);
        for (uint256 i = startIndex; i < endIndex; i++) {
            updates[i - startIndex] = history[i];
        }
        
        return (updates, totalUpdates);
    }
}