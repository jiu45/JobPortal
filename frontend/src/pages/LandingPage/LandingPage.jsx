import { useEffect } from "react";
import toast from "react-hot-toast";
import Analytics from "./components/Analytics";
import Features from "./components/Features";
import Footer from "./components/Footer";
import Header from "./components/Header";
import Hero from "./components/Hero";


const LandingPage = () => {
  useEffect(() => {
    const msg = sessionStorage.getItem("AUTH_TOAST");
    if (msg) {
      toast.error(msg);
      sessionStorage.removeItem("AUTH_TOAST");
    }
  }, []);
  return (
    <div className="min-h-screen">
      <Header />
      <Hero />
      <Features />
      <Analytics/>  
      <Footer/>

    </div>
  );
};
export default LandingPage;
