
export const generateSessionName = () => {
    let browserName = "Unknown";
    if (navigator.userAgent.indexOf("Firefox") != -1) {
      browserName = "Firefox";
    } else if (navigator.userAgent.indexOf("Opera") != -1 || navigator.userAgent.indexOf("OPR") != -1) {
      browserName = "Opera";
    } else if (navigator.userAgent.indexOf("Trident") != -1) {
      browserName = "IE";
    } else if (navigator.userAgent.indexOf("Edge") != -1) {
      browserName = "Edge";
    } else if (navigator.userAgent.indexOf("Chrome") != -1) {
      browserName = "Chrome";
    } else if (navigator.userAgent.indexOf("Safari") != -1) {
      browserName = "Safari";
    }
  
    let operatingSystem = "Unknown";
    if (navigator.userAgent.indexOf("Windows") != -1) {
      operatingSystem = "Windows";
    } else if (navigator.userAgent.indexOf("Mac") != -1) {
      operatingSystem = "Mac";
    } else if (navigator.userAgent.indexOf("Linux") != -1) {
      operatingSystem = "Linux";
    }
  
    return `${browserName} (${operatingSystem})`;
}

export const bytesToBase64Url = (bytes: Uint8Array) => {
    return btoa(String.fromCharCode(...bytes))
      .replace(/\+/g, "-")
      .replace(/\//g, "_")
      .replace(/=/g, "");
}

export const base64UrlToBytes = (base64Url: string) => {
    return new Uint8Array(
      atob(
        base64Url
          .replace(/-/g, "+")
          .replace(/_/g, "/")
          .replace(/=/g, "")
      )
      .split("")
      .map((c) => c.charCodeAt(0))
    );
}

export const stringToBase64Url = (str: string) => {
    return bytesToBase64Url(stringToBytes(str));
}

export const stringToBytes = (str: string): Uint8Array => {
    return new TextEncoder().encode(str);
}

export async function deriveKeyUsingHKDF(keyAgreementBytes: Uint8Array, sharedInfo: Uint8Array) {
    try {
      // Input parameters
      const inputKeyMaterial = new TextEncoder().encode("initial secret"); // Your secret
      const salt = new TextEncoder().encode("random salt"); // Should be random
      const info = new TextEncoder().encode("key derivation info"); // Application-specific context
      const outputKeyLength = 256; // Derived key length in bits
  
      // Step 1: Import the input key material
      const baseKey = await crypto.subtle.importKey(
        "raw",
        inputKeyMaterial,
        { name: "HKDF" },
        false, // Extractable
        ["deriveKey", "deriveBits"]
      );
  
      // Step 2: Derive the key using HKDF
      const derivedKey = await crypto.subtle.deriveKey(
        {
          name: "HKDF",
          hash: "SHA-256", // Use SHA-256, SHA-384, or SHA-512
          salt: salt,
          info: info,
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
  
  // Example usage
  deriveKeyUsingHKDF();