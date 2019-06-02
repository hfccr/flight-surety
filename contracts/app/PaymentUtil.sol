pragma solidity ^0.5.8;

/// @author hfccr
/// @title Provide util functions for payments
contract PaymentUtil {

    modifier paidNonZero() {
        require(
            msg.value > 0,
            "No funds provided"
        );
        _;
    }

    modifier paidEnough(uint256 value) {
        require(
            msg.value >= value,
            "Not enough funds provided"
        );
        _;
    }

    modifier returnExcess(uint256 expected) {
        _;
        uint256 amountToReturn = msg.value - expected;
        if (amountToReturn > 0) {
            msg.sender.transfer(amountToReturn);
        }
    }

}