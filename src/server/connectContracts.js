/**
 * @author hfccr
 * */
const connectContracts = async (
  flightSuretyApp,
  flightSuretyData,
  accounts,
  gas
) => {
  const dataContractOwner = accounts[0];
  const appAddress = flightSuretyApp._address;
  const isConnected = await flightSuretyData.methods
    .isCallerAuthorized(appAddress)
    .call({ from: dataContractOwner });
  if (isConnected) {
    console.log(`App and data contracts already connected`);
    return;
  }
  await flightSuretyData.methods.authorizeCaller(appAddress).send({
    from: dataContractOwner,
    gas: gas
  });
};

export default connectContracts;
