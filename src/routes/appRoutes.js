import React from "react";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { render } from "react-dom";
import { ChakraProvider } from "@chakra-ui/react";
import theme from "../theme";
import LandingPage from "../pages/LandingPage";
import SignUp from "../pages/SignUp";
import Login from "../pages/Login";
import Home from "../pages/Home";
import ExpertHome from "../pages/ExpertHome";
import PlantNow from "../pages/PlantNow";
import InvitePending from "../pages/InvitePending";
import UploadVideo from "../pages/UploadVideo";
import SuccessUpload from "../pages/SuccessfulUpload";
import AllExperts from "../pages/AllExperts";
import ForgotPassword from "../pages/ForgotPassword";
import ViewPlants from "../pages/ViewPlants";
import { CeloProvider, Alfajores } from "@celo/react-celo";

const AppRoute = () => {

  return render(
    <BrowserRouter>
     <ChakraProvider theme={theme} resetCSS>
     <CeloProvider
                dapp={{
                  name: "Willow App",
                  description: "This app allows you to register a number with Celo",
                  url: "https://willow-li.vercel.app/",
                  icon: ""
                }}
                defaultNetwork={Alfajores.name}
              >
      <Routes>
        <Route index path="/" element={
        <LandingPage />
        } />
        <Route path="/signup" element={<SignUp />} />
        <Route path="/login" element={<Login />} />
        <Route path="/home" element={<Home />} />
        <Route path="/expert-home" element={<ExpertHome />} />
        <Route path="/plant-now/:id" element={<PlantNow />} />
        <Route path="/invite-pending" element={<InvitePending />} />
        <Route path="/upload-video" element={<UploadVideo />} />
        <Route path="/success" element={<SuccessUpload />} />
        <Route path="/experts" element={<AllExperts />} />
        <Route path="/forgot-password" element={<ForgotPassword />} />
        <Route path="/view-plants/:id" element={<ViewPlants />} />
      </Routes>
              </CeloProvider>
     </ChakraProvider>
    </BrowserRouter>,
    document.getElementById("root")
  );
};

export default AppRoute;
