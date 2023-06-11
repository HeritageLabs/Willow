import { Box, Flex, Text } from "@chakra-ui/react"
import { Dialog, Pane, toaster } from "evergreen-ui"
import React, { useState } from "react"
import TextInput from "../TextInputs/TextInput"
import CustomButton from "../CustomButton/customButton"
import { sendSmsVerificationToken, validatePhoneNumber } from "../../services/twilio";
import BigNumber from "bignumber.js";
import { useCelo } from "@celo/react-celo"
import { registerNumber } from "../SendToNumber/functions"


export const RegisterPhoneNumber = ({ isShown, setIsShown, address }) => {
  const { initialised, kit, connect, address: userAddress, destroy, network } = useCelo();
  const [phoneNumber, setPhoneNumber] = useState('');
  const [amount, setAmount] = useState('');
  const [activeIndex, setActiveIndex] = useState(0);
  const [invalidInput, setInvalidInput] = useState(false);
  const [isVerifying, setIsVerifying] = useState(false);

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
    await registerNumber(phoneNumber, address, network)
    .then((res) => {
      console.log(res);
      setActiveIndex(1);
    })
    .catch((err) => console.log(err));
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