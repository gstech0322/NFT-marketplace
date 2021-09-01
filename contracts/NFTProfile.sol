// SPDX-License-Identifier: MIT
pragma solidity ^0.8.4;

import "@openzeppelin/contracts/token/ERC721/ERC721.sol";
import "@openzeppelin/contracts/token/ERC721/extensions/ERC721URIStorage.sol";
import "@openzeppelin/contracts/utils/Counters.sol";

contract NFTProfile is ERC721URIStorage {
    using Counters for Counters.Counter;
    Counters.Counter private _tokenIds;
    address payable contractOwner;
    address profileRegistryAddress;
    // address marketplaceAddress;
    // address fixedDebtRegistryAddress;

    constructor(string memory name, string memory symbol) ERC721(name, symbol) {
        contractOwner = payable(msg.sender);
        // marketplaceAddress = marketAddress;
        // fixedDebtRegistryAddress = fixedDebtAddress;
    }

    struct ProfileItem {
        uint256 tokenId;
        address payable ownerAddress;
        uint256 mintBlockNumber;
        uint256 mintTimestamp;
        string title;
        string content;
        uint256 level;
        uint256 reputation;
    }

    mapping(uint256 => ProfileItem) private idToProfileItem;

    event ProfileItemCreated(
        uint256 indexed tokenId,
        address payable ownerAddress,
        uint256 mintBlockNumber,
        uint256 mintTimestamp,
        string title,
        string content,
        uint256 level,
        uint256 reputation
    );

    function createToken(string memory tokenURI, string memory title, string memory content) public returns (uint256) {
        _tokenIds.increment();
        uint256 newTokenId = _tokenIds.current();

        _mint(msg.sender, newTokenId);
        _setTokenURI(newTokenId, tokenURI);
        // setApprovalForAll(marketplaceAddress, true);
        // setApprovalForAll(fixedDebtRegistryAddress, true);

        idToProfileItem[newTokenId] = ProfileItem(newTokenId, payable(msg.sender), block.number, block.timestamp, title, content, 1, 100);

        emit ProfileItemCreated(newTokenId, payable(msg.sender), block.number, block.timestamp, title, content, 1, 100);

        return newTokenId;
    }

    function setProfileRegistryAddress(address newProfileRegistryAddress) public returns (address) {
        require(msg.sender == contractOwner, "Only the contract owner can set the profile registry address");
        profileRegistryAddress = newProfileRegistryAddress;
        return newProfileRegistryAddress;
    }

    function updateTokenURI(uint256 tokenId, string memory tokenURI) public returns (uint256) {
        require(msg.sender == idToProfileItem[tokenId].ownerAddress, "Only owner can update the tokenURI" );
        _setTokenURI(tokenId, tokenURI);
        return tokenId;
    }

    function updateContent(uint256 tokenId, string memory newContent) public returns (uint256) {
        require(msg.sender == idToProfileItem[tokenId].ownerAddress, "Only owner can update the content" );
        idToProfileItem[tokenId].content = newContent;
        return tokenId;
    }

    function updateLevel(uint256 tokenId, uint256 newLevel) public returns (uint256) {
        require(msg.sender == profileRegistryAddress, "Only contract owner can update the level" );
        idToProfileItem[tokenId].level = newLevel;
        return tokenId;
    }

    function updateReputation(uint256 tokenId, uint256 newReputation) public returns (uint256) {
        require(msg.sender == profileRegistryAddress, "Only contract owner can update the reputation" );
        idToProfileItem[tokenId].reputation = newReputation;
        return tokenId;
    }


    function transferProfile(address receiver, uint256 tokenId) public returns (uint256) {
        require(msg.sender == idToProfileItem[tokenId].ownerAddress, "Only owner can transfer the profile" );
        safeTransferFrom(msg.sender, receiver, tokenId);
        idToProfileItem[tokenId].ownerAddress = payable(receiver);
        return tokenId;
    }

    //UTILS

    function totalSupply() public view returns (uint256) {
        uint256 totalCount = _tokenIds.current();
        return totalCount;
    }

    function getAllProfiles() public view returns (ProfileItem[] memory) {
        uint256 totalItemCount = _tokenIds.current();
        uint256 currentIndex = 0;

        ProfileItem[] memory items = new ProfileItem[](totalItemCount);
        for (uint256 i = 0; i < totalItemCount; i++) {
            uint256 currentId = idToProfileItem[i + 1].tokenId;
            ProfileItem storage currentItem = idToProfileItem[currentId];
            items[currentIndex] = currentItem;
            currentIndex += 1;
        }
        return items;
    }

    function getProfileById(uint256 tokenId) public view returns (ProfileItem memory) {
      ProfileItem storage profile = idToProfileItem[tokenId];
      return profile;
    }
}
