pragma solidity ^0.5.8;

import "../common/NonTransferrableOwner.sol";
import "../common/WithSafeMath.sol";
import "./PaymentUtil.sol";
import "./DataApi.sol";

/// @author hfccr
/// @title Manage application logic for airline data
contract AirlineApp is NonTransferrableOwner, WithSafeMath, PaymentUtil, DataApi {

    mapping(address => mapping(address => bool)) airlineMultipartyCallMapping;
    mapping(address => address[]) airlineMulitipartyCalls;

    uint256 constant MULTIPARTY_MODE_THRESHOLD = 4;
    uint256 constant CONSENSUS_PERCENT = 50;
    uint256 public constant AIRLINE_FUNDING = 10 ether;

    constructor(address payable dataContract)
        DataApi(dataContract)
        public
    {
    }

    function registerAirline(address airline)
        external
        requireIsOperational
        requireIsAirlineFunded(msg.sender)
        requireAirlineNotYetRegistered(airline)
        returns(bool success, uint256 votes)
    {
        uint256 numRegisteredAirlines = flightSuretyData.getRegisteredAirlineCount();
        if (numRegisteredAirlines < MULTIPARTY_MODE_THRESHOLD) {
            flightSuretyData.registerAirline(airline, msg.sender);
            airlineMulitipartyCalls[airline] = [msg.sender];
            airlineMultipartyCallMapping[airline][msg.sender] = true;
            return (success, airlineMulitipartyCalls[airline].length);
        } else {
            require(
                !airlineMultipartyCallMapping[airline][msg.sender],
                "Voter has already voted for this airline"
            );

            airlineMulitipartyCalls[airline].push(msg.sender);
            airlineMultipartyCallMapping[airline][msg.sender] = true;
            if (
                airlineMulitipartyCalls[airline].length >=
                numRegisteredAirlines.div(2)
            ) {
                flightSuretyData.registerAirline(airline, msg.sender);
                return (success, airlineMulitipartyCalls[airline].length);
            }
            return (false, airlineMulitipartyCalls[airline].length);
        }
    }

    /**
    * @dev Fund a registered airline
    *
    */
    function fundAirline()
        external
        payable
        requireIsOperational
        requireIsAirlineRegistered(msg.sender)
        paidEnough(AIRLINE_FUNDING)
        returnExcess(AIRLINE_FUNDING)
    {
        dataContractAddress.transfer(AIRLINE_FUNDING);
        flightSuretyData.fundAirline(msg.sender);
    }

    function isInMultipartyMode() public view returns(bool) {
        uint256 numRegisteredAirlines = flightSuretyData.getRegisteredAirlineCount();
        return !(numRegisteredAirlines < MULTIPARTY_MODE_THRESHOLD);
    }

}