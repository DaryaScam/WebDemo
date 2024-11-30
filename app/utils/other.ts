
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

export const bytesToHexString = (bytes: Uint8Array) => {
    return Array.from(bytes)
      .map((byte) => byte.toString(16).padStart(2, "0"))
      .join("");
}