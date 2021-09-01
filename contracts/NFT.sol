// SPDX-License-Identifier: MIT
pragma solidity ^0.8.4;

import "@openzeppelin/contracts/token/ERC721/ERC721.sol";
import "@openzeppelin/contracts/token/ERC721/extensions/ERC721URIStorage.sol";
import "@openzeppelin/contracts/utils/Counters.sol";

contract NFT is ERC721URIStorage {
    using Counters for Counters.Counter;
    Counters.Counter private _tokenIds;
    address marketplaceAddress;
    address fixedDebtRegistryAddress;

    constructor(address marketAddress, address fixedDebtAddress)
        ERC721("NFT Token", "NFT")
    {
        marketplaceAddress = marketAddress;
        fixedDebtRegistryAddress = fixedDebtAddress;
    }

    function createToken(string memory tokenURI) public returns (uint256) {
        _tokenIds.increment();
        uint256 newItemId = _tokenIds.current();

        _mint(msg.sender, newItemId);
        _setTokenURI(newItemId, tokenURI);
        setApprovalForAll(marketplaceAddress, true);
        setApprovalForAll(fixedDebtRegistryAddress, true);
        return newItemId;
    }

    function totalSupply() external view returns (uint256) {
        uint256 nftCount = _tokenIds.current();
        return nftCount;
    }
}
