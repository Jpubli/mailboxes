/**
 * Validador de JSON de expedición
 * Valida según las especificaciones del documento técnico
 */

export function validateShipmentJSON(data) {
    const errors = [];

    // Validar shipment (obligatorio)
    if (!data.shipment || typeof data.shipment !== 'string') {
        errors.push('El campo "shipment" es obligatorio y debe ser un texto');
    }

    // Validar shipper
    if (!data.shipper) {
        errors.push('Falta el objeto "shipper"');
    } else {
        if (!data.shipper.countryCode) {
            errors.push('El campo "shipper.countryCode" es obligatorio');
        } else if (!/^[A-Z]{2}$/.test(data.shipper.countryCode)) {
            errors.push('El "shipper.countryCode" debe ser formato ISO 3166-1 alpha-2 (ej: ES, FR)');
        }

        if (!data.shipper.postalCode) {
            errors.push('El campo "shipper.postalCode" es obligatorio');
        }
    }

    // Validar recipient
    if (!data.recipient) {
        errors.push('Falta el objeto "recipient"');
    } else {
        if (!data.recipient.countryCode) {
            errors.push('El campo "recipient.countryCode" es obligatorio');
        } else if (!/^[A-Z]{2}$/.test(data.recipient.countryCode)) {
            errors.push('El "recipient.countryCode" debe ser formato ISO 3166-1 alpha-2 (ej: ES, FR)');
        }

        if (!data.recipient.postalCode) {
            errors.push('El campo "recipient.postalCode" es obligatorio');
        }
    }

    // Validar packages
    if (!data.packages || !Array.isArray(data.packages)) {
        errors.push('El campo "packages" debe ser un array');
    } else if (data.packages.length === 0) {
        errors.push('El array "packages" no puede estar vacío');
    } else {
        data.packages.forEach((pkg, index) => {
            if (!pkg.kg || isNaN(parseFloat(pkg.kg)) || parseFloat(pkg.kg) <= 0) {
                errors.push(`El paquete ${index + 1}: "kg" debe ser un número mayor que 0`);
            }
            if (!pkg.lar || isNaN(parseFloat(pkg.lar)) || parseFloat(pkg.lar) <= 0) {
                errors.push(`El paquete ${index + 1}: "lar" debe ser un número mayor que 0`);
            }
            if (!pkg.anc || isNaN(parseFloat(pkg.anc)) || parseFloat(pkg.anc) <= 0) {
                errors.push(`El paquete ${index + 1}: "anc" debe ser un número mayor que 0`);
            }
            if (!pkg.alt || isNaN(parseFloat(pkg.alt)) || parseFloat(pkg.alt) <= 0) {
                errors.push(`El paquete ${index + 1}: "alt" debe ser un número mayor que 0`);
            }
        });
    }

    return {
        valid: errors.length === 0,
        errors
    };
}

/**
 * Calcula el peso total de todos los paquetes
 */
export function calculateTotalWeight(packages) {
    return packages.reduce((total, pkg) => total + parseFloat(pkg.kg), 0);
}
