import UAuth from '@uauth/js';
import { Masa } from "@masa-finance/masa-sdk";
import { providers } from "ethers";

export const uauth = new UAuth(
    {
        clientID: process.env.REACT_APP_UD_CLIENT_ID,
        redirectUri: process.env.REACT_APP_REDIRECT_URI,
        scope: "openid wallet email"
      }
);

const provider = new providers.Web3Provider(window.ethereum);
const signer = provider.getSigner();

export const masa = new Masa({
  signer,
  networkName: "alfajores",
});