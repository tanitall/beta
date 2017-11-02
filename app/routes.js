import React from "react";
import { Route, Router, IndexRoute, browserHistory } from "react-router";
import App from "./components/App";
import LoginNep2 from "./components/LoginNep2";
import LoginPrivateKey from "./components/LoginPrivateKey";
import Home from "./components/Home";
import Settings from "./components/Settings";
import Exchange from "./components/Exchange";
import LoginLocalStorage from "./components/LoginLocalStorage";
import TransactionHistory from "./components/TransactionHistory";
import DisplayWalletKeys from "./components/DisplayWalletKeys";
import CreateWallet from "./components/CreateWallet";
import EncryptKey from "./components/EncryptKey";
import Send from "./components/Send";
import Dashboard from "./containers/Dashboard";
import Receive from "./components/Receive";

export default (
  <Route path="/" component={App}>
    <Route component={Home} />
    <Route path="/dashboard" component={Dashboard}>
      <Route path="/send" component={Send} />
      <Route path="/receive" component={Receive} />
      <Route path="/settings" component={Settings} />
      <Route path="/exchange" component={Exchange} />
      <Route path="/transactionHistory" component={TransactionHistory} />
    </Route>
    <Route path="/transactionHistory" component={TransactionHistory} />
    <Route path="/create" component={CreateWallet} />
    <Route path="/encryptKey" component={EncryptKey} />
    <Route path="/DisplayWalletKeys" component={DisplayWalletKeys} />
    <Route path="/LoginNep2" component={LoginNep2} />
    <IndexRoute component={LoginPrivateKey} />
    <Route path="/loginLocalStorage" component={LoginLocalStorage} />
    <Route path="/LoginEncrypted" component={LoginNep2} />
    {/* <Route path="/settings" component={Settings} /> */}
    <Route path="/settingsw" component={Settings} />
  </Route>
);