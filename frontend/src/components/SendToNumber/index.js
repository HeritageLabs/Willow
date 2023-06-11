/* eslint-disable no-throw-literal */
/* eslint-disable react-hooks/exhaustive-deps */
import React, { useEffect, useState } from "react";
import { useCelo } from "@celo/react-celo";
import { BigNumber } from "bignumber.js";
import { Box, Flex, Text } from "@chakra-ui/react";
import { newKit } from "@celo/contractkit";
import { E164_REGEX } from "../../services/twilio";
import { OdisUtils } from "@celo/identity";
import { IdentifierPrefix } from "@celo/identity/lib/odis/identifier";
import {
    AuthSigner,
    getServiceContext,
    OdisContextName,
  } from "@celo/identity/lib/odis/query";
import WebBlsBlindingClient from "../webBlindingClient";

const SendToNumberComp = () => {
    let [componentInitialized, setComponentInitialized] = useState(false);
    const { initialised, kit, connect, address, destroy, network } = useCelo();

    const ISSUER_PRIVATE_KEY = '28ce5b53707480602133b3b09456c7a5be78dcedd0f968d090f310328d1f911b';
    const DEK_PRIVATE_KEY = '0x03e39f532520b1f6e7f6127c12429998d30a12afd35a5ab241559f03c35e96f5a3';

    let issuerKit,
    issuer,
    federatedAttestationsContract,
    odisPaymentContract;

    // State that opens modal
    const [isRegisterNumberModalOpen, setIsRegisterNumberModalOpen] =
    useState(false);
  const [isSendToNumberModalOpen, setIsSendToNumberModalOpen] = useState(false);
  const [isDeregisterNumberModalOpen, setIsDeregisterNumberModalOpen] =
    useState(false);

  useEffect(() => {
    if (initialised) {
      setComponentInitialized(true);
    }
  }, [initialised]);

  useEffect(() => {
    const intializeIssuer = async () => {
      issuerKit = newKit(network.rpcUrl);
      issuer =
        issuerKit.web3.eth.accounts.privateKeyToAccount(ISSUER_PRIVATE_KEY);
      issuerKit.addAccount(ISSUER_PRIVATE_KEY);
      issuerKit.defaultAccount = issuer.address;
      federatedAttestationsContract =
        await issuerKit.contracts.getFederatedAttestations();
      odisPaymentContract = await issuerKit.contracts.getOdisPayments();
    };
    intializeIssuer();
  });

//   get identifier
  async function getIdentifier(phoneNumber) {
    try {
      if (!E164_REGEX.test(phoneNumber)) {
        throw "Attempting to hash a non-e164 number: " + phoneNumber;
      }
      const ONE_CENT_CUSD = issuerKit.web3.utils.toWei("0.01", "ether");

      let authMethod = OdisUtils.Query.AuthenticationMethod.ENCRYPTION_KEY;
      const authSigner = {
        authenticationMethod: authMethod,
        rawKey: DEK_PRIVATE_KEY,
      };

      const serviceContext = getServiceContext(OdisContextName.ALFAJORES);

      //check remaining quota
      const { remainingQuota } = await OdisUtils.Quota.getPnpQuotaStatus(
        issuer.address,
        authSigner,
        serviceContext
      );

      //increase quota if needed.
      console.log("remaining ODIS quota", remainingQuota);
      if (remainingQuota < 1) {
        // give odis payment contract permission to use cUSD
        const cusd = await issuerKit.contracts.getStableToken();
        const currrentAllowance = await cusd.allowance(
          issuer.address,
          odisPaymentContract.address
        );
        console.log("current allowance:", currrentAllowance.toString());
        let enoughAllowance = false;

        if (currrentAllowance < BigNumber(ONE_CENT_CUSD)) {
          const approvalTxReceipt = await cusd
            .increaseAllowance(odisPaymentContract.address, ONE_CENT_CUSD)
            .sendAndWaitForReceipt();
          console.log("approval status", approvalTxReceipt.status);
          enoughAllowance = approvalTxReceipt.status;
        } else {
          enoughAllowance = true;
        }

        // increase quota
        if (enoughAllowance) {
          const odisPayment = await odisPaymentContract
            .payInCUSD(issuer.address, ONE_CENT_CUSD)
            .sendAndWaitForReceipt();
          console.log("odis payment tx status:", odisPayment.status);
          console.log("odis payment tx hash:", odisPayment.transactionHash);
        } else {
          throw "cUSD approval failed";
        }
      }

      const blindingClient = new WebBlsBlindingClient(
        serviceContext.odisPubKey
      );
      await blindingClient.init();
      console.log("fetching identifier for:", phoneNumber);
      const response = await OdisUtils.Identifier.getObfuscatedIdentifier(
        phoneNumber,
        IdentifierPrefix.PHONE_NUMBER,
        issuer.address,
        authSigner,
        serviceContext,
        undefined,
        undefined,
        blindingClient
      );

      console.log(`Obfuscated phone number: ${response.obfuscatedIdentifier}`);

      console.log(
        `Obfuscated phone number is a result of: sha3('tel://${response.plaintextIdentifier}__${response.pepper}') => ${response.obfuscatedIdentifier}`
      );

      return response.obfuscatedIdentifier;
    } catch (error) {
      throw `failed to get identifier: ${error}`;
    }
  }

// registerNumber
async function registerNumber(number) {
    try {
      const verificationTime = Math.floor(new Date().getTime() / 1000);

      const identifier = await getIdentifier(number);
      console.log(identifier);

      // TODO: lookup list of issuers per phone number.
      // This could be a good example to have for potential issuers to learn about this feature.

      const { accounts } =
        await federatedAttestationsContract.lookupAttestations(identifier, [
          issuer.address,
        ]);
      console.log(accounts);

      if (accounts.length == 0) {
        const attestationReceipt = await federatedAttestationsContract
          .registerAttestationAsIssuer(identifier, address, verificationTime)
          .sendAndWaitForReceipt();
        console.log("attestation Receipt status:", attestationReceipt.status);
        console.log(
          `Register Attestation as issuer TX hash: ${network.explorer}/tx/${attestationReceipt.transactionHash}/internal-transactions`
        );
      } else {
        console.log("phone number already registered with this issuer");
      }
    } catch (error) {
      throw `Error registering phone number: ${error}`;
    }
  }

//   send to number
async function sendToNumber(number, amount) {
    try {
      const identifier = await getIdentifier(number);
      const amountInWei = issuerKit.web3.utils.toWei(amount, "ether");

      const attestations =
        await federatedAttestationsContract.lookupAttestations(identifier, [
          issuer.address,
        ]);

      // TODO: handle when no accounts mapped to number

      const CELO = await kit.contracts.getGoldToken();
      await CELO.transfer(
        attestations.accounts[0],
        amountInWei
      ).sendAndWaitForReceipt({ gasPrice: 20000000000 });
    } catch (error) {
      throw `Failed to send funds to ${number}: ${error}`;
    }
  }

//   deregister number
  async function deregisterPhoneNumber(phoneNumber) {
    try {
      const identifier = await getIdentifier(phoneNumber);
      const receipt = await federatedAttestationsContract
        .revokeAttestation(identifier, issuer.address, address)
        .sendAndWaitForReceipt();
      console.log(
        `revoke attestation transaction receipt status: ${receipt.status}`
      );
    } catch (error) {
      throw `Failed to deregister phone number: ${error}`;
    }
  }

    return (
        <Box>
            <Text>Send to number</Text>
        </Box>
    )
};

export default SendToNumberComp;