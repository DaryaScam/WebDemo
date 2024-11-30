"use client";

import Image from "next/image";
import QRCode from "qrcode";
import { useEffect, useState } from "react";
import { v4 as uuidv4 } from "uuid";
import { MSGT, PasskeyAuthInitChallenge, PasskeyAuthResult, WebSocketController } from "./utils/websocket";
import { bytesToBase64Url, bytesToHexString, generateSessionName, stringToBase64Url } from "./utils/other";
import { passkeyAuthenticate } from "./utils/passkeys";
import { base64URLStringToBuffer } from "@simplewebauthn/browser";
import { deriveKeyUsingHKDF, deriveSharedSecret, generateEcdhKeyPair } from "./utils/crypto";

export default function Home() {
  const [qrCodeUrl, setQrCodeUrl] = useState<string | null>(null);

  const sessionUuid = uuidv4();


  useEffect(() => {    
    const asyncWrapper = async () => {
      const url = await QRCode.toDataURL(sessionUuid);

      setQrCodeUrl(url);

      // KEX
      const kexC = await generateEcdhKeyPair()
      const kexCPkB64url = bytesToBase64Url(new Uint8Array(kexC.publicKey));

      // WebSocket Initialise
      let newwsc = new WebSocketController(`wss://ws.daryascam.info/channel/${sessionUuid}`);
      await newwsc.connectAndWaitChannelReady()
      console.log("WebSocket is ready");

      // Init message
      let initMessage = { browserName: generateSessionName() };
      newwsc.sendMessage({ type: MSGT.MESSAGE, data: JSON.stringify(initMessage) });

      // Challenge
      let initChallengeMsg = await newwsc.awaitMessage(MSGT.MESSAGE, 10000);
      let initChallenge = JSON.parse(initChallengeMsg.data!) as PasskeyAuthInitChallenge;

      let actualChallenge = stringToBase64Url(initChallenge.challenge + "." + kexCPkB64url);
      
      let response = await passkeyAuthenticate(actualChallenge, initChallenge.allowCredIds, initChallenge.rpId);
      newwsc.sendMessage({ type: MSGT.MESSAGE, data: JSON.stringify(response) });

            // Wait for server message confirmation
      let resultResponse = await newwsc.awaitMessage(MSGT.MESSAGE, 10000);
      let resultData = JSON.parse(resultResponse.data!) as PasskeyAuthResult;

      let keyAgreement = await deriveSharedSecret(kexC.privateKey, new Uint8Array(base64URLStringToBuffer(initChallenge.kexM)));
      console.log("keyAgreement", bytesToHexString(new Uint8Array(keyAgreement)));

      let sharedSecret = await deriveKeyUsingHKDF(new Uint8Array(keyAgreement), new Uint8Array(base64URLStringToBuffer(initChallenge.challenge)));
      console.log("Shared secret", bytesToHexString(sharedSecret));


      newwsc.sendMessage({ type: MSGT.MESSAGE });


      // Derive shared secret
      // let keyAgreement = await crypto.subtle.deriveBits(
      //   {
      //     name: "ECDH",
      //     public: await crypto.subtle.importKey("raw", base64URLStringToBuffer(initChallenge.kexM), { name: "ECDH", namedCurve: "P-256" }, false, []),
      //   },
      //   kexC.privateKey,
      //   256
      // );

      // let sharedSecret = await crypto.subtle.hkdf
      // console.log("Shared secret", sharedSecret);
    
    };
    asyncWrapper();
  }, []);
  

  return (
    <div className="grid grid-rows-[20px_1fr_20px] items-center justify-items-center min-h-screen p-8 pb-20 gap-16 sm:p-20 font-[family-name:var(--font-geist-sans)]">
      <main className="flex flex-col gap-8 row-start-2 items-center sm:items-start">
        <h1 className="text-4xl">Login to Messaging app by QR Code</h1>
        <ol className="list-inside list-decimal text-sm text-center sm:text-left font-[family-name:var(--font-geist-mono)]">
          <li className="mb-2">Open messaging app.</li>
          <li>Go to <b>Setting > Devices > Link Device</b></li>
          <li>Point your phone, and confirm login</li>
        </ol>

        <div className="flex gap-4 items-center flex-col sm:flex-row">
        {qrCodeUrl && <img className="min-h-fit" src={qrCodeUrl} alt="QR Code" />}
        </div>
      </main>
      <footer className="row-start-3 flex gap-6 flex-wrap items-center justify-center">
        <a
          className="flex items-center gap-2 hover:underline hover:underline-offset-4"
          href="https://nextjs.org/learn?utm_source=create-next-app&utm_medium=appdir-template-tw&utm_campaign=create-next-app"
          target="_blank"
          rel="noopener noreferrer"
        >
          <Image
            aria-hidden
            src="/file.svg"
            alt="File icon"
            width={16}
            height={16}
          />
          Learn
        </a>
        <a
          className="flex items-center gap-2 hover:underline hover:underline-offset-4"
          href="https://vercel.com/templates?framework=next.js&utm_source=create-next-app&utm_medium=appdir-template-tw&utm_campaign=create-next-app"
          target="_blank"
          rel="noopener noreferrer"
        >
          <Image
            aria-hidden
            src="/window.svg"
            alt="Window icon"
            width={16}
            height={16}
          />
          Examples
        </a>
        <a
          className="flex items-center gap-2 hover:underline hover:underline-offset-4"
          href="https://nextjs.org?utm_source=create-next-app&utm_medium=appdir-template-tw&utm_campaign=create-next-app"
          target="_blank"
          rel="noopener noreferrer"
        >
          <Image
            aria-hidden
            src="/globe.svg"
            alt="Globe icon"
            width={16}
            height={16}
          />
          Go to nextjs.org →
        </a>
      </footer>
    </div>
  );
}
