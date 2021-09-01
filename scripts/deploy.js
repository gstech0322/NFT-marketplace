const hre = require('hardhat')

async function main() {
  const NFTMarket = await hre.ethers.getContractFactory('NFTMarket')
  const nftMarket = await NFTMarket.deploy()
  await nftMarket.deployed()
  console.log('nftMarket deployed to:', nftMarket.address)

  const NFTFixedDebtRegistry = await hre.ethers.getContractFactory(
    'NFTFixedDebtRegistry'
  )
  const nftFixedDebtRegistry = await NFTFixedDebtRegistry.deploy()
  await nftFixedDebtRegistry.deployed()
  console.log('nftFixedDebtRegistry deployed to:', nftFixedDebtRegistry.address)

  const NFT = await hre.ethers.getContractFactory('NFT')
  const nft = await NFT.deploy(nftMarket.address, nftFixedDebtRegistry.address)
  await nft.deployed()
  console.log('nft deployed to:', nft.address)

  const NFTProfile = await hre.ethers.getContractFactory('NFTProfile')
  const nftProfile = await NFTProfile.deploy('NFT Profile', 'ID')
  await nftProfile.deployed()
  console.log('nftProfile deployed to:', nftProfile.address)

  const ERC20Token = await hre.ethers.getContractFactory('ERC20Token')
  const erc20Token = await ERC20Token.deploy('ERC20Token', 'E20')
  await erc20Token.deployed()
  console.log('erc20Token deployed to:', erc20Token.address)
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error)
    process.exit(1)
  })
