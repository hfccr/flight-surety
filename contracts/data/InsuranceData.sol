pragma solidity ^0.5.8;

import "./FlightData.sol";

/// @author hfccr
/// @title Manage insurance data for Flight Surety Insurance
contract InsuranceData is FlightData {

    struct Insured {
        address traveller;
        uint256 amount;
        uint256 payout;
        bool payoutCompleted;
    }

    mapping(bytes32 => mapping(address => bool)) flightInsuredMap;
    mapping(bytes32 => Insured[]) flightInsured;
    mapping(address => uint256) public remainingPayouts;

    event TravellerInsured(bytes32 flightKey, address traveller);
    event TravellerCredited(address traveller, uint256 amount);
    event AccountWithdrawal(address traveller, uint256 amount);

    modifier requireTravellerHasPendingPayout(address traveller) {
        require(
            remainingPayouts[traveller] > 0,
            "No payouts available for withdrawal"
        );
        _;
    }

    constructor(address airline)
      FlightData(airline)
      public
      payable
    {
    }

    function buy(
        bytes32 flightKey,
        address traveller,
        uint256 amount,
        uint256 payout
    )
        external
        requireIsOperational
        requireIsCallerAuthorized
        requireFlightRegistered(flightKey)
        requireFlightNotLanded(flightKey)
    {
        flightInsured[flightKey].push(Insured(
            traveller,
            amount,
            payout,
            false
        ));
        flightInsuredMap[flightKey][traveller] = true;
        emit TravellerInsured(flightKey, traveller);
    }

    function pay(address payable traveller)
        external
        requireIsOperational
        requireIsCallerAuthorized
        requireTravellerHasPendingPayout(traveller)
    {
        uint256 amount = remainingPayouts[traveller];
        remainingPayouts[traveller] = 0;
        traveller.transfer(amount);
        emit AccountWithdrawal(traveller, amount);
    }

    function handleFlightStatusChange(
        bytes32 flightKey,
        uint8 newStatusCode
    )
        external
        requireIsOperational
        requireIsCallerAuthorized
    {
        updateFlightStatus(flightKey, newStatusCode);
        if (newStatusCode == 20) {
            creditInsurees(flightKey);
        }
    }

    function isTravellerInsuredForFlight(
        bytes32 flightKey,
        address traveller
    )
        external
        view
        returns (bool)
    {
        return flightInsuredMap[flightKey][traveller];
    }

    function creditInsurees(bytes32 flightKey)
        internal
        requireIsOperational
        requireIsCallerAuthorized
    {
        for(uint256 index = 0; index < flightInsured[flightKey].length; index++) {
            Insured memory insured = flightInsured[flightKey][index];
            address traveller = insured.traveller;
            if (!insured.payoutCompleted) {
                insured.payoutCompleted = true;
                uint256 payout = flightInsured[flightKey][index].payout;
                remainingPayouts[traveller] = remainingPayouts[traveller].add(payout);
                emit TravellerCredited(
                    traveller,
                    payout
                );
            }
        }
    }

   /**
    * @dev Initial funding for the insurance. Unless there are too many delayed flights
    *      resulting in insurance payouts, the contract should be self-sustaining
    *
    */
    function fund() public payable { }

    /**
    * @dev Fallback function for funding smart contract.
    *
    */
    function() external payable { fund(); }

}
