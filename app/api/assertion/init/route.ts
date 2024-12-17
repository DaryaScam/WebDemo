import { NextRequest, NextResponse } from 'next/server';
import { saveSession } from '@/app/lib/middleware';

import {
    generateAuthenticationOptions,
} from '@simplewebauthn/server';
import db from '@/app/lib/db';


export async function POST(
    req: NextRequest,
) {
    try {
        const { email } = await req.json();

        const user = db.data.users.find((user) => user.email === email);
        if (!user) {
            return NextResponse.json({ error: 'User not found' }, { status: 401 });
        }

        // Generate options
        let opts = await generateAuthenticationOptions({
            rpID: process.env.RPID!,
            allowCredentials: user.passkeys!.map((id) => ({id})),
        });

        // Save options to session
        const res = NextResponse.json({ status: 'ok', optionsJSON: opts }, { status: 200 });
        const sessionId = saveSession({
            loginPasskeyOpts: opts,
            username: user.email,
        });

        res.cookies.set('session', sessionId, {
            httpOnly: true,
        });

        return res
    } catch (error) {
        console.log(error);
        return NextResponse.json({ error: 'Error initiating passkey auth' }, { status: 401 });
    }
}