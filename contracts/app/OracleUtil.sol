pragma solidity ^0.5.8;

/// @author hfccr
/// @title Provide util functions for oracles
contract OracleUtil {

    // Incremented to add pseudo-randomness at various points
    uint8 private nonce = 0;

    // Returns array of three non-duplicating integers from 0-9
    function getRandomIndex(address account)
        internal
        returns (uint8)
    {
        uint8 maxValue = 10;
        // Pseudo random number...the incrementing nonce adds variation
        uint8 random = uint8(
            uint256(
                keccak256(
                    abi.encodePacked(
                        blockhash(block.number - nonce++),
                        account
                    )
                )
            ) %
            maxValue
        );
        if (nonce > 250) {
            // Can only fetch blockhashes for last 256 blocks so we adapt
            nonce = 0;
        }
        return random;
    }

    // Returns array of three non-duplicating integers from 0-9
    function generateIndexes(address account)
        internal
        returns(uint8[3] memory)
    {
        uint8[3] memory indexes;
        indexes[0] = getRandomIndex(account);

        indexes[1] = indexes[0];
        while(indexes[1] == indexes[0]) {
            indexes[1] = getRandomIndex(account);
        }
        indexes[2] = indexes[1];
        while((indexes[2] == indexes[0]) || (indexes[2] == indexes[1])) {
            indexes[2] = getRandomIndex(account);
        }
        return indexes;
    }

}