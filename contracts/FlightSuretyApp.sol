pragma solidity ^0.5.8;

import "./app/OracleApp.sol";

/// @author hfccr
/// @title Application logic for flight surety insurance
contract FlightSuretyApp is OracleApp {

    constructor(address payable dataContract)
        OracleApp(dataContract)
        public
    {
    }

}
