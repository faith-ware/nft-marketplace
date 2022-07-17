  // SPDX-License-Identifier: MIT
pragma solidity ^0.8.4;

import "@openzeppelin/contracts/token/ERC721/IERC721.sol";
import "@openzeppelin/contracts/security/ReentrancyGuard.sol";
import "@openzeppelin/contracts/token/ERC721/extensions/ERC721URIStorage.sol";
import "@openzeppelin/contracts/utils/Strings.sol";

contract NftMarkeplace is ReentrancyGuard, ERC721URIStorage {
    using Strings for uint256;
    string _baseTokenURI;
    uint256 public tokenIds;

    struct Listing {
      uint price;
      address seller;
    }

    event ItemListed(
      address indexed seller,
      address indexed nftAddress,
      uint256 indexed tokenId,
      uint256 price
    );

    event ItemBought(
      address indexed buyer,
      address indexed nftAddress,
      uint256 indexed tokenId,
      uint256 price
    );

    mapping(address => mapping(uint256 => Listing)) public listings;
    mapping(address => uint) private sellerBalance;

    constructor (string memory baseURI) ERC721("FaMarket", "FaMt") {
      _baseTokenURI = baseURI;
    }

    function mint() public payable {
        tokenIds += 1;
        _safeMint(msg.sender, tokenIds);
    }

    function _baseURI() internal view virtual override returns (string memory) {
        return _baseTokenURI;
    }

    function tokenURI(uint256 tokenId) public view virtual override returns (string memory) {
          require(_exists(tokenId), "ERC721Metadata: URI query for nonexistent token");
          string memory baseURI = _baseURI();
          return bytes(baseURI).length > 0 ? string(abi.encodePacked(baseURI, tokenId.toString(), ".json")) : "";
    }

    modifier isOwner(address contractAddress, uint tokenId, address spender) {
      IERC721 nft = IERC721(contractAddress);
      address nftHolder = nft.ownerOf(tokenId);

      if (nftHolder != spender){
        revert("You are not the owner of this nft");
      }
      _;
    }

    modifier isListed(address _nftContractAddress, uint _tokenId) {
      Listing memory particularItem = listings[_nftContractAddress][_tokenId];
      require(particularItem.price > 0, "Item is not listed");
      _;
    }

    modifier notListed(address _nftContractAddress, uint _tokenId) {
      Listing memory particularItem = listings[_nftContractAddress][_tokenId];
      if (particularItem.price > 0) {
         revert("Item has been listed");
      }
      _;
    }

    function listItem(address _nftContractAddress, uint _tokenId, uint _price) external isOwner(_nftContractAddress, _tokenId, msg.sender) notListed(_nftContractAddress, _tokenId) {
      require(_price > 0, "Price must be greater than 0");
      IERC721 nft = IERC721(_nftContractAddress);

      // if (nft.getApproved(_tokenId) != address(this)) {
      //   revert("Not Approved");
      // }

      if (!(nft.isApprovedForAll(msg.sender, address(this)))) {
        revert("Not Approved");
      }

      listings[_nftContractAddress][_tokenId] = Listing(_price, msg.sender);
      emit ItemListed(msg.sender, _nftContractAddress, _tokenId, _price);
    }

    function updateListing(address _nftContractAddress, uint _tokenId, uint _newprice) external isOwner(_nftContractAddress, _tokenId, msg.sender) isListed(_nftContractAddress, _tokenId){
      Listing memory particularItem = listings[_nftContractAddress][_tokenId];
      require(_newprice > 0, "Price is lesser than 0");
      require(particularItem.seller == msg.sender, "You are not the owner");
      listings[_nftContractAddress][_tokenId] = Listing(_newprice, msg.sender);
    }

    function deleteListing(address _nftContractAddress, uint _tokenId) external isOwner(_nftContractAddress, _tokenId, msg.sender) isListed(_nftContractAddress, _tokenId){
      delete listings[_nftContractAddress][_tokenId];
    }

    function buyItem(address _nftContractAddress, uint _tokenId) external payable {
      Listing memory particularItem = listings[_nftContractAddress][_tokenId];
      
      if (msg.value < particularItem.price) {
        revert("Amount lower than the actual price");
      }

      sellerBalance[particularItem.seller] += msg.value;
      delete listings[_nftContractAddress][_tokenId];
      IERC721(_nftContractAddress).safeTransferFrom(particularItem.seller, msg.sender, _tokenId);
      emit ItemBought(msg.sender, _nftContractAddress, _tokenId, particularItem.price);
    }

    

    
    function getListedItem(address _nftContractAddress, uint _tokenId) public view returns (Listing memory) {
      return listings[_nftContractAddress][_tokenId];
    }

    function withdrawBalance() external {
      uint balance = sellerBalance[msg.sender];
      if (balance <= 0) {
        revert("You do not have any balance");
      }
      sellerBalance[msg.sender] = 0;
      (bool success, ) = payable(msg.sender).call{value: balance} ("");
      require(success, "Transaction failed");
    }

}