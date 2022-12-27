import UAuth from '@uauth/js';

export const uauth = new UAuth(
    {
        clientID: "ddbb3508-fdc2-413a-80e9-ef313841f2f5",
        redirectUri: "http://localhost:3000/home",
        scope: "openid wallet email"
      }
);