import db, { Session } from './db';
import { v4 as uuidv4 } from 'uuid';
import { NextRequest } from 'next/server';

export const getSession = async (req: NextRequest): Promise<Session| null> => {
    const sessionCookie = req.cookies.get('session');
    if (!sessionCookie) {
        return null;
    }

    return db.data.sessions.find((session) => session.uid === sessionCookie.value) || null;
}

export const saveSession = (session: Session): string => {
    const uid = uuidv4();
    session.uid = uid;
    db.data.sessions.push(session);
    db.write();

    return uid;
}