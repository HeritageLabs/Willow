/* eslint-disable react-hooks/exhaustive-deps */
import { Box, Flex, Text } from "@chakra-ui/react"
import { Dialog, Pane, toaster } from "evergreen-ui"
import React, { useEffect, useState } from "react"
import TextInput from "../TextInputs/TextInput"
import CustomButton from "../CustomButton/customButton"
import { newKit } from "@celo/contractkit";
import { sendSmsVerificationToken, validatePhoneNumber } from "../../services/twilio";
import BigNumber from "bignumber.js";
import { useCelo } from "@celo/react-celo"
import { registerNumber } from "../SendToNumber/functions";
import { OdisUtils } from "@celo/identity";
// import { IdentifierPrefix } from "@celo/identity/lib/odis/identifier";
import {
  AuthSigner,
  getServiceContext,
  OdisContextName,
} from "@celo/identity/lib/odis/query";


export const RegisterPhoneNumber = ({ isShown, setIsShown, address }) => {
  console.log(OdisUtils, '--> udis');
  // console.log(OdisContextName, '--> udis //');
  const { initialised, kit, connect, address: userAddress, destroy, network } = useCelo();
  let [componentInitialized, setComponentInitialized] = useState(false);
  const [phoneNumber, setPhoneNumber] = useState('');
  const [amount, setAmount] = useState('');
  const [activeIndex, setActiveIndex] = useState(0);
  const [invalidInput, setInvalidInput] = useState(false);
  const [isVerifying, setIsVerifying] = useState(false);

  // console.log(OdisUtils);

  const ISSUER_PRIVATE_KEY = '28ce5b53707480602133b3b09456c7a5be78dcedd0f968d090f310328d1f911b';
const DEK_PRIVATE_KEY = '0x03e39f532520b1f6e7f6127c12429998d30a12afd35a5ab241559f03c35e96f5a3';

  let issuerKit, issuer, federatedAttestationsContract, odisPaymentContract;

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
        // console.log(issuerKit, 'issuerKit');
    };
    intializeIssuer();
  });

  // console.log(network);

  const handleSendVerifyText = async () => {
    setIsVerifying(true);
    if (!validatePhoneNumber(phoneNumber)) {
      setInvalidInput(true);
      setIsVerifying(false);
      return;
    }
    await sendSmsVerificationToken(phoneNumber)
    .then((res) => console.log(res))
    .catch((err) => console.log(err))
    setInvalidInput(false);
    // toaster.success('A verification code has been sent to your phone number', { id: 'mess', duration: 1000 })
    // setActiveIndex(1);
    setIsVerifying(false);
  }

  const registerPhone = async () => {
    setIsVerifying(true);
    await registerNumber(phoneNumber, address, network, issuerKit, issuer, odisPaymentContract, federatedAttestationsContract)
    .then((res) => {
      console.log(res);
      setActiveIndex(1);
    })
    .catch((err) => console.log(err))
    .finally(() => setIsVerifying(false));
  }
  
  async function handleSend() {
    if (!new BigNumber(amount).isGreaterThan(0)) {
      setInvalidInput(true);
      return;
    }
    setActiveIndex(2);
    // await sendToNumber(phoneNumber, amount);
    // setIsVerifying(false);
  }
    return (
      <Pane>
        <Dialog
          isShown={isShown}
          title="Send and Register Your Phone Number"
          onCloseComplete={() => setIsShown(false)}
          hasFooter={false}
        >
          <Box>
            <Text fontSize="12px" bg="brand.primary" py="5px" px="10px" rounded="8px" color="white" w="fit-content">Connected User: {address}</Text>

            <Box mb="40px" bg="none" color="black" fontWeight="600" p="10px 20px" alignItems="center" justifyContent="center" borderRadius="8px" cursor="pointer" _hover={{ bg: "brand.lightGrey" }} mt="30px" boxShadow="rgba(0, 0, 0, 0.05) 0px 6px 24px 0px, rgba(0, 0, 0, 0.08) 0px 0px 0px 1px" fontSize="14px">
            <Text ml="">Register your phone number</Text>
            <TextInput placeholder="e.g. +2348136653463" label="Phone number" onChange={({ target }) => { setPhoneNumber(target.value); setInvalidInput(false); }} pattern="[0-9]*" type="text" keyDown={true} disabled={activeIndex == 1} />
            <Text color="red" fontSize="12px">{invalidInput && 'Not a valid phone number! Make sure you include the country code'}</Text>
            
            {activeIndex == 1 && (
              <TextInput placeholder="Enter amount to send in CELO" label="Amount (CELO)" onChange={({ target }) => { setAmount(target.value); setInvalidInput(false); }} pattern="[0-9]*" type="text" keyDown={true} disabled={activeIndex == 1} />
            )}

            {/* {activeIndex == 1 && (
              <TextInput placeholder="Enter the code sent to your phone number" label="Verification code" onChange={({ target }) => { setPhoneNumber(target.value); setInvalidInput(false) }} pattern="[0-9]*" type="text" keyDown={true} />
            )} */}
         <CustomButton m="15px 0" w="100%" bg="brand.yellow" onClick={registerPhone} isLoading={isVerifying}>Register!</CustomButton>
            {/* <CustomButton m="15px 0" w="100%" bg="brand.yellow" onClick={handleSend} isLoading={isVerifying}>Send!</CustomButton> */}
          </Box>
          </Box>
        </Dialog>
      </Pane>
    )
  }