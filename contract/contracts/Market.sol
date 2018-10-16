pragma solidity ^0.4.23;

contract Market {

address private owner;

address public children;

struct user {
  string publicKey;
  string[] products;
}

mapping (address => user) private users;

function addUser(address userAddress, string key) public {
  users[userAddress].publicKey = key;
}

function getUserPublicKey(address userAddress) public view returns (string) {
  return users[userAddress].publicKey;
}


function getOwner() public view returns (address) {
  return owner;
}

struct product {
  string description;
  address seller;
  uint256 price;
  mapping (address => address) purchase;
  address[] purchaseLUT;
}

mapping (string => product) private products;


function purchase(string hashFile, address escrowAddress) {
  products[hashFile].purchase[msg.sender] = escrowAddress;
  products[hashFile].purchaseLUT.push(msg.sender);
}

function getEscrowAddress(string hashFile, address buyer) returns(address) {
  return products[hashFile].purchase[buyer];
}

function addProduct(string description, string hashProduct, uint256 price) public /*payable*/ {
  product memory p;
  p.description = description;
  //p.hashAddress = hashAddress;
  p.seller = msg.sender;
  p.price = price;
  //p.deposit = msg.value;
  products[hashProduct] = p;
}

function getProduct(string hashProduct) public returns(string) {
  return products[hashProduct].description;
}

//function deposit(address payee) public payable




constructor() public {
    owner = msg.sender;
  }
  
function kill() restricted public {
    selfdestruct(msg.sender);
  }

modifier restricted() {
    require(msg.sender == owner);
    _;
  }
}
