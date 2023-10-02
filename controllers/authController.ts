import { OAuth2Client } from "google-auth-library";

async function verifyGoogleToken(idToken: string, clientId: string) {
    const client = new OAuth2Client(clientId);

    try {
        const ticket = await client.verifyIdToken({
            idToken: idToken,
            audience: clientId,
        });
        const payload = ticket.getPayload()!;
        const userId = payload.sub;
        const userEmail = payload.email;
        return { userId, userEmail };
    } catch (error) {
        throw new Error('Invalid Google ID token');
    }
}

export { verifyGoogleToken };
