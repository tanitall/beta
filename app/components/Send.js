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
    formClass = "form-control-neo";
  } else if (selectedAsset === "Gas") {
    btnClass = "btn-send-gas";
    formClass = "form-control-gas";
  }
  return (
    <div id="send">
      <div id="sendPane">
        <div className="row">
          <h1>Send</h1>
          <h2>Available Balance {neo}</h2>
        </div>

        <div className="row">
          <div id="sendAddress">
            <input
              className={formClass}
              placeholder="Enter Address"
              ref={node => {
                sendAddress = node;
              }}
            />
          </div>
          <div id="sendAmount">
            <input
              className={formClass}
              id="sendAmount"
              placeholder="Amount to Send"
              ref={node => {
                sendAmount = node;
              }}
            />
          </div>

          <div className="col-xs-3 col-xs-offset-3">
            <button
              id="sendAsset"
              className={btnClass}
              style={{ width: "100%" }}
              data-tip
              //data-for="assetTip"
              onClick={() => dispatch(toggleAsset())}
            >
              {selectedAsset}
            </button>
            <ReactTooltip
              class="solidTip"
              id="assetTip"
              place="bottom"
              type="dark"
              effect="solid"
            >
              <span>Tap To Switch</span>
            </ReactTooltip>
            {/* <p>Tap To Switch</p> */}
          </div>

          <div className="col-xs-3">
            <button
              id="doSend"
              style={{ width: "100%" }}
              className="btn-receive"
              onClick={() => openAndValidate(dispatch, neo, gas, selectedAsset)}
            >
              Send Now
            </button>
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
