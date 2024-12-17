import { JSONFileSyncPreset } from 'lowdb/node'
import type {
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

export interface Data {
    sessions: Session[];
    users: User[];
    passkeys: WebAuthnCredential[];
}

const defaultData: Data = { 
    sessions: [],
    users: [],
    passkeys: []
}

export default JSONFileSyncPreset<Data>('db.json', defaultData);