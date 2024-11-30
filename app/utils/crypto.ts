"use client";

export const generateEcdhKeyPair = async () => {
    const kexC = await crypto.subtle.generateKey(
        {
          name: "ECDH",
          namedCurve: "P-256",
        },
        true, // Non-extractable
        ["deriveKey", "deriveBits"]
      );

      const kexCPk = await crypto.subtle.exportKey("raw", kexC.publicKey);

    return {
        publicKey: kexCPk,
        privateKey: kexC.privateKey
    }
}

export const deriveSharedSecret = async (privateKey: CryptoKey, publicKey: Uint8Array) => {
    const keyAgreement = await crypto.subtle.deriveBits(
        {
          name: "ECDH",
          public: await crypto.subtle.importKey("raw", publicKey, { name: "ECDH", namedCurve: "P-256" }, false, []),
        },
        privateKey,
        256
      );

      return keyAgreement;
}

interface DerivedKey {
    encryption: Uint8Array;
    mac: Uint8Array;
}

export const deriveKeyUsingHKDF = async (keyAgreementBytes: Uint8Array, sharedInfo: Uint8Array): Promise<DerivedKey> => {
    try {
      const baseKey = await crypto.subtle.importKey(
        "raw",
        keyAgreementBytes,
        { name: "HKDF" },
        false, // Extractable
        ["deriveKey", "deriveBits"]
      );
  
      const derivedKey = await crypto.subtle.deriveBits(
        {
          name: "HKDF",
          hash: "SHA-256",
          salt: new Uint8Array(),
          info: sharedInfo,
        },
        baseKey,
        512 // Algorithm for the derived key
      );
  
      return {
        encryption: new Uint8Array(derivedKey.slice(0, 32)),
        mac: new Uint8Array(derivedKey.slice(32, 64)),
      }
    } catch (error) {
      console.error("Error deriving key using HKDF", error);
      throw error;
    }
}