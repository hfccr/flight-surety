pragma solidity ^0.5.8;

import "./data/InsuranceData.sol";

/// @author hfccr
/// @title Manage data for Flight Surety Insurance
contract FlightSuretyData is InsuranceData {

    constructor(address airline)
        InsuranceData(airline)
        public
        payable {
    }

}
