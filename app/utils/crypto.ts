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

export const deriveKeyUsingHKDF = async (keyAgreementBytes: Uint8Array, sharedInfo: Uint8Array) => {
    try {
      const baseKey = await crypto.subtle.importKey(
        "raw",
        keyAgreementBytes,
        { name: "HKDF" },
        false, // Extractable
        ["deriveKey", "deriveBits"]
      );
  
      const derivedKey = await crypto.subtle.deriveKey(
        {
          name: "HKDF",
          hash: "SHA-256",
          salt: new Uint8Array(),
          info: sharedInfo,
        },
        baseKey,
        { name: "AES-GCM", length: 256 }, // Algorithm for the derived key
        true, // Extractable
        ["encrypt", "decrypt"] // Key usages
      );
  
      console.log("Derived Key:", derivedKey);
      return derivedKey;
    } catch (error) {
      console.error("Error in HKDF key derivation:", error);
    }
}