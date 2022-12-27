import UAuth from '@uauth/js';

export const uauth = new UAuth(
    {
        clientID: process.env.REACT_APP_UD_CLIENT_ID,
        redirectUri: process.env.REACT_APP_REDIRECT_URI,
        scope: "openid wallet email"
      }
);