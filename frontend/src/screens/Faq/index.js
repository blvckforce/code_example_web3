import React from "react";
import SEO from '../../components/SEO';
import Hero from "./Hero";
import HotBid from "../../components/HotBid";

const Faq = () => {
  return (
    <>
      <SEO title={'FAQ'} url={window.location.href} />
      <Hero />
      <HotBid classSection="section-pb" />
    </>
  );
};

export default Faq;
