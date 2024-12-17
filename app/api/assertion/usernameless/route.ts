import { NextRequest, NextResponse } from 'next/server';
import { saveSession } from '@/app/lib/middleware';
import { v4 as uuidv4 } from 'uuid';


import {
    generateAuthenticationOptions,
    generateRegistrationOptions    
} from '@simplewebauthn/server';


export async function POST(
    req: NextRequest,
) {
    try {
        // Generate options
        let opts = await generateAuthenticationOptions({
            rpID: process.env.RPID!,
        });

        // Save options to session
        const res = NextResponse.json({ status: 'ok', optionsJSON: opts }, { status: 200 });
        const sessionId = saveSession({
            loginPasskeyOpts: opts,
        });

        res.cookies.set('session', sessionId, {
            httpOnly: true,
        });

        return res
    } catch (error) {
        console.log(error);
        return NextResponse.json({ error: 'Error initiating passkey auth passwordless' }, { status: 401 });
    }
}