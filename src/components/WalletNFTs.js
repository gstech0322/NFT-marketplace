import React from 'react'
import { useState, useEffect } from 'react'
import {
  useParams,
  useLocation,
  useHistory,
  useRouteMatch,
} from 'react-router-dom'
import { ethers } from 'ethers'
import axios from 'axios'
import Web3Modal from 'web3modal'
import NFTCard from './NFTCard'
import Spinner from './Spinner'

import { nftaddress, nftmarketaddress } from '../config'

import NFT from '../artifacts/contracts/NFT.sol/NFT.json'
import Market from '../artifacts/contracts/NFTMarket.sol/NFTMarket.json'

const WalletNFTs = () => {
  const params = useParams()
  const [nfts, setNfts] = useState([])
  const [loading, setLoading] = useState(false)
  console.log('params', params)

  const loadNFTs = async () => {
    setLoading(true)
    const provider = new ethers.providers.JsonRpcProvider(process.env.REACT_APP_JSON_RPC_URL)
    const tokenContract = new ethers.Contract(nftaddress, NFT.abi, provider)
    const marketContract = new ethers.Contract(
      nftmarketaddress,
      Market.abi,
      provider
    )
    const data = await marketContract.fetchAllNFTs()
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
        //
        const owner = await tokenContract.ownerOf(i.tokenId.toNumber())
        console.log('owner', item.name, owner)
        return item
      })
    )
    const filteredItems = items.filter((i) => i.owner === params.address)
    setNfts(filteredItems)
    setLoading(false)
  }

  const getAddressNFTs = async () => {
    setLoading(true)
    const provider = new ethers.providers.JsonRpcProvider(process.env.REACT_APP_JSON_RPC_URL)
    const tokenContract = new ethers.Contract(nftaddress, NFT.abi, provider)

    let data = await tokenContract.totalSupply()
    data = data.toNumber()
    const tokenIdArray = []
    for (let i = 0; i < data; i++) {
      tokenIdArray.push(i + 1)
    }
    console.log('tokenIdArray', tokenIdArray)
    const tokenOwnerMap = await Promise.all(
      tokenIdArray.map(async (id) => {
        const ownerAddress = await tokenContract.ownerOf(id)
        const tokenUri = await tokenContract.tokenURI(id)
        const meta = await axios.get(tokenUri)
        const item = {
          id,
          ownerAddress,
          name: meta.data.name,
          description: meta.data.description,
          image: meta.data.image,
        }
        return item
      })
    )

    const filteredItems = tokenOwnerMap.filter(
      (i) => i.ownerAddress === params.address
    )

    console.log('filteredItems', filteredItems)

    setNfts(filteredItems)
    setLoading(false)
  }

  // const buyNFT = async (nft) => {
  //   const web3Modal = new Web3Modal()
  //   const connection = await web3Modal.connect()
  //   const provider = new ethers.providers.Web3Provider(connection)

  //   const signer = provider.getSigner()
  //   const contract = new ethers.Contract(nftmarketaddress, Market.abi, signer)

  //   const price = ethers.utils.parseUnits(nft.price.toString(), 'ether')

  //   console.log('buyNFT price', price)

  //   const transaction = await contract.createMarketSale(
  //     nftaddress,
  //     nft.tokenId,
  //     { value: price }
  //   )
  //   await transaction.wait()

  //   loadNFTs()
  // }

  const createSale = async (nft) => {
    const web3Modal = new Web3Modal()
    const connection = await web3Modal.connect()
    const provider = new ethers.providers.Web3Provider(connection)

    const signer = provider.getSigner()

    const marketContract = new ethers.Contract(
      nftmarketaddress,
      Market.abi,
      signer
    )

    const formData = { price: 50 }
    const price = ethers.utils.parseUnits(formData.price.toString(), 'ether')
    console.log('price', price)

    let listingFee = await marketContract.getListingFee()
    listingFee = listingFee.toString()
    console.log('nft', nft)

    console.log('listingFee', listingFee)

    let transaction = await marketContract.createMarketItem(
      nftaddress,
      nft.id,
      price,
      {
        value: listingFee,
      }
    )
    await transaction.wait()
    // history.push('/')
  }

  useEffect(() => {
    // loadNFTs()
    getAddressNFTs()
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
        <h1 className='px-20 py-10 text-3xl'>No NFTs created</h1>
      </div>
    )

  return (
    <div className='flex justify-center'>
      <div className='p-4' style={{ maxWidth: '1600px' }}>
        <div className='grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 pt-4'>
          {nfts.map((nft, i) => {
            return <NFTCard key={i} props={{ nft, createSale }} />
          })}
        </div>
      </div>
    </div>
  )
}

export default WalletNFTs
