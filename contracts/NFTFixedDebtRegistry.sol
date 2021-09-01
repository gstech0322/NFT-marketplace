// SPDX-License-Identifier: MIT
pragma solidity ^0.8.4;

import "@openzeppelin/contracts/token/ERC721/ERC721.sol";
import "@openzeppelin/contracts/utils/Counters.sol";
import "@openzeppelin/contracts/security/ReentrancyGuard.sol";

contract NFTFixedDebtRegistry is ReentrancyGuard {
    using Counters for Counters.Counter;
    Counters.Counter private _itemIds;
    Counters.Counter private _itemsFilled;

    address payable owner;
    uint256 listingFee = 0.05 ether;

    constructor() {
        owner = payable(msg.sender);
    }

    struct DebtItem {
        uint256 itemId;
        address nftContract;
        uint256 tokenId;
        address payable borrower;
        address payable lender;
        uint256 principal;
        uint256 interest; //in the same unit as principal
        uint256 repaymentAmount;
        uint256 debtStartTimestamp;
        uint256 duration;
        bool active;
        bool repaid;
        bool defaulted;
    }

    mapping(uint256 => DebtItem) private idToDebtItem;

    event DebtItemCreated(
        uint256 indexed itemId,
        address indexed nftContract,
        uint256 indexed tokenId,
        address borrower,
        address lender,
        uint256 principal,
        uint256 interest,
        uint256 repaymentAmount,
        uint256 debtStartTimestamp,
        uint256 duration,
        bool active,
        bool repaid,
        bool defaulted
    );

    function getListingFee() public view returns (uint256) {
        return listingFee;
    }

    function createDebtItem(
        address nftContract,
        uint256 tokenId,
        uint256 principal,
        uint256 duration,
        uint256 interest
    ) public payable nonReentrant {
        require(principal > 0, "Principal must be at least 1 wei");
        require(
            msg.value == listingFee,
            "Principal must be equal to listing price"
        );
        require(interest >= 0, "Interest must be at least 0");
        require(duration > 0, "Duration must be at least 1 second");
        _itemIds.increment();
        uint256 itemId = _itemIds.current();
        uint256 repaymentAmount = principal + interest;

        idToDebtItem[itemId] = DebtItem(
            itemId,
            nftContract,
            tokenId,
            payable(msg.sender),
            payable(address(0)),
            principal,
            interest,
            repaymentAmount,
            0,
            duration,
            false,
            false,
            false
        );

        IERC721(nftContract).transferFrom(msg.sender, address(this), tokenId);

        emit DebtItemCreated(
            itemId,
            nftContract,
            tokenId,
            msg.sender,
            address(0),
            principal,
            interest,
            repaymentAmount,
            0,
            duration,
            false,
            false,
            false
        );
    }

    function fillDebt(
        /*address nftContract,*/
        uint256 itemId
    ) public payable nonReentrant {
        uint256 principal = idToDebtItem[itemId].principal;
        // uint256 tokenId = idToDebtItem[itemId].tokenId;

        require(
            msg.value == principal,
            "Please submit the principal amount in order to the fill debt item"
        );

        idToDebtItem[itemId].borrower.transfer(msg.value);
        // IERC721(nftContract).transferFrom(address(this), msg.sender, tokenId);
        idToDebtItem[itemId].lender = payable(msg.sender);
        idToDebtItem[itemId].active = true;
        idToDebtItem[itemId].debtStartTimestamp = block.timestamp;
        _itemsFilled.increment();
        payable(owner).transfer(listingFee);
    }

    function repayDebt(address nftContract, uint256 itemId)
        public
        payable
        nonReentrant
    {
        uint256 repaymentAmount = idToDebtItem[itemId].repaymentAmount;
        uint256 tokenId = idToDebtItem[itemId].tokenId;
        address borrower = idToDebtItem[itemId].borrower;
        require(
            msg.value == repaymentAmount,
            "Please submit the repayment amount in order to the repay the debt"
        );

        //any address can repay the debt, but the ERC721 collateral is sent back to the recorded borrower address
        idToDebtItem[itemId].lender.transfer(msg.value);
        IERC721(nftContract).transferFrom(address(this), borrower, tokenId);
        idToDebtItem[itemId].active = false;
        idToDebtItem[itemId].repaid = true;
    }

    function defaultDebt(address nftContract, uint256 itemId)
        public
        payable
        nonReentrant
    {
        bool active = idToDebtItem[itemId].active;
        uint256 duration = idToDebtItem[itemId].duration;
        uint256 debtStartTimestamp = idToDebtItem[itemId].debtStartTimestamp;
        uint256 tokenId = idToDebtItem[itemId].tokenId;
        address lender = idToDebtItem[itemId].lender;
        uint256 debtExpirationTimestamp = debtStartTimestamp + duration;

        require(active == true, "Can only default active debt");
        require(
            block.timestamp > debtExpirationTimestamp,
            "Debt can only default after it has expired"
        );

        //any address can default the debt, but the ERC721 collateral is sent to the recorded lender address
        idToDebtItem[itemId].lender.transfer(msg.value);
        IERC721(nftContract).transferFrom(address(this), lender, tokenId);
        idToDebtItem[itemId].active = false;
        idToDebtItem[itemId].defaulted = true;
    }

    function fetchUnfilledDebtItems() public view returns (DebtItem[] memory) {
        uint256 itemCount = _itemIds.current();
        uint256 unfilledItemCount = _itemIds.current() - _itemsFilled.current();
        uint256 currentIndex = 0;

        DebtItem[] memory items = new DebtItem[](unfilledItemCount);
        for (uint256 i = 0; i < itemCount; i++) {
            if (idToDebtItem[i + 1].lender == address(0)) {
                uint256 currentId = idToDebtItem[i + 1].itemId;
                DebtItem storage currentItem = idToDebtItem[currentId];
                items[currentIndex] = currentItem;
                currentIndex += 1;
            }
        }
        return items;
    }

    //Could filter this fromm all fetchAllDebtItems() in frontend
    function fetchDebtItemsWhereIAmLender()
        public
        view
        returns (DebtItem[] memory)
    {
        uint256 totalItemCount = _itemIds.current();
        uint256 itemCount = 0;
        uint256 currentIndex = 0;

        for (uint256 i = 0; i < totalItemCount; i++) {
            if (idToDebtItem[i + 1].lender == msg.sender) {
                itemCount += 1;
            }
        }
        DebtItem[] memory items = new DebtItem[](itemCount);
        for (uint256 i = 0; i < totalItemCount; i++) {
            if (idToDebtItem[i + 1].lender == msg.sender) {
                uint256 currentId = idToDebtItem[i + 1].itemId;
                DebtItem storage currentItem = idToDebtItem[currentId];
                items[currentIndex] = currentItem;
                currentIndex += 1;
            }
        }
        return items;
    }

    //Could filter this fromm all fetchAllDebtItems() in frontend
    function fetchDebtItemsWhereIAmBorrower()
        public
        view
        returns (DebtItem[] memory)
    {
        uint256 totalItemCount = _itemIds.current();
        uint256 itemCount = 0;
        uint256 currentIndex = 0;

        for (uint256 i = 0; i < totalItemCount; i++) {
            if (idToDebtItem[i + 1].borrower == msg.sender) {
                itemCount += 1;
            }
        }

        DebtItem[] memory items = new DebtItem[](itemCount);
        for (uint256 i = 0; i < totalItemCount; i++) {
            if (idToDebtItem[i + 1].borrower == msg.sender) {
                uint256 currentId = idToDebtItem[i + 1].itemId;
                DebtItem storage currentItem = idToDebtItem[currentId];
                items[currentIndex] = currentItem;
                currentIndex += 1;
            }
        }
        return items;
    }

    function fetchAllDebtItems() public view returns (DebtItem[] memory) {
        uint256 totalItemCount = _itemIds.current();
        uint256 currentIndex = 0;

        DebtItem[] memory items = new DebtItem[](totalItemCount);
        for (uint256 i = 0; i < totalItemCount; i++) {
            uint256 currentId = idToDebtItem[i + 1].itemId;
            DebtItem storage currentItem = idToDebtItem[currentId];
            items[currentIndex] = currentItem;
            currentIndex += 1;
        }
        return items;
    }
}
