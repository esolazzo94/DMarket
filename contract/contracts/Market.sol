pragma solidity ^0.4.23;

contract Market {

address private owner;

address public children;

constructor() {
  owner = msg.sender;
  productsCount = 0;
}


struct user {
  string publicKey;
  string name;
  string avatar;
  string[] products;
  uint256 productsLenght;
  bool blocked;
}

mapping (address => user) private users;

function addUser(address userAddress, string key, string name, string avatar) public {
  users[userAddress].publicKey = key;
  users[userAddress].name = name;
  users[userAddress].avatar = avatar;
  users[userAddress].blocked = false;
  users[userAddress].productsLenght = 0;  
}


function getUser(address userAddress) public view returns (string,string,string,bool,uint256) {
  return (users[userAddress].publicKey,users[userAddress].name,users[userAddress].avatar,users[userAddress].blocked,users[userAddress].productsLenght);
}



function getUserProduct(address userAddress, uint256 index) returns(string) {
  return users[userAddress].products[index];
}

function getOwner() public view returns (address) {
  return owner;
}

function blockUser(address user, string product, address buyer) public {
  var requesterAddress = getEscrowAddress(product,buyer);
  if (msg.sender == requesterAddress) {
    users[user].blocked = true;
  }
}

struct product {
  string description;
  address seller;
  uint256 price;
  mapping (address => address) purchase;
  address[] purchaseLUT;
  uint256 purchaseLUTLenght;
}

mapping (string => product) private products;
mapping (uint => string) productsIndex; //doSomeStuff(accountBalances[accountIndex[i]]);
uint productsCount;

function purchase(string hashFile, address escrowAddress) {
  products[hashFile].purchase[msg.sender] = escrowAddress;
  products[hashFile].purchaseLUT.push(msg.sender);
}

function getEscrowAddress(string hashFile, address buyer) returns(address) {
  return products[hashFile].purchase[buyer];
}


function addProduct(string description, string hashProduct, uint256 price) public /*payable*/ {
  products[hashProduct].description = description;
  products[hashProduct].seller = msg.sender;
  products[hashProduct].price = price;
  users[msg.sender].productsLenght++;
  users[msg.sender].products.push(hashProduct);
}

function getProduct(string hashProduct) public returns(string,address,uint256,uint256) {
  return (products[hashProduct].description,products[hashProduct].seller,products[hashProduct].price,products[hashProduct].purchaseLUTLenght);
}

function deleteProduct(address user, string hashProduct, uint256 index) public {
  for (uint i = index; i<users[user].products.length-1; i++){
      users[user].products[i] = users[user].products[i+1];
  }
  delete users[user].products[users[user].products.length-1];
  users[user].products.length--;
  delete products[hashProduct];
}

//function deposit(address payee) public payable

function unblockUser (address user) restricted public {
  users[user].blocked = false;
}

  
function kill() restricted public {
    selfdestruct(msg.sender);
  }

modifier restricted() {
    require(msg.sender == owner);
    _;
  }
}
