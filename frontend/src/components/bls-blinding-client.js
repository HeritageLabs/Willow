/* eslint-disable no-unused-vars */
import React, { useEffect, useState } from 'react';
import { randomBytes } from 'crypto';
import thresholdBls from 'blind-threshold-bls';

const WebBlsBlindingClient = ({ odisPubKey }) => {
  const [blindedValue, setBlindedValue] = useState();
  const [rawMessage, setRawMessage] = useState();

  useEffect(() => {
    const init = async () => {
      await thresholdBls.init('/blind_threshold_bls_bg.wasm');
    };
    init();
  }, []);

  const blindMessage = async (base64PhoneNumber, seed) => {
    const userSeed = seed || randomBytes(32);
    if (!seed) {
      console.warn(
        'Warning: Use a private deterministic seed (e.g. DEK private key) to preserve user quota when requests are replayed.'
      );
    }
    const rawMessage = Buffer.from(base64PhoneNumber, 'base64');
    const blindedValue = await thresholdBls.blind(rawMessage, userSeed);
    setRawMessage(rawMessage);
    setBlindedValue(blindedValue);
    const blindedMessage = blindedValue.message;
    return Buffer.from(blindedMessage).toString('base64');
  };

  const unblindAndVerifyMessage = async (base64BlindSig) => {
    if (!rawMessage || !blindedValue) {
      throw new Error('Must call blind before unblinding');
    }

    const blindedSignature = Buffer.from(base64BlindSig, 'base64');
    const unblindMessage = await thresholdBls.unblind(
      blindedSignature,
      blindedValue.blindingFactor
    );
    // this throws on error
    await thresholdBls.verify(odisPubKey, rawMessage, unblindMessage);
    return Buffer.from(unblindMessage).toString('base64');
  };

  const isReactNativeEnvironment = () => {
    return typeof navigator !== 'undefined' && navigator.product === 'ReactNative';
  };

  return null; // Replace with your desired component JSX
};

export default WebBlsBlindingClient;
