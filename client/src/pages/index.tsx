import styles from "@styles/Home.module.css";
import Novel from "src/components/Novel";

import Header from "../components/Header";

import type { NextPage } from "next";

const Home: NextPage = () => {
  return (
    <>
      <Header />
      <Novel
        summary={
          "Summary of the novel asidjfoasijdfo aijsdp ofijaspodifj pasodijf paosijdf poaisjdfp oiasjdfpoija sdpfoijas podifjspaodijf pasoijdf poaisjdfp oiasjdfpoi jaspdoifj aspodifj apsoidjf"
        }
        title={"Some title for the novel"}
        author={"random_auth"}
        id={1}
      />
    </>
  );
};

export default Home;
