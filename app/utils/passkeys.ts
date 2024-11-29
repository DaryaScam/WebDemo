"use client";

import { startAuthentication } from "@simplewebauthn/browser";

export const passkeyAuthenticate = async (challengeB64Url: string, allowCredentialsStrs: string[], rpID: string) => {
    console.log("Authenticating with challenge", challengeB64Url, "and allowCredentials", allowCredentialsStrs);
    return await startAuthentication({
        optionsJSON: {
            challenge: challengeB64Url,
            timeout: 60000,
            rpId: rpID,
            allowCredentials: allowCredentialsStrs.map((credId) => ({
                id: credId,
                type: "public-key",
                transports: ["hybrid", "internal"],
            })),
        }
    })
   
};