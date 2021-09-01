import React, { useState, useEffect } from 'react'
import { useParams } from 'react-router-dom'
import { ethers } from 'ethers'
import axios from 'axios'
import Web3Modal from 'web3modal'
import Spinner from './Spinner'
import DebtCard from './DebtCard'

import { nftaddress, nftfixeddebtaddress } from '../config'
import NFT from '../artifacts/contracts/NFT.sol/NFT.json'
import FixedDebtRegistry from '../artifacts/contracts/NFTFixedDebtRegistry.sol/NFTFixedDebtRegistry.json'

const MyFixedDebtPositions = () => {
  const params = useParams()
  const [myBorrow, setMyBorrow] = useState([])
  const [myLend, setMyLend] = useState([])
  const [loading, setLoading] = useState(false)
  console.log('myBorrow', myBorrow)
  console.log('myLend', myLend)

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
    console.log('items', items)
    const myBorrowFilteredItems = items.filter(
      (i) => i.borrower === params.address
    )
    const myLendFilteredItems = items.filter((i) => i.lender === params.address)
    setMyBorrow(myBorrowFilteredItems)
    setMyLend(myLendFilteredItems)
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

  return (
    <div className='p-4 text-center' style={{ maxWidth: '1600px' }}>
      <h1 className='text-2xl py-2'>My Borrow Positions</h1>
      <div className='flex flex-wrap pt-4'>
        {myBorrow.length ? (
          myBorrow.map((nft, i) => {
            return <DebtCard key={i} props={{ nft, repayDebt, defaultDebt }} />
          })
        ) : (
          <div className='flex m-auto'>
            <p>No borrow positions</p>
          </div>
        )}
      </div>
      <h1 className='text-2xl py-2'>My Lend Positions</h1>
      <div className='flex flex-wrap pt-4'>
        {myLend.length ? (
          myLend.map((nft, i) => {
            return <DebtCard key={i} props={{ nft, repayDebt, defaultDebt }} />
          })
        ) : (
          <div className='flex m-auto'>
            <p>No Lend positions</p>
          </div>
        )}
      </div>
    </div>
  )
}

export default MyFixedDebtPositions
