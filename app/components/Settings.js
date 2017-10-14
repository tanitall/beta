import React, { Component } from "react";
import { Link } from "react-router";
import { connect } from "react-redux";
import { setBlockExplorer } from "../modules/metadata";
import { setKeys } from "../modules/account";
import Delete from "react-icons/lib/md/delete";
import _ from "lodash";
import fs from "fs";

const { dialog } = require("electron").remote;

import storage from "electron-json-storage";

import Logo from "./Brand/LogoBlank";

let explorer_select;

const saveKeyRecovery = keys => {
  const content = JSON.stringify(keys);
  dialog.showSaveDialog(
    {
      filters: [
        {
          name: "JSON",
          extensions: ["json"]
        }
      ]
    },
    fileName => {
      if (fileName === undefined) {
        console.log("File failed to save...");
        return;
      }
      // fileName is a string that contains the path and filename created in the save file dialog.
      fs.writeFile(fileName, content, err => {
        if (err) {
          alert("An error ocurred creating the file " + err.message);
        }
        alert("The file has been succesfully saved");
      });
    }
  );
};

const loadKeyRecovery = dispatch => {
  dialog.showOpenDialog(fileNames => {
    // fileNames is an array that contains all the selected
    if (fileNames === undefined) {
      console.log("No file selected");
      return;
    }
    const filepath = fileNames[0];
    fs.readFile(filepath, "utf-8", (err, data) => {
      if (err) {
        alert("An error ocurred reading the file :" + err.message);
        return;
      }
      const keys = JSON.parse(data);
      storage.get("keys", (error, data) => {
        _.each(keys, (value, key) => {
          data[key] = value;
        });
        dispatch(setKeys(data));
        storage.set("keys", data);
      });
      // dispatch(setKeys(keys));
      // storage.set('keys', keys);
    });
  });
};

const saveSettings = settings => {
  storage.set("settings", settings);
};

const loadSettings = dispatch => {
  storage.get("settings", (error, settings) => {
    if (
      settings.blockExplorer !== null &&
      settings.blockExplorer !== undefined
    ) {
      dispatch(setBlockExplorer(settings.blockExplorer));
    }
  });
};

const updateSettings = dispatch => {
  saveSettings({ blockExplorer: explorer_select.value });
  dispatch(setBlockExplorer(explorer_select.value));
};

const deleteWallet = (dispatch, key) => {
  storage.get("keys", (error, data) => {
    delete data[key];
    storage.set("keys", data);
    dispatch(setKeys(data));
  });
};

class Settings extends Component {
  componentDidMount = () => {
    storage.get("keys", (error, data) => {
      this.props.dispatch(setKeys(data));
    });
    loadSettings(this.props.dispatch);
  };

  render = () => (
    <div id="settings" className="container">
      <div className="row">
        <div className="col-xs-4 col-xs-offset-5">
          <Logo width={140} />
        </div>
      </div>
      <div className="description">
        Manage your Morpheus wallet keys and settings
      </div>
      <div className="settingsForm row">
        <div className="settingsItem">
          <div className="itemTitle">Saved Wallet Keys</div>
          {_.map(this.props.wallets, (value, key) => {
            return (
              <div className="walletList">
                <div className="walletItem">
                  <div className="walletName">{key.slice(0, 20)}</div>
                  <div className="walletKey">{value}</div>
                  <div
                    className="deleteWallet"
                    onClick={() => deleteWallet(this.props.dispatch, key)}
                  >
                    <Delete />
                  </div>
                </div>
              </div>
            );
          })}
        </div>
        <div className="col-xs-4">
          <button
            className="btn btn-form btn-warning btn-sm"
            style={{
              marginTop: 30,
              fontWeight: 500,
              lineHeight: 2
            }}
            onClick={() => saveKeyRecovery(this.props.wallets)}
          >
            Export key recovery file
          </button>
        </div>

        <div className="col-xs-4">
          <button
            className="btn btn-primary btn-sm"
            style={{
              marginTop: 30,

              fontWeight: 500,
              lineHeight: 2
            }}
            onClick={() => loadKeyRecovery(this.props.dispatch)}
          >
            Load key recovery file
          </button>
        </div>
      </div>

      <div className="icon-bar">
        <Link to="/create">
          <div className="icon-cell">
            <div className="new-icon" />
            Create New Wallet
          </div>
        </Link>
        <Link to="/LoginLocalStorage">
          <div className="icon-cell">
            <div className="lock-icon" />
            Login With Saved Wallet
          </div>
        </Link>
        <Link to="/">
          <div className="icon-cell">
            <div className="lock-icon" />
            Login Using Private Key
          </div>
        </Link>
      </div>
    </div>
  );
}

const mapStateToProps = state => ({
  explorer: state.metadata.blockExplorer,
  wallets: state.account.accountKeys
});

Settings = connect(mapStateToProps)(Settings);

export default Settings;
