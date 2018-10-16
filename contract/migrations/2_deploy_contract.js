var Market = artifacts.require("./Market.sol");
//var MarketEscrow = artifacts.require("./MarketEscrow.sol");

module.exports = function(deployer) {
  deployer.deploy(Market);
  //deployer.deploy(MarketEscrow);
};



