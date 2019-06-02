pragma solidity ^0.5.8;

import "../common/NonTransferrableOwner.sol";

/// @author hfccr
/// @title Provide operational control
contract Operable is NonTransferrableOwner {
    // If false, no operations are allowed
    bool private operational = true;

    /**
    * @dev Modifier that requires the "operational" boolean variable to be "true"
    *      This is used on all state changing functions to pause the contract in
    *      the event there is an issue that needs to be fixed
    */
    modifier requireIsOperational() {
        require(
            operational,
            "Contract is currently not operational"
        );
        _;
    }

    /**
    * @dev Get operating status of contract
    *
    * @return A bool that is the current operating status
    */
    function isOperational() public view returns(bool) {
        return operational;
    }

    /**
    * @dev Sets contract operations on/off
    *
    * When operational mode is disabled, all write transactions except for this one will fail
    */
    function setOperatingStatus(bool mode)
        external
        requireContractOwner
    {
        operational = mode;
    }

    function testOperatingStatus()
        public
        view
        requireIsOperational
        returns(bool)
    {
        return true;
    }

}