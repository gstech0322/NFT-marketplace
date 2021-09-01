import React from 'react'
import { useState, useEffect } from 'react'
import { ethers } from 'ethers'
import axios from 'axios'
import Web3Modal from 'web3modal'
import NFTCard from './NFTCard'
import Spinner from './Spinner'

import { nftaddress, nftmarketaddress } from '../config'
import NFT from '../artifacts/contracts/NFT.sol/NFT.json'
import Market from '../artifacts/contracts/NFTMarket.sol/NFTMarket.json'

const Dashboard = () => {
  const [nfts, setNfts] = useState([])
  const [soldNfts, setSoldNfts] = useState([])
  const [loading, setLoading] = useState(false)

  console.log('soldNFTS', soldNfts)

  const loadNFTs = async () => {
    setLoading(true)

    const web3Modal = new Web3Modal()
    const connection = await web3Modal.connect()
    const provider = new ethers.providers.Web3Provider(connection)

    const signer = provider.getSigner()

    const tokenContract = new ethers.Contract(nftaddress, NFT.abi, provider)
    const marketContract = new ethers.Contract(
      nftmarketaddress,
      Market.abi,
      signer
    )
    const data = await marketContract.fetchItemsCreated()
    console.log('data', data)
    const items = await Promise.all(
      data.map(async (i) => {
        const tokenUri = await tokenContract.tokenURI(i.tokenId)
        const meta = await axios.get(tokenUri)
        let price = ethers.utils.formatUnits(i.price.toString(), 'ether')
        let item = {
          price,
          tokenId: i.tokenId.toNumber(),
          seller: i.seller,
          owner: i.owner,
          image: meta.data.image,
          name: meta.data.name,
          description: meta.data.description,
          sold: i.sold,
        }
        return item
      })
    )
    console.log('items', items)
    const soldItems = items.filter((i) => i.sold)
    setNfts(items)
    setSoldNfts(soldItems)
    setLoading(false)
  }

  useEffect(() => {
    loadNFTs()
  }, [])

  if (loading)
    return (
      <div className='h-screen flex items-center justify-center'>
        <Spinner size={'large'} />
      </div>
    )

  // if (!loading && !nfts.length)
  //   return (
  //     <div>
  //       <h1 className='px-20 py-10 text-3xl'>No created items</h1>
  //     </div>
  //   )

  return (
    // <div className='flex justify-center'>
    <div className='p-4 text-center' style={{ maxWidth: '1600px' }}>
      <h1 className='text-2xl py-2'>Created Items</h1>
      <div className='flex flex-wrap pt-4'>
        {nfts.length ? (
          nfts.map((nft, i) => {
            return <NFTCard key={i} props={{ nft }} />
          })
        ) : (
          <div className='flex m-auto'>
            <p>No created NFTs</p>
          </div>
        )}
      </div>
      <h1 className='text-2xl py-2'>Sold Items</h1>
      <div className='flex flex-wrap pt-4'>
        {soldNfts.length ? (
          soldNfts.map((nft, i) => {
            return <NFTCard key={i} props={{ nft }} />
          })
        ) : (
          <div className='flex m-auto'>
            <p>No sold NFTs</p>
          </div>
        )}
      </div>
    </div>
    // </div>
  )
}

export default Dashboard
