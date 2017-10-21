import React from "react";
import { connect } from "react-redux";
import { Link } from "react-router";
import { doSendAsset, verifyAddress } from "neon-js";
import { togglePane } from "../modules/dashboard";
import {
  sendEvent,
  clearTransactionEvent,
  toggleAsset
} from "../modules/transactions";
import SplitPane from "react-split-pane";
import ReactTooltip from "react-tooltip";
import { log } from "../util/Logs";
import neoLogo from "../images/neo.png";
import Claim from "./Claim.js";

let sendAddress, sendAmount, confirmButton;

// form validators for input fields
const validateForm = (dispatch, neo_balance, gas_balance, asset) => {
  // check for valid address
  try {
    if (
      verifyAddress(sendAddress.value) !== true ||
      sendAddress.value.charAt(0) !== "A"
    ) {
      dispatch(sendEvent(false, "The address you entered was not valid."));
      setTimeout(() => dispatch(clearTransactionEvent()), 5000);
      return false;
    }
  } catch (e) {
    dispatch(sendEvent(false, "The address you entered was not valid."));
    setTimeout(() => dispatch(clearTransactionEvent()), 5000);
    return false;
  }
  // check for fractional neo
  if (
    asset === "Neo" &&
    parseFloat(sendAmount.value) !== parseInt(sendAmount.value)
  ) {
    dispatch(sendEvent(false, "You cannot send fractional amounts of Neo."));
    setTimeout(() => dispatch(clearTransactionEvent()), 5000);
    return false;
  } else if (asset === "Neo" && parseInt(sendAmount.value) > neo_balance) {
    // check for value greater than account balance
    dispatch(sendEvent(false, "You do not have enough NEO to send."));
    setTimeout(() => dispatch(clearTransactionEvent()), 5000);
    return false;
  } else if (asset === "Gas" && parseFloat(sendAmount.value) > gas_balance) {
    dispatch(sendEvent(false, "You do not have enough GAS to send."));
    setTimeout(() => dispatch(clearTransactionEvent()), 5000);
    return false;
  } else if (parseFloat(sendAmount.value) < 0) {
    // check for negative asset
    dispatch(sendEvent(false, "You cannot send negative amounts of an asset."));
    setTimeout(() => dispatch(clearTransactionEvent()), 5000);
    return false;
  }
  return true;
};

// open confirm pane and validate fields
const openAndValidate = (dispatch, neo_balance, gas_balance, asset) => {
  if (validateForm(dispatch, neo_balance, gas_balance, asset) === true) {
    dispatch(togglePane("confirmPane"));
  }
};

// perform send transaction
const sendTransaction = (
  dispatch,
  net,
  selfAddress,
  wif,
  asset,
  neo_balance,
  gas_balance
) => {
  // validate fields again for good measure (might have changed?)
  if (validateForm(dispatch, neo_balance, gas_balance, asset) === true) {
    dispatch(sendEvent(true, "Processing..."));
    log(net, "SEND", selfAddress, {
      to: sendAddress.value,
      asset: asset,
      amount: sendAmount.value
    });
    doSendAsset(net, sendAddress.value, wif, asset, sendAmount.value)
      .then(response => {
        if (response.result === undefined || response.result === false) {
          dispatch(sendEvent(false, "Transaction failed!"));
        } else {
          console.log(response.result);
          dispatch(
            sendEvent(
              true,
              "Transaction complete! Your balance will automatically update when the blockchain has processed it."
            )
          );
        }
        setTimeout(() => dispatch(clearTransactionEvent()), 5000);
      })
      .catch(e => {
        dispatch(sendEvent(false, "Transaction failed!"));
        setTimeout(() => dispatch(clearTransactionEvent()), 5000);
      });
  }
  // close confirm pane and clear fields
  dispatch(togglePane("confirmPane"));
  sendAddress.value = "";
  sendAmount.value = "";
  confirmButton.blur();
};

