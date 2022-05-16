import Image from "next/image";
import { useContext } from "react";
import { SearchIcon } from "@heroicons/react/outline";

import AccountContext from "./AccountContext";

function Header() {
  const account = useContext(AccountContext);

  const shortAccountAdr = account.publicKey.substring(0, 6) +
    "..." +
    account.publicKey.substring(37, 41);

  const connectWallet = async () => {
    try {
      const { ethereum } = window;

      if (!ethereum) {
        alert("Get MetaMask!");

        return;
      }

      const accounts = await ethereum.request({
        method: "eth_requestAccounts",
      });

      console.log("Connected", accounts[0]);

      account.setPublicKey(accounts[0]);

      //setCurrentAccount(accounts[0]);
    } catch (error) {
      console.log(error);
    }
  };

  return (
    <>
      <header className="w-full bg-nfnovels_dark p-2">
        <div className="mx-4 flex relative">
          <Image
            src="/logo.jpg"
            width={64}
            height={64}
            className="w-8 h-8 mr-4"
          />

          <form
            action=""
            className="bg-nfnovels_dark-search_text px-3 flex rounded-md border border-gray-700 mx-4 flex-grow mt-4 mb-4"
          >
            <SearchIcon className="text-gray-300 h-6 w-6 mt-1" />
            <input
              type="text"
              className="bg-nfnovels_dark-search_text text-sm p-1 pl-2 pr-0 block focus:outline-none text-white"
              placeholder="Searching novels tldr"
            />
          </form>

          {!account.publicKey && (
            <div className="m-4 hidden sm:block">
              <button
                className="mr-1 h-8 border border-gray-300 rounded-full flex px-3 hover:bg-gray-300 hover:text-black items-stretch text-sm text-gray-300 font-bold"
                style={{ borderRadius: ".3rem" }}
                onClick={connectWallet}
              >
                <Image
                  src="/metamask-fox.svg"
                  width={64}
                  height={64}
                  className="w-8 h-8"
                />
                <div className="m-1">Log In</div>
              </button>
            </div>
          )}

          {account.publicKey && (
            <div className="m-4 hidden sm:block">
              <span className="block border border-gray-300 mr-1 h-8 py-1 px-3 text-gray-300 font-bold text-sm">
                Hello, {shortAccountAdr}!
              </span>
            </div>
          )}
        </div>
      </header>
    </>
  );
}

export default Header;
