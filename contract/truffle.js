//Configurazione per il deploy
//development con Ganache

module.exports = {
  networks: {
    development: {
      host: "localhost",
      port: 7545,
      network_id: "*" // Match any network id
    },
    rinkeby: {
      host: "localhost", // Connect to geth on the specified
      port: 8545,
      from: "0x49be7062738ce11455e9cede3e9cfc02ced6eda1", 
      network_id: 4,
      gas: 4612388 // Gas limit used for deploys
    },
    rinkeby: {
      provider: new HDWalletProvider(mnemonic, 'https://rinkeby.infura.io'),
      network_id: '*',
      gas: 4500000,
      gasPrice: 25000000000
    }
  }
};
