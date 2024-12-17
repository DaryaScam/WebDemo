import { NextRequest, NextResponse } from 'next/server';
import { saveSession } from '@/app/lib/middleware';
import { v4 as uuidv4 } from 'uuid';

import {
    generateRegistrationOptions    
} from '@simplewebauthn/server';


export async function POST(
    req: NextRequest,
) {
    const { name, email } = await req.json();

    try {
        // Generate options
        let opts = await generateRegistrationOptions({
            rpName: process.env.RPNAME!,
            rpID: process.env.RPID!,
            userName: name,
        });

        // Save options to session
        const res = NextResponse.json({ status: 'ok', optionsJSON: opts }, { status: 200 });
        const sessionId = saveSession({
            createPasskeyOpts: opts,
            userPreReg: {
                uid: uuidv4(),
                email,
                name,
            },
        });

        res.cookies.set('session', sessionId, {
            httpOnly: true,
        });

        return res
    } catch (error) {
        console.log(error);
        return NextResponse.json({ error: 'Error initiating passkey register' }, { status: 401 });
    }
}