/* eslint-disable react-hooks/exhaustive-deps */
import { Button, Flex, Image, Text } from "@chakra-ui/react";
import { toaster } from "evergreen-ui";
import brandLogo from "../../assets/icons/brand-logo.svg";
import { logoutIcon } from "../../assets/svgs/svg";
import { logout } from "../../firebase";
import { Menu, MenuButton, MenuList, MenuItem } from "@chakra-ui/react";
import { ChevronDownIcon } from "@chakra-ui/icons";
import { useCelo } from "@celo/react-celo";
import { useEffect, useState } from "react";
import Web3 from 'web3';
import { masa } from "../../utils/methods";

const AuthNav = () => {
  const { disconnect, address } = useCelo();
  const [userSoulName, setUserSoulName] = useState('');
  const walletAddr = localStorage.getItem("wallet_addr");
  const [balance, setBalance] = useState(0);


  useEffect(() => {
    async function fetchTotalBalance() {
      const web3 = new Web3("https://alfajores-forno.celo-testnet.org");
      const balanceInWei = await web3.eth.getBalance(address);
      const balanceInCelo = web3.utils.fromWei(balanceInWei, "ether");
      setBalance(Number(balanceInCelo).toFixed(2));
    }

    async function resolveMasa() {
      const [soulNames, extension] = await Promise.all([
        masa.soulName.loadSoulNames(address),
        masa.contracts.instances.SoulNameContract.extension(),
        ]);
  
    if (soulNames.length > 0) {
      console.log("Soul names:", "\n");
      soulNames.forEach((soulName) => {
        // console.log(`${soulName}${extension}`)
        setUserSoulName(`${soulName}${extension}`);
        localStorage.setItem('soul_name', `${soulName}${extension}`);
      }
    );
    } else {
      console.log(`No soul names for ${address}`);
    }
    }

    fetchTotalBalance();
    resolveMasa();
  }, []);

  console.log(userSoulName, '--> soul name');

  return (
    <Flex
      bg="brand.green"
      p="15px 80px"
      alignItems="center"
      justifyContent="space-between"
      fontSize="14px"
    >
      <Flex alignItems="center" color="brand.white">
        <a href="/home">
          <Image cursor="pointer" src={brandLogo} alt="brand-logo" />
        </a>
        <Flex alignItems="center" ml="120px">
          <a href="/experts">
            <Text
              mr="50px"
              style={{ transition: "all 0.8s ease" }}
              cursor="pointer"
              _hover={{ color: "brand.yellow" }}
            >
              View Experts
            </Text>
          </a>
          <Text
            mr="50px"
            style={{ transition: "all 0.8s ease" }}
            cursor="pointer"
            _hover={{ color: "brand.yellow" }}
            onClick={() => toaster.success("Coming soon", { id: "mess" })}
          >
            Market Place
          </Text>
          <a href="https://dev.app.prosperity.global/" target="_blank" rel="noreferrer">
                <Text style={{ transition: "all 0.8s ease" }} cursor="pointer" _hover={{ color: "brand.yellow" }}>
                  Mint domain
                </Text>
          </a>
        </Flex>
      </Flex>
      <Flex alignItems="center">
        <Text
          mr="50px"
          style={{ transition: "all 0.8s ease" }}
          cursor="pointer"
          _hover={{ color: "brand.yellow" }}
          color="brand.yellow"
        >
          Earnings: {balance} CELO
        </Text>
        <Flex justifyContent="space-evenly" alignItems="center">
          <Menu>
            <MenuButton as={Button} rightIcon={<ChevronDownIcon />}>
              <Text fontWeight="medium" fontSize="14px">
                { userSoulName || `${walletAddr?.substring(0, 10)}...` || 'Settings'}
              </Text>
            </MenuButton>
            <MenuList>
              <MenuItem onClick={() => logout(disconnect)}>
                <Flex
                  alignItems="center"
                  style={{ transition: "all 0.8s ease" }}
                  cursor="pointer"
                  ml="10px"
                >
                  {logoutIcon}
                  <Text
                    ml="10px"
                    color="dark"
                    style={{ transition: "all 0.8s ease" }}
                  >
                    Logout
                  </Text>
                </Flex>
              </MenuItem>
            </MenuList>
          </Menu>
        </Flex>
      </Flex>
    </Flex>
  );
};

export default AuthNav;
