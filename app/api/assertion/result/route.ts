import { NextRequest, NextResponse } from 'next/server';
import { getSession, saveSession } from '@/app/lib/middleware';
import { AuthenticationResponseJSON } from '@simplewebauthn/types';


import {
    verifyAuthenticationResponse
} from '@simplewebauthn/server';
import db from '@/app/lib/db';


export async function POST(
    req: NextRequest,
) {
    try {
        const assertionResult: AuthenticationResponseJSON = await req.json();
        const sessionId = req.cookies.get('session');

        if (!sessionId) {
            return NextResponse.json({ error: 'No session found' }, { status: 401 });
        }

        const session = await getSession(req);
        if (!session) {
            return NextResponse.json({ error: 'Session not found' }, { status: 401 });
        }

        const passkey = db.data.passkeys.find((passkey) => passkey.id === assertionResult.id);
        if (!passkey) {
            return NextResponse.json({ error: 'Passkey not found' }, { status: 401 });
        }


        let verification = await verifyAuthenticationResponse({
            response: assertionResult,
            expectedChallenge: session!.loginPasskeyOpts!.challenge,
            expectedOrigin: JSON.parse(process.env.ALLOWED_ORIGINS!),
            expectedRPID: process.env.RPID!,
            credential: {
                id: passkey.id,
                publicKey: Buffer.from(passkey.publicKey, 'hex'),
                counter: passkey.counter,
            },
        });

        if (!verification.verified) {
            return NextResponse.json({ error: 'Error verifying passkey assertion' }, { status: 401 });
        }

        const newSessionId = saveSession({ 
            loggedIn: true ,
            username: session.username,
        });

        const res = NextResponse.json({ status: 'ok' }, { status: 200 });
        res.cookies.set('session', newSessionId, {
            httpOnly: true,
        });

        return res

    } catch (error) {
        console.log(error);
        return NextResponse.json({ error: 'Error verifying passkey registration' }, { status: 401 });
    }
}