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

const MyCollection = () => {
  const [nfts, setNfts] = useState([])
  const [loading, setLoading] = useState(false)

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
    const data = await marketContract.fetchMyNFTs()
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
    setNfts(items)
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

  if (!loading && !nfts.length)
    return (
      <div className='h-screen flex items-center justify-center'>
        <h1 className='px-20 py-10 text-3xl'>No owned items</h1>
      </div>
    )

  return (
    <div className='flex justify-center'>
      <div className='p-4' style={{ maxWidth: '1600px' }}>
        <div className='grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 pt-4'>
          {nfts.map((nft, i) => {
            return <NFTCard key={i} props={{ nft }} />
          })}
        </div>
      </div>
    </div>
  )
}

export default MyCollection
