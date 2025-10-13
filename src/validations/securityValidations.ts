/**
 * Utilidades de validación y sanitización de seguridad
 */

/**
 * Valida que una cadena no contenga caracteres HTML o scripts potencialmente peligrosos
 */
export function containsDangerousHTML(input: string): boolean {
    const dangerousPatterns = [
        /<script/i,
        /<\/script>/i,
        /<iframe/i,
        /javascript:/i,
        /onerror=/i,
        /onload=/i,
        /onclick=/i,
        /<img/i,
        /<svg/i,
        /<object/i,
        /<embed/i,
        /<link/i,
    ];

    return dangerousPatterns.some(pattern => pattern.test(input));
}

/**
 * Valida que una cadena no contenga intentos de SQL injection
 */
export function containsSQLInjection(input: string): boolean {
    const sqlPatterns = [
        /(\bOR\b|\bAND\b).*[=']/i,
        /UNION.*SELECT/i,
        /DROP\s+TABLE/i,
        /DELETE\s+FROM/i,
        /INSERT\s+INTO/i,
        /UPDATE\s+.*SET/i,
        /--/,
        /;.*DROP/i,
        /'\s*OR\s*'1'\s*=\s*'1/i,
        /'\s*OR\s*1\s*=\s*1/i,
    ];

    return sqlPatterns.some(pattern => pattern.test(input));
}

/**
 * Valida que una cadena no contenga caracteres de control o null bytes
 */
export function containsControlCharacters(input: string): boolean {
    // Busca caracteres de control (0x00-0x1F excepto tab, newline, carriage return)
    const controlCharsPattern = /[\x00-\x08\x0B\x0C\x0E-\x1F]/;
    return controlCharsPattern.test(input);
}

/**
 * Valida que una cadena no contenga intentos de path traversal
 */
export function containsPathTraversal(input: string): boolean {
    const pathTraversalPatterns = [
        /\.\./,
        /%2e%2e/i,
        /\.\./,
        /\.\.%2f/i,
        /%2e%2e%2f/i,
    ];

    return pathTraversalPatterns.some(pattern => pattern.test(input));
}

/**
 * Sanitiza una cadena eliminando caracteres HTML peligrosos
 */
export function sanitizeHTML(input: string): string {
    return input
        .replace(/</g, '&lt;')
        .replace(/>/g, '&gt;')
        .replace(/"/g, '&quot;')
        .replace(/'/g, '&#x27;')
        .replace(/\//g, '&#x2F;');
}

/**
 * Valida la longitud máxima de una cadena
 */
export function validateMaxLength(input: string, maxLength: number): boolean {
    return input.length <= maxLength;
}

/**
 * Valida que un número esté dentro de un rango
 */
export function validateNumberRange(value: number, min: number, max: number): boolean {
    return value >= min && value <= max;
}

/**
 * Valida que una cadena contenga solo caracteres alfanuméricos y espacios
 */
export function isAlphanumericWithSpaces(input: string): boolean {
    return /^[a-zA-Z0-9\s]+$/.test(input);
}

/**
 * Valida que una cadena sea un identificador válido (solo letras, números, guiones y guiones bajos)
 */
export function isValidIdentifier(input: string): boolean {
    return /^[a-zA-Z0-9_-]+$/.test(input);
}

/**
 * Realiza una validación completa de seguridad en una cadena
 * @returns objeto con el resultado de la validación y el mensaje de error si aplica
 */
export function validateInputSecurity(input: string, fieldName: string = 'Input'): { isValid: boolean; error?: string } {
    if (containsDangerousHTML(input)) {
        return {
            isValid: false,
            error: `${fieldName} contains potentially dangerous HTML or script content.`
        };
    }

    if (containsSQLInjection(input)) {
        return {
            isValid: false,
            error: `${fieldName} contains potentially dangerous SQL injection patterns.`
        };
    }

    if (containsControlCharacters(input)) {
        return {
            isValid: false,
            error: `${fieldName} contains invalid control characters.`
        };
    }

    return { isValid: true };
}
