import * as WebBrowser from 'expo-web-browser';
import * as AuthSession from 'expo-auth-session';
import { UserProfile } from '@/types/user';
import { loginWithGoogle } from './authService';

WebBrowser.maybeCompleteAuthSession();

const GOOGLE_CLIENT_ID =
  process.env.EXPO_PUBLIC_GOOGLE_CLIENT_ID ||
  '207567085375-5f9tgbkigp9mm8blqjf116bh6lu8719r.apps.googleusercontent.com';

/**
 * Fetches Google User Profile with an Access Token and logs in
 */
export async function fetchGoogleUserInfo(accessToken: string): Promise<UserProfile | null> {
  try {
    const userInfoRes = await fetch('https://www.googleapis.com/userinfo/v2/me', {
      headers: { Authorization: `Bearer ${accessToken}` },
    });

    if (userInfoRes.ok) {
      const googleData = await userInfoRes.json();
      return await loginWithGoogle({
        email: googleData.email,
        name: googleData.name || googleData.email.split('@')[0],
        photoUrl: googleData.picture,
      });
    }
    return null;
  } catch (error) {
    console.warn('[Google Auth] Error fetching user info:', error);
    return null;
  }
}

/**
 * Executes Google OAuth sign-in flow using scheme-based AuthSession
 */
export async function executeGoogleAuth(): Promise<UserProfile | null> {
  try {
    const redirectUri = AuthSession.makeRedirectUri({
      scheme: 'civiclens',
      preferLocalhost: true,
    });

    const request = new AuthSession.AuthRequest({
      clientId: GOOGLE_CLIENT_ID,
      scopes: ['openid', 'profile', 'email'],
      redirectUri,
      responseType: AuthSession.ResponseType.Token,
    });

    const discovery = {
      authorizationEndpoint: 'https://accounts.google.com/o/oauth2/v2/auth',
      tokenEndpoint: 'https://oauth2.googleapis.com/token',
      revocationEndpoint: 'https://oauth2.googleapis.com/revoke',
    };

    const result = await request.promptAsync(discovery);

    if (result.type === 'success' && result.params?.access_token) {
      return await fetchGoogleUserInfo(result.params.access_token);
    }

    return null;
  } catch (error) {
    console.warn('[Google Auth] Error during OAuth session:', error);
    return null;
  }
}

