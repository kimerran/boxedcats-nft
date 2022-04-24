// SPDX-License-Identifier: MIT

// Amended by HashLips
/**
    !Disclaimer!
    These contracts have been used to create tutorials,
    and was created for the purpose to teach people
    how to create smart contracts on the blockchain.
    please review this code on your own before using any of
    the following code for production.
    HashLips will not be liable in any way if for the use 
    of the code. That being said, the code has been tested 
    to the best of the developers' knowledge to work as intended.
*/

pragma solidity >=0.7.0 <0.9.0;

import "@openzeppelin/contracts/token/ERC721/extensions/ERC721Enumerable.sol";
import "@openzeppelin/contracts/access/Ownable.sol";

contract BoxedCatsNFT is ERC721Enumerable, Ownable {
  using Strings for uint256;

  string baseURI;
  string public baseExtension = ".json";
  uint256 public cost = 0.5 ether;
  uint256 public maxSupply = 9999;
  uint256 public maxMintAmount = 100;
  bool public paused = true;
  bool public revealed = false;
  string public notRevealedUri;

  bool public isLimitedMintingOnly = true;
  uint256 whitelistMaxMint = 100;
  mapping(address => uint) public coOwnerAddress;
  mapping(address => uint) public whiteListAddress;
  mapping(address => uint256) public mintedCountWL;

  constructor(
    string memory _name,
    string memory _symbol,
    string memory _initBaseURI,
    string memory _initNotRevealedUri
  ) ERC721(_name, _symbol) {
    setBaseURI(_initBaseURI);
    setNotRevealedURI(_initNotRevealedUri);
    // set first coOwner
    coOwnerAddress[msg.sender] = 1;
    whiteListAddress[msg.sender] = 1;
  }
 
  // internal
  function _baseURI() internal view virtual override returns (string memory) {
    return baseURI;
  }

  // public
  function setLimitedMintingOnly() public onlyOwner {
    isLimitedMintingOnly = true;
  }

  function setPublicMinting() public onlyOwner {
    isLimitedMintingOnly = false;
  }

  function setCoOwner(address coOwner) public onlyOwner {
    coOwnerAddress[coOwner] = 1;
  }

  function removeCoOwner(address coOwner) public onlyOwner {
    coOwnerAddress[coOwner] = 0;
  }

  // main mint fn
  function mint(uint256 _mintAmount) public payable {
    uint256 supply = totalSupply();
    require(!paused);
    require(_mintAmount > 0, '_mintAmount should be greater than 0');
    require(_mintAmount <= maxMintAmount, '_mintAmount should not exceed maxMintAmount');
    require(supply + _mintAmount <= maxSupply, 'Not enough tokens to mint');

    if (msg.sender != owner() && coOwnerAddress[msg.sender] == 0) {
      require(msg.value >= cost * _mintAmount, 'Payment is not enough to mint');
    }

    if (isLimitedMintingOnly) {
      mintWhitelist(msg.sender, _mintAmount, supply);
    } else {
      mintPublic(msg.sender, _mintAmount, supply);
    }
  }

  function mintWhitelist(address to, uint amount, uint256 supply) private {
    require(whiteListAddress[to] == 1, 'Address is not whitelisted');
    require(mintedCountWL[to] + amount <= whitelistMaxMint, 'Max NFT of Whitelisted exceeded');

    for (uint256 i = 1; i <= amount; i++) {
      _safeMint(to, supply + i);
      mintedCountWL[to]++;
    }
  }

  function mintPublic(address to, uint amount, uint256 supply) private {
    for (uint256 i = 1; i <= amount; i++) {
      _safeMint(to, supply + i);
    }
  }

  function walletOfOwner(address _owner)
    public
    view
    returns (uint256[] memory)
  {
    uint256 ownerTokenCount = balanceOf(_owner);
    uint256[] memory tokenIds = new uint256[](ownerTokenCount);
    for (uint256 i; i < ownerTokenCount; i++) {
      tokenIds[i] = tokenOfOwnerByIndex(_owner, i);
    }
    return tokenIds;
  }

  function tokenURI(uint256 tokenId)
    public
    view
    virtual
    override
    returns (string memory)
  {
    require(
      _exists(tokenId),
      "ERC721Metadata: URI query for nonexistent token"
    );
    
    if(revealed == false) {
        return notRevealedUri;
    }

    string memory currentBaseURI = _baseURI();
    return bytes(currentBaseURI).length > 0
        ? string(abi.encodePacked(currentBaseURI, tokenId.toString(), baseExtension))
        : "";
  }

  //only owner
  function whitelistUsers(address[] calldata _users) public onlyOwner {
    // delete whiteListAddress;
    for (uint256 i; i < _users.length; i++) {
      whiteListAddress[_users[i]] = 1;
    }
    // whiteListAddress = _users;
  }

  function reveal() public onlyOwner {
      revealed = true;
  }
  
  function setCost(uint256 _newCost) public onlyOwner {
    cost = _newCost;
  }

  function setmaxMintAmount(uint256 _newmaxMintAmount) public onlyOwner {
    maxMintAmount = _newmaxMintAmount;
  }
  
  function setNotRevealedURI(string memory _notRevealedURI) public onlyOwner {
    notRevealedUri = _notRevealedURI;
  }

  function setBaseURI(string memory _newBaseURI) public onlyOwner {
    baseURI = _newBaseURI;
  }

  function setBaseExtension(string memory _newBaseExtension) public onlyOwner {
    baseExtension = _newBaseExtension;
  }

  function pause(bool _state) public onlyOwner {
    paused = _state;
  }
 
  function withdraw() public payable onlyOwner {    
    (bool os, ) = payable(owner()).call{value: address(this).balance}("");
    require(os);
    // =============================================================================
  }
}
