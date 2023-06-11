import Web3 from "web3";
import { newKit, newKitFromWeb3 } from "@celo/contractkit";
import { OdisUtils } from "@celo/identity";
import { AuthSigner, OdisContextName } from "@celo/identity/lib/odis/query";

const ISSUER_PRIVATE_KEY = 'd23abda447000cf6a59aefadd7d14baf514172f03a372caa441afdb58b0752d2';

const kit = await newKit("https://alfajores-forno.celo-testnet.org");
kit.addAccount(ISSUER_PRIVATE_KEY);
const issuerAddress =
    kit.web3.eth.accounts.privateKeyToAccount(ISSUER_PRIVATE_KEY).address;
kit.defaultAccount = issuerAddress;

// information provided by user, issuer should confirm they do own the identifier
const userPlaintextIdentifier = "+2348136653463";
const userAccountAddress = "0x7ac6eBebc791CcCcCde2828682B63FbCDB5E34c2";

// time at which issuer verified the user owns their identifier
const attestationVerifiedTime = Date.now();

// authSigner provides information needed to authenticate with ODIS
const authSigner: AuthSigner = {
    authenticationMethod: OdisUtils.Query.AuthenticationMethod.WALLET_KEY,
    contractKit: kit,
};
// serviceContext provides the ODIS endpoint and public key
const serviceContext = OdisUtils.Query.getServiceContext(
    OdisContextName.ALFAJORES
);

// check existing quota on issuer account
const { remainingQuota } = await OdisUtils.Quota.getPnpQuotaStatus(
    issuerAddress,
    authSigner,
    serviceContext
);

// if needed, approve and then send payment to OdisPayments to get quota for ODIS
if (remainingQuota < 1) {
    const stableTokenContract = await kit.contracts.getStableToken();
    const odisPaymentsContract = await kit.contracts.getOdisPayments();
    const ONE_CENT_CUSD_WEI = 10000000000000000;
    await stableTokenContract
        .increaseAllowance(odisPaymentsContract.address, ONE_CENT_CUSD_WEI)
        .sendAndWaitForReceipt();
    const odisPayment = await odisPaymentsContract
        .payInCUSD(issuerAddress, ONE_CENT_CUSD_WEI)
        .sendAndWaitForReceipt();
}

// get obfuscated identifier from plaintext identifier by querying ODIS
const { obfuscatedIdentifier } =
    await OdisUtils.Identifier.getObfuscatedIdentifier(
        plaintextIdentifier,
        OdisUtils.Identifier.IdentifierPrefix.PHONE_NUMBER,
        issuerAddress,
        authSigner,
        serviceContext
    );