import React from 'react'
import { useState, useEffect } from 'react'
import { ethers } from 'ethers'
import { create as ipfsHttpClient } from 'ipfs-http-client'
import Web3Modal from 'web3modal'
import { withRouter } from 'react-router'
import {
  useParams,
  useLocation,
  useHistory,
  useRouteMatch,
} from 'react-router-dom'
import Spinner from './Spinner'

import { nftaddress, nftfixeddebtaddress } from '../config'
import NFT from '../artifacts/contracts/NFT.sol/NFT.json'
import FixedDebtRegistry from '../artifacts/contracts/NFTFixedDebtRegistry.sol/NFTFixedDebtRegistry.json'

const client = ipfsHttpClient('https://ipfs.infura.io:5001/api/v0')

const CreateDebt = () => {
  const history = useHistory()
  const [fileUrl, setFileUrl] = useState(null)
  const [formData, setFormData] = useState({
    principal: '',
    interest: '',
    duration: '',
    name: '',
    description: '',
  })
  const [loading, setLoading] = useState(false)

  console.log('formData', formData)

  const handleForm = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value })
  }

  const createDebtItem = async (url) => {
    const web3Modal = new Web3Modal()
    const connection = await web3Modal.connect()
    const provider = new ethers.providers.Web3Provider(connection)

    const signer = provider.getSigner()

    let contract = new ethers.Contract(nftaddress, NFT.abi, signer)
    let transaction = await contract.createToken(url)
    let tx = await transaction.wait()

    let event = tx.events[0]
    let value = event.args[2]
    let tokenId = value.toNumber()
    console.log('tokenId', tokenId)

    const principal = ethers.utils.parseUnits(formData.principal, 'ether')
    const interest = ethers.utils.parseUnits(formData.interest, 'ether')
    const duration = parseInt(formData.duration)

    contract = new ethers.Contract(
      nftfixeddebtaddress,
      FixedDebtRegistry.abi,
      signer
    )
    let listingFee = await contract.getListingFee()
    listingFee = listingFee.toString()

    transaction = await contract.createDebtItem(
      nftaddress,
      tokenId,
      principal,
      duration,
      interest,
      {
        value: listingFee,
      }
    )
    await transaction.wait()
    history.push('/home-debt')
  }

  const handleFile = async (e) => {
    setLoading(true)
    const file = e.target.files[0]
    try {
      const added = await client.add(file, {
        progress: (prog) => console.log(`received: ${prog}`),
      })
      console.log('added', added)
      const url = `https://ipfs.infura.io/ipfs/${added.path}`
      setFileUrl(url)
      setLoading(false)
    } catch (e) {
      console.log('Error uploading file: ', e)
      setLoading(false)
    }
  }

  const createNFT = async (e) => {
    e.preventDefault()

    const { name, description, principal } = formData
    if (!name || !description || !principal || !fileUrl) return

    const data = JSON.stringify({ name, description, image: fileUrl })

    try {
      const added = await client.add(data, {
        progress: (prog) => console.log(`received: ${prog}`),
      })
      console.log('added', added)
      const url = `https://ipfs.infura.io/ipfs/${added.path}`
      createDebtItem(url)
    } catch (e) {
      console.log('e', e)
    }
  }

  const handleDurationQuickButton = (e, duration) => {
    e.preventDefault()
    console.log('duration', duration)
    setFormData({ ...formData, duration: duration.toString() })
  }

  return (
    <div className='flex justify-center h-full items-center'>
      {/* <div className='w-1/2 flex flex-col pb-12'> */}
      <form className='w-1/2 flex flex-col pb-12'>
        {loading && (
          <div className='flex m-auto'>
            <Spinner size='large' />
          </div>
        )}
        {fileUrl && !loading && (
          <img
            className='rounded mx-auto'
            width='200'
            src={fileUrl}
            alt='Uploaded NFT file'
          />
        )}
        <label className='mt-4 flex flex-col items-center px-4 py-6 bg-white text-blue-500 rounded-lg tracking-wide uppercase border cursor-pointer hover:bg-blue-700 hover:text-white'>
          <svg
            className='w-8 h-8'
            fill='currentColor'
            xmlns='http://www.w3.org/2000/svg'
            viewBox='0 0 20 20'>
            <path d='M16.88 9.1A4 4 0 0 1 16 17H5a5 5 0 0 1-1-9.9V7a3 3 0 0 1 4.52-2.59A4.98 4.98 0 0 1 17 8c0 .38-.04.74-.12 1.1zM11 11h3l-4-4-4 4h3v3h2v-3z' />
          </svg>
          <span className='mt-2 text-base leading-normal'>Select a file</span>
          <input
            type='file'
            name='file'
            placeholder='File'
            className='hidden'
            onChange={(e) => handleFile(e)}
          />
        </label>
        <input
          type='text'
          name='name'
          placeholder='Name'
          className='mt-2 border rounded p-4'
          onChange={(e) => handleForm(e)}
        />
        <textarea
          type='text'
          name='description'
          placeholder='Description'
          className='mt-2 border rounded p-4'
          onChange={(e) => handleForm(e)}
        />
        <input
          type='number'
          name='principal'
          value={formData.principal}
          placeholder='Principal'
          min={0}
          className='mt-2 border rounded p-4'
          onChange={(e) => handleForm(e)}
        />
        <input
          type='number'
          name='interest'
          value={formData.interest}
          placeholder='Interest (in currency units)'
          min={0}
          className='mt-2 border rounded p-4'
          onChange={(e) => handleForm(e)}
        />
        <input
          type='number'
          name='duration'
          value={formData.duration}
          placeholder='Duration (in seconds)'
          min={0}
          className='mt-2 border rounded p-4'
          onChange={(e) => handleForm(e)}
        />
        <div className='flex flex-row text-xs items-center mt-2'>
          <p>Duration:</p>
          <button
            className='font-bold bg-blue-500 text-white rounded p-2 shadow-lg m-auto'
            onClick={(e) => handleDurationQuickButton(e, 60)}>
            1 minute
          </button>
          <button
            className='font-bold bg-blue-500 text-white rounded p-2 shadow-lg m-auto'
            onClick={(e) => handleDurationQuickButton(e, 60 * 60)}>
            1 hour
          </button>
          <button
            className='font-bold bg-blue-500 text-white rounded p-2 shadow-lg m-auto'
            onClick={(e) => handleDurationQuickButton(e, 60 * 60 * 24)}>
            1 day
          </button>
          <button
            className='font-bold bg-blue-500 text-white rounded p-2 shadow-lg m-auto'
            onClick={(e) => handleDurationQuickButton(e, 60 * 60 * 24 * 7)}>
            1 week
          </button>
        </div>
        <button
          type='submit'
          className='font-bold mt-4 bg-blue-500 text-white rounded p-4 shadow-lg m-auto'
          onClick={(e) => createNFT(e)}>
          Create and Request Loan for NFT
        </button>
      </form>
      {/* </div> */}
    </div>
  )
}

export default CreateDebt
