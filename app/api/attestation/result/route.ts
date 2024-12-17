import { NextRequest, NextResponse } from 'next/server';
import { getSession, saveSession } from '@/app/lib/middleware';
import { RegistrationResponseJSON } from '@simplewebauthn/types';


import {
    verifyRegistrationResponse
} from '@simplewebauthn/server';
import db from '@/app/lib/db';


export async function POST(
    req: NextRequest,
) {
    const attResult: RegistrationResponseJSON = await req.json();

    try {
        const sessionId = req.cookies.get('session');

        if (!sessionId) {
            return NextResponse.json({ error: 'No session found' }, { status: 401 });
        }

        const session = await getSession(req);
        if (!session) {
            return NextResponse.json({ error: 'Session not found' }, { status: 401 });
        }

        let verification = await verifyRegistrationResponse({
            response: attResult,
            expectedChallenge: session!.createPasskeyOpts!.challenge,
            expectedOrigin: JSON.parse(process.env.ALLOWED_ORIGINS!),
            expectedRPID: process.env.RPID!,
        });

        if (!verification.verified) {
            return NextResponse.json({ error: 'Error verifying passkey registration' }, { status: 401 });
        }

        db.data.passkeys.push(verification.registrationInfo!.credential);
        db.write();

        let newUser = session.userPreReg!;
        newUser.passkeys = [String(verification.registrationInfo!.credential.id)];
        db.data.users.push(newUser);
        db.write();

        const newSessionId = saveSession({ 
            loggedIn: true ,
            username: newUser.email,
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