pragma solidity ^0.5.8;

/// @author hfccr
/// @title Provide owner privileges
contract NonTransferrableOwner {

    address public contractOwner;

    constructor () public {
        contractOwner = msg.sender;
    }

    /**
    * @dev Modifier that requires the "ContractOwner" account to be the function caller
    */
    modifier requireContractOwner() {
        require(
            msg.sender == contractOwner,
            "Caller is not contract owner"
        );
        _;
    }

}