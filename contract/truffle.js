//Configurazione per il deploy
//development con Ganache

var HDWalletProvider = require("truffle-hdwallet-provider");
var mnemonic = "pill multiply dial awkward flash left always air price valley glass envelope";

module.exports = {
  networks: {
    development: {
      host: "localhost",
      port: 7545,
      network_id: "*" // Match any network id
    },
    rinkeby: {
      provider: function() { return new HDWalletProvider(mnemonic, 'https://rinkeby.infura.io/v3/aeed36baad5e48838a5b7869b2da89fa',1); },
      network_id: 4,
      gas: 7000000,
      gasPrice: 2000000000
    }
  }
};
