import React from "react";

type Value = string;

type Account = React.Context<{
  publicKey: Value;
  setPublicKey: (value: Value) => void;
}>;

const AccountContext = React.createContext({
  publicKey: "",
  // eslint-disable-next-line @typescript-eslint/no-empty-function
  setPublicKey: (value: Value) => {},
});

export default AccountContext;
