import React from "react";

type Address = string;

type AccountContext = {
  publicKey: Address;
  setPublicKey: (value: Address) => void;
};

const AccountContext = React.createContext<AccountContext>({
  publicKey: "",
  // eslint-disable-next-line @typescript-eslint/no-empty-function
  setPublicKey: (value: Address) => {},
});

export default AccountContext;
