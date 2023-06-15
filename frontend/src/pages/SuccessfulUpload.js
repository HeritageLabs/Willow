import { Box, Flex, Image, Text } from "@chakra-ui/react";
import AuthNav from "../components/Navbar/AuthNav";
import Congrats from "../assets/images/congrats.png";
import CustomButton from "../components/CustomButton/customButton";
import Money from "../assets/icons/money-bag.png";
import { Dialog, Pane, toaster } from "evergreen-ui";
import { useState } from "react";
import TextInput from "../components/TextInputs/TextInput";
import { useCelo } from "@celo/react-celo";
import { E164_REGEX } from "../services/twilio";
import { newKitFromWeb3 } from "@celo/contractkit";
import Web3 from 'web3';
import { useNavigate } from "react-router-dom";

const SuccessUpload = () => {
  const navigate = useNavigate();
  const { address } = useCelo();
  const [isDialogShown, setIsDialogShown] = useState(false);
  const [invalidInput, setInvalidInput] = useState(false);
  const [phoneNumber, setPhoneNumber] = useState('');
  const [isSending, setIsSending] = useState(false);

  const web3 = new Web3("https://alfajores-forno.celo-testnet.org");
  let kit;

  const claimToken = async () => {
    try {
      setIsSending(true);
      if (!E164_REGEX.test(phoneNumber)) {
        setInvalidInput(true);
        setIsSending(false);
      } else {
        kit = newKitFromWeb3(web3);

  kit.connection.addAccount(process.env.REACT_APP_PRIVATE_KEY);
  const tx = await kit.connection.sendTransaction({
    from: process.env.REACT_APP_ADDRESS,
    to: address,
    value: 0.01 * 1e18
  })
 await tx.getHash();
await tx.waitReceipt();

  setIsSending(false);
  toaster.success('You have been rewarded successfully');
  navigate('/home');
      }
} catch (error) {
  toaster.danger('Error occured');
  setIsSending(false);
}
  }

  return (
    <Box>
      <AuthNav />
      <Pane>
        <Dialog
          isShown={isDialogShown}
          title="Claim your token"
          onCloseComplete={() => setIsDialogShown(false)}
          hasFooter={false}
        >
          <Box mb="20px">
            <TextInput placeholder="Enter the code sent to your phone number" label="Verification code" pattern="[0-9]*" type="text" onChange={({ target }) => { setPhoneNumber(target.value); setInvalidInput(false) } } />
            {invalidInput && (
              <Text fontSize="10px" my="5px" color="red">Please enter a valid tel with your country code!</Text>
            )}
            <CustomButton m="15px 0" w="100%" bg="brand.yellow" onClick={claimToken} isLoading={isSending}  onChange={({ target }) => { setPhoneNumber(target.value); setInvalidInput(false) }}>Claim!</CustomButton>
          </Box>
        </Dialog>
      </Pane>
      <Box w="100%" p="30px" textAlign="center" mt="120px">
        <Image mx="auto" src={Congrats} h="200px" alt="congrats" />
        <Box mt="50px" w="100%">
          <Text fontWeight="bold" fontSize="20px" color="brand.lightGreen">
            Congratulations
          </Text>
          <Text fontWeight="thin">
            You've succesfully supported the ecosystem
          </Text>
          <Flex alignItems="center" justifyContent="center" mt="30px">
            <Text fontSize="12px" color="brand.lightGreen">NB: Ensure to upload a video and image of your trees quarterly to get rewarded</Text>
            <Image ml="20px" src={Money} w={25} h={25} alt="money-bag" />
          </Flex>

          <Box mt="20px">
              <CustomButton
                bg="brand.orange"
                color="brand.white"
                hoverBg="brand.lightGreen"
                mx="auto"
                w="30%"
                onClick={() => setIsDialogShown(true)}
              >
                <Text fontWeight="medium">Claim token</Text>
              </CustomButton>
          </Box>
        </Box>
      </Box>
    </Box>
  );
};

export default SuccessUpload;
