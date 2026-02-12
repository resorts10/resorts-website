import Newsletter from "../Common/Newsletter";
import Hero from "./Hero";
import FooterFeature from "./Hero/FooterFeature";
import Testimonials from "./Testimonials";

const Home = () => {
  return (
    <main>
      <Hero />
      <Testimonials />
      <Newsletter />
      <FooterFeature />
    </main>
  );
};

export default Home;
