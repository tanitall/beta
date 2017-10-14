import React, { Component } from "react";
import { Link } from "react-router";

export default class IconBar extends Component {
  render() {
    return (
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
            Open Saved Wallet
          </div>
        </Link>
        <Link>
          <div className="icon-cell">
            <div className="upload-icon" />
            Upload Recovery File
          </div>
        </Link>
      </div>
    );
  }
}
