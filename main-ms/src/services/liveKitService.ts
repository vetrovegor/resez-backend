import { AccessToken } from 'livekit-server-sdk';

class LiveKitService {
    async getToken(room: string, username: string) {
        const at = new AccessToken(
            process.env.LIVEKIT_API_KEY,
            process.env.LIVEKIT_API_SECRET,
            {
                identity: username,
                ttl: '10m'
            }
        );
        at.addGrant({ roomJoin: true, room });

        return await at.toJwt();
    }
}

export default new LiveKitService();
