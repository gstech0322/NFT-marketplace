// SPDX-License-Identifier: MIT
pragma solidity ^0.8.4;

import "@openzeppelin/contracts/token/ERC721/ERC721.sol";
import "@openzeppelin/contracts/utils/Counters.sol";
import "@openzeppelin/contracts/security/ReentrancyGuard.sol";

contract NFTFarming is ReentrancyGuard {
    using Counters for Counters.Counter;
    Counters.Counter private _itemIds;
    Counters.Counter private _itemsStaked;

    address payable owner;
    bool rewardsActive;
    uint256 totalRewardSupply;

    // uint256 listingFee = 0.05 ether;

    constructor() {
        owner = payable(msg.sender);
    }

    struct FarmItem {
        uint256 itemId;
        address nftContract;
        address erc20TokenContract;
        uint256 tokenId;
        address payable staker;
        uint256 stakeAmount;
        uint256 stakeStartBlockNumber;
        uint256 stakeEndBlockNumber;
    }

    mapping(uint256 => FarmItem) private idToFarmItem;

    event FarmItemCreated(
        uint256 indexed itemId,
        address indexed nftContract,
        uint256 indexed tokenId,
        address payable staker,
        uint256 stakeAmount,
        uint256 stakeStartBlockNumber,
        uint256 stakeEndBlockNumber
    );

    function startRewards() public payable nonReentrant {
        require(msg.sender == owner, "Only owner address can start rewards");
        totalRewardSupply = msg.value;
        rewardsActive = true;
    }

    function getContractBalance() public view returns (uint256) {}
}
