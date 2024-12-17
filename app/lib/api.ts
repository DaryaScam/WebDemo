import { RegistrationResponseJSON } from '@simplewebauthn/types';

export const getMakeCredOptions = async (name: string, email: string) => {
    const registrationOptions = await fetch('/api/attestation/init', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
        },
        body: JSON.stringify({ name, email }),
    });

    if (!registrationOptions.ok) {
        throw new Error('Failed to generate registration options');
    }

    return registrationOptions.json();
}

export const validateAttestationResult = async (attestationResult: RegistrationResponseJSON) => {
    const validation = await fetch('/api/attestation/result', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
        },
        body: JSON.stringify(attestationResult),
    });

    if (!validation.ok) {
        throw new Error('Failed to validate attestation result');
    }

    return validation.json();
}

export const getGetCredOptions = async (email: string) => {
    const credentialOptions = await fetch('/api/assertion/init', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
        },
        body: JSON.stringify({ email }),
    });

    if (!credentialOptions.ok) {
        throw new Error('Failed to generate credential options');
    }

    return credentialOptions.json();
}

export const getGetCredOptionsUsernameless = async () => {
    const credentialOptions = await fetch('/api/assertion/usernameless', {
        method: 'POST',
    });

    if (!credentialOptions.ok) {
        throw new Error('Failed to generate credential options');
    }

    return credentialOptions.json();
}


export const validateAssertionResult = async (assertionResult: any) => {
    const validation = await fetch('/api/assertion/result', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
        },
        body: JSON.stringify(assertionResult),
    });

    if (!validation.ok) {
        throw new Error('Failed to validate assertion result');
    }

    return validation.json();
}