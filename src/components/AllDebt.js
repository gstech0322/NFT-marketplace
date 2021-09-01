import React from 'react'
import { useState, useEffect } from 'react'
import { ethers } from 'ethers'
import axios from 'axios'
import Web3Modal from 'web3modal'
import DebtCard from './DebtCard'
import Spinner from './Spinner'

import { nftaddress, nftfixeddebtaddress } from '../config'
import NFT from '../artifacts/contracts/NFT.sol/NFT.json'
import FixedDebtRegistry from '../artifacts/contracts/NFTFixedDebtRegistry.sol/NFTFixedDebtRegistry.json'

const AllDebt = () => {
  const [nfts, setNfts] = useState([])
  const [loading, setLoading] = useState(false)
  console.log('nfts', nfts)

  const getAllDebtItems = async () => {
    setLoading(true)
    const provider = new ethers.providers.JsonRpcProvider(process.env.REACT_APP_JSON_RPC_URL)
    const tokenContract = new ethers.Contract(nftaddress, NFT.abi, provider)
    const fixedDebtContract = new ethers.Contract(
      nftfixeddebtaddress,
      FixedDebtRegistry.abi,
      provider
    )
    const data = await fixedDebtContract.fetchAllDebtItems()
    const items = await Promise.all(
      data.map(async (i) => {
        const tokenUri = await tokenContract.tokenURI(i.tokenId)
        const meta = await axios.get(tokenUri)
        let principal = ethers.utils.formatUnits(
          i.principal.toString(),
          'ether'
        )
        let interest = ethers.utils.formatUnits(i.interest.toString(), 'ether')
        let repaymentAmount = ethers.utils.formatUnits(
          i.repaymentAmount.toString(),
          'ether'
        )
        let item = {
          principal,
          duration: i.duration.toNumber(),
          interest,
          repaymentAmount,
          tokenId: i.tokenId.toNumber(),
          borrower: i.borrower,
          lender: i.lender,
          image: meta.data.image,
          name: meta.data.name,
          description: meta.data.description,
          active: i.active,
          repaid: i.repaid,
          defaulted: i.defaulted,
        }
        return item
      })
    )
    setNfts(items)
    setLoading(false)
  }

  const repayDebt = async (nft) => {
    const web3Modal = new Web3Modal()
    const connection = await web3Modal.connect()
    const provider = new ethers.providers.Web3Provider(connection)

    const signer = provider.getSigner()
    const contract = new ethers.Contract(
      nftfixeddebtaddress,
      FixedDebtRegistry.abi,
      signer
    )

    const repaymentAmount = ethers.utils.parseUnits(
      nft.repaymentAmount.toString(),
      'ether'
    )

    const transaction = await contract.repayDebt(nftaddress, nft.tokenId, {
      value: repaymentAmount,
    })
    await transaction.wait()

    getAllDebtItems()
  }

  const defaultDebt = async (nft) => {
    const web3Modal = new Web3Modal()
    const connection = await web3Modal.connect()
    const provider = new ethers.providers.Web3Provider(connection)

    const signer = provider.getSigner()
    const contract = new ethers.Contract(
      nftfixeddebtaddress,
      FixedDebtRegistry.abi,
      signer
    )

    const transaction = await contract.defaultDebt(nftaddress, nft.tokenId)
    await transaction.wait()

    getAllDebtItems()
  }

  // const withdrawNFT = async (nft) => {
  //   const web3Modal = new Web3Modal()
  //   const connection = await web3Modal.connect()
  //   const provider = new ethers.providers.Web3Provider(connection)

  //   const signer = provider.getSigner()
  //   const contract = new ethers.Contract(
  //     nftfixeddebtaddress,
  //     FixedDebtRegistry.abi,
  //     signer
  //   )

  //   const price = ethers.utils.parseUnits(nft.price.toString(), 'ether')

  //   const transaction = await contract.withdrawMarketItem(
  //     nftaddress,
  //     nft.tokenId
  //   )
  //   await transaction.wait()

  //   getAllDebtItems()
  // }

  useEffect(() => {
    getAllDebtItems()
  }, [])

  if (loading)
    return (
      <div className='h-screen flex items-center justify-center'>
        <Spinner size={'large'} />
      </div>
    )

  if (!loading && !nfts.length)
    return (
      <div className='h-screen flex items-center justify-center'>
        <h1 className='px-20 py-10 text-3xl'>No items in marketplace</h1>
      </div>
    )

  return (
    <div className='flex justify-center'>
      <div className='p-4 w-full' style={{ maxWidth: '1600px' }}>
        <div className='flex flex-wrap pt-4'>
          {nfts.map((nft, i) => {
            return <DebtCard key={i} props={{ nft, repayDebt, defaultDebt }} />
          })}
        </div>
      </div>
    </div>
  )
}

export default AllDebt