let Send = ({
  dispatch,
  wif,
  address,
  status,
  neo,
  gas,
  net,
  confirmPane,
  selectedAsset
}) => {
  let confirmPaneClosed;
  if (confirmPane) {
    confirmPaneClosed = "100%";
  } else {
    confirmPaneClosed = "69%";
  }

  let btnClass;
  let formClass;
  if (selectedAsset === "Neo") {
    btnClass = "btn-send";
    formClass = "form-send-neo";
  } else if (selectedAsset === "Gas") {
    btnClass = "btn-send-gas";
    formClass = "form-send-gas";
  }
  return (
    <div id="send">
      <div id="sendPane">
      <div className="row ">
        <div className="header">
          <div className="col-xs-4">
            <p className="neo-balance">Available Neo</p>
            <p className="neo-text">
              {neo} <span> NEO</span>
            </p>
          </div>
          <div className="col-xs-4">
          {<Claim />}
          </div>
          <div className="col-xs-4">
            <p className="neo-balance">Available GAS</p>
            <p className="gas-text">{Math.floor(gas * 1000000) / 1000000} <span>GAS</span></p>
          </div>
        </div>
      </div>

        <div className="row send-neo">

        <div className="col-xs-6">
        <img src={neoLogo} alt="" width="48" className="neo-logo logobounce" />
        <h2>Send Neo/Gas</h2>
        </div>
        <div className="col-xs-4">
        <div id="sendAddress">
        <div className="btn-sm">MIN</div>
        <div className="btn-sm">HALF</div>
        <div className="btn-sm">MAX</div>
        </div>
        </div>
        <div className="col-xs-2">
        <div
          id="sendAsset"
          className={btnClass}
          style={{ width: "100%" }}
          data-tip
          //data-for="assetTip"
          onClick={() => dispatch(toggleAsset())}
        >
          {selectedAsset}
        </div>
        <ReactTooltip
          className="solidTip"
          id="assetTip"
          place="bottom"
          type="dark"
          effect="solid"
        >
          <span>Click To Switch</span>
        </ReactTooltip>
        {/* <p>Tap To Switch</p> */}
        </div>
        <div className="clearboth"></div>
<div className="glyphicon glyphicon-camera scanqr-cam"></div>
          <div id="sendAddress">
          <div className="col-xs-12">
            <input
              className={formClass}
              id="center"
              placeholder="Enter a valid NEO public address"
              ref={node => {
                sendAddress = node;
              }}
            />
            </div>

          <div className="clearboth"></div>

          <div id="sendAmount">
          <div className="col-xs-6">
            <input
              className={formClass}
              type="number"
              id="sendAmount"
              placeholder="Enter amount to send"
              ref={node => {
                sendAmount = node;
              }}
            />
            </div>
            <div className="col-xs-4">
              <input
                className={formClass}
                id="sendAmount"
                type="number"
                placeholder="Amount in US"
                ref={node => {
                  sendAmount = node;
                }}
              />
              <label className="amount-dollar">$</label>
              </div>
              <div className="col-xs-2">
              <div id="sendAddress">
              <button
                id="doSend"
                style={{ width: "100%" }}
                className="btn-send"
                onClick={() => openAndValidate(dispatch, neo, gas, selectedAsset)}
              >
                Send
              </button>
              </div>
              </div>
          </div>
        </div>
        <div className="col-xs-12">
        <table>
        <tr>
        <td>Saved Addresses</td><td></td><td width="120px"><div className="btn-sm right"><div className="glyphicon glyphicon-plus"></div></div></td>
        </tr>
        <tr>
        <td><span className="glyphicon glyphicon-check"></span> Bittrex</td><td><div className="btn-sm">aw12e3r4t5y6ui8o94r5t6y7u8i6g7h</div></td>
        <td>
        <div className="btn-sm right delete">
        <div className="glyphicon glyphicon-trash"></div>
        </div>
        </td>
        </tr>
        <tr>
        <td><span className="glyphicon glyphicon-check"></span> Binance</td><td><div className="btn-sm">a1w4f53sd4f5g6h7j8ia2s3d4f5g6h7</div></td>
        <td>
        <div className="btn-sm right delete">
        <div className="glyphicon glyphicon-trash"></div>
        </div>
        </td>
        </tr>
        </table>
        </div>
        </div>
      </div>
      <div
        id="confirmPane"
        onClick={() =>
          sendTransaction(dispatch, net, address, wif, selectedAsset, neo, gas)}
      >
        {/* <button
          ref={node => {
            confirmButton = node;
          }}
        >
          Confirm Transaction
        </button> */}
      </div>

      <div className="send-notice">
          <p>All NEO and GAS transactions are free. Only send NEO and GAS to a valid NEO address. Sending to an address other than a NEO address can result in your NEO/GAS being lost. You cannot send a fraction of a NEO.</p>
          </div>
    </div>
  );
};

const mapStateToProps = state => ({
  wif: state.account.wif,
  address: state.account.address,
  net: state.metadata.network,
  neo: state.wallet.Neo,
  gas: state.wallet.Gas,
  selectedAsset: state.transactions.selectedAsset,
  confirmPane: state.dashboard.confirmPane
});

Send = connect(mapStateToProps)(Send);

export default Send;
