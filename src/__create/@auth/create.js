import { getToken } from '@auth/core/jwt';
import { getContext } from 'hono/context-storage';
import { getServerConfig } from '@/lib/config';

export default function CreateAuth() {
	const auth = async () => {
		const c = getContext();
		const cfg = getServerConfig();
		const token = await getToken({
			req: c.req.raw,
			secret: cfg.AUTH_SECRET,
			secureCookie: (cfg.AUTH_URL || '').startsWith('https'),
		});
		if (token) {
			return {
				user: {
					id: token.sub,
					email: token.email,
					name: token.name,
					image: token.picture,
				},
				expires: token.exp.toString(),
			};
		}
	};
	return {
		auth,
	};
}
