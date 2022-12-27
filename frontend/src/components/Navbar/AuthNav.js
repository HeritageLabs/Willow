import { Button, Flex, Image, Text } from "@chakra-ui/react";
import { toaster } from "evergreen-ui";
import brandLogo from "../../assets/icons/brand-logo.svg";
import { logoutIcon } from "../../assets/svgs/svg";
import { logout } from "../../firebase";
import { Menu, MenuButton, MenuList, MenuItem } from "@chakra-ui/react";
import { ChevronDownIcon } from "@chakra-ui/icons";

const AuthNav = () => {
  const walletAddr = localStorage.getItem("wallet_addr");
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
          {/* <a href="/view-plants">
                <Text style={{ transition: "all 0.8s ease" }} cursor="pointer" _hover={{ color: "brand.yellow" }}>
                  My Profile
                </Text>
              </a> */}
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
          Earnings: $0.000
        </Text>
        <Flex justifyContent="space-evenly" alignItems="center">
          <Menu>
            <MenuButton as={Button} rightIcon={<ChevronDownIcon />}>
              <Text fontWeight="medium" fontSize="14px">
                {walletAddr.substring(0, 10)}...
              </Text>
            </MenuButton>
            <MenuList>
              <MenuItem>
                <Flex
                  alignItems="center"
                  style={{ transition: "all 0.8s ease" }}
                  cursor="pointer"
                  ml="10px"
                  onClick={logout}
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
