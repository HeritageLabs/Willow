/* eslint-disable react-hooks/exhaustive-deps */
import { Box, Text } from "@chakra-ui/react"
import { Dialog, Pane } from "evergreen-ui"
import React, { useEffect, useState } from "react"
import TextInput from "../TextInputs/TextInput"
import CustomButton from "../CustomButton/customButton"
import { newKit } from "@celo/contractkit";
import { sendSmsVerificationToken, validatePhoneNumber } from "../../services/twilio";
import BigNumber from "bignumber.js";
import { OdisUtils } from "@celo/identity";
import { useCelo } from "@celo/react-celo"
import { registerNumber } from "../SendToNumber/functions";


export const RegisterPhoneNumber = ({ isShown, setIsShown, address }) => {
  const { initialised, address: userAddress, network } = useCelo();
  let [componentInitialized, setComponentInitialized] = useState(false);
  const [phoneNumber, setPhoneNumber] = useState('');
  const [amount, setAmount] = useState('');
  const [activeIndex, setActiveIndex] = useState(0);
  const [invalidInput, setInvalidInput] = useState(false);
  const [isVerifying, setIsVerifying] = useState(false);

  console.log(OdisUtils.Query.getServiceContext('Alfajores'));

  const ISSUER_PRIVATE_KEY = process.env.REACT_APP_PRIVATE_KEY;

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
    };
    intializeIssuer();
  });

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
      setActiveIndex(1);
      setIsShown(false);
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

         <CustomButton m="15px 0" w="100%" bg="brand.yellow" onClick={registerPhone} isLoading={isVerifying}>Register!</CustomButton>
          </Box>
          </Box>
        </Dialog>
      </Pane>
    )
  }