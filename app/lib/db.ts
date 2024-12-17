import { JSONFileSyncPreset } from 'lowdb/node'
import type {
    AuthenticatorTransportFuture,
    PublicKeyCredentialCreationOptionsJSON,
    WebAuthnCredential,
} from '@simplewebauthn/types';

export interface Session {
    uid?: string;
    username?: string;
    createPasskeyOpts?: PublicKeyCredentialCreationOptionsJSON;
    userPreReg?: User;
    loginPasskeyOpts?: PublicKeyCredentialRequestOptionsJSON;
    loggedIn?: boolean;
}

export interface User {
    uid: string;
    created_at?: number;
    email: string;
    name: string
    passkeys?: string[];
}

interface Passkey {
    id: Base64URLString;
    publicKey: string;
    counter: number;
    transports?: AuthenticatorTransportFuture[];
}

export interface Data {
    sessions: Session[];
    users: User[];
    passkeys: Passkey[];
}

const defaultData: Data = { 
    sessions: [],
    users: [],
    passkeys: []
}

export default JSONFileSyncPreset<Data>('db.json', defaultData);