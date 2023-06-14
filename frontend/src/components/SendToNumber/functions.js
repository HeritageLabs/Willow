/* eslint-disable no-throw-literal */
import { BigNumber } from "bignumber.js";
import { E164_REGEX } from "../../services/twilio";
import { OdisUtils } from "@celo/identity";
import { WebBlsBlindingClient } from "../webBlindingClient.ts";
import { toaster } from "evergreen-ui";
import { newKitFromWeb3 } from "@celo/contractkit";
import Web3 from 'web3';

const ISSUER_PRIVATE_KEY = process.env.REACT_APP_PRIVATE_KEY;
const DEK_PRIVATE_KEY = process.env.REACT_APP_DATA_ECRYPTIONKEY;

const web3 = new Web3("https://alfajores-forno.celo-testnet.org");
const kit = newKitFromWeb3(web3);

// let issuerKit,
// issuer,
// federatedAttestationsContract,
// odisPaymentContract;

//   get identifier
async function getIdentifier(phoneNumber, issuerKit, issuer, odisPaymentContract, network) {
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
    
    const serviceContext = OdisUtils.Query.getServiceContext('Alfajores');
      
      // const serviceContext = getServiceContext(OdisContextName.ALFAJORES);

      //check remaining quota
      // const { remainingQuota } = await OdisUtils?.Quota?.getPnpQuotaStatus(
      //   issuer.address,
      //   authSigner,
      //   serviceContext
      // );

      //increase quota if needed.
      // if (remainingQuota < 1) {
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
          enoughAllowance = approvalTxReceipt.status;
        } else {
          enoughAllowance = true;
        }
        console.log(issuer, 'enoughAllowance==>');
        // increase quota
        if (enoughAllowance) {
          const odisPayment = await odisPaymentContract
            .payInCUSD(issuer.address, ONE_CENT_CUSD)
            .sendAndWaitForReceipt();
          console.log('successfullt paid');
          console.log("odis payment tx status:", odisPayment.status);
          console.log("odis payment tx hash:", odisPayment.transactionHash);
        } else {
          throw "cUSD approval failed";
        }
      // }

      console.log('i am here agaian!!!!!!');
      const blindingClient = new WebBlsBlindingClient(
        serviceContext.odisPubKey
      );
      await blindingClient.init();
      console.log("fetching identifier for:", phoneNumber);
      // const response = await OdisUtils.Identifier.getObfuscatedIdentifier(
      //   phoneNumber,
      //   OdisUtils.Identifier.IdentifierPrefix.PHONE_NUMBER,
      //   issuer.address,
      //   authSigner,
      //   serviceContext,
      //   undefined,
      //   undefined,
      //   // blindingClient
      // );
      // const response = await OdisUtils.PhoneNumberIdentifier.getPhoneNumberIdentifier(
      //   phoneNumber,
      //   issuer.address,
      //   authSigner,
      //   serviceContext,
      //   undefined,
      // );
      // const response = await OdisUtils.

      // console.log(response);

      // console.log(phoneNumber,
      //   issuer.address,
      //   authSigner,
      //   OdisUtils.Query.getServiceContext('Alfajores'))
      // console.log(response);
      // console.log(`Obfuscated phone number: ${response.obfuscatedIdentifier}`);

      // console.log(
      //   `Obfuscated phone number is a result of: sha3('tel://${response.plaintextIdentifier}__${response.pepper}') => ${response.obfuscatedIdentifier}`
      // );

      // return response.obfuscatedIdentifier;
      toaster.success('Phone number successfully added');
    } catch (error) {
      throw `failed to get identifier: ${error}`;
    }
  }

export async function registerNumber(number, address, network, issuerKit, issuer, odisPaymentContract, federatedAttestationsContract) {
  try {
    const verificationTime = Math.floor(new Date().getTime() / 1000);
    console.log(verificationTime, '--> identifier');
    
    const identifier = await getIdentifier(number, issuerKit, issuer, odisPaymentContract, network);
    console.log(number, '--> number');
    
      // TODO: lookup list of issuers per phone number.
      // This could be a good example to have for potential issuers to learn about this feature.

      // const { accounts } =
      //   await federatedAttestationsContract?.lookupAttestations(identifier, [
      //     issuer.address,
      //   ]);
      // console.log(accounts);

      // if (accounts.length == 0) {
      //   const attestationReceipt = await federatedAttestationsContract
      //     ?.registerAttestationAsIssuer(identifier, address, verificationTime)
      //     ?.sendAndWaitForReceipt();
      //   console.log("attestation Receipt status:", attestationReceipt.status);
      //   console.log(
      //     `Register Attestation as issuer TX hash: ${network.explorer}/tx/${attestationReceipt?.transactionHash}/internal-transactions`
      //   );
      // } else {
      //   console.log("phone number already registered with this issuer");
      // }
    } catch (error) {
      throw `Error registering phone number: ${error}`;
    }
  }

  export const getBalance = async (address) => {
    let cUSDtoken = await kit.contracts.getStableToken();
    let cUSDBalance = await cUSDtoken.balanceOf(address);
    const getBalances = cUSDBalance.integerValue();
    return (Number(getBalances)/1e18).toFixed(2);
  }