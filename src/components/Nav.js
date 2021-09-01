import React, { useContext } from 'react'
import { Link } from 'react-router-dom'
import { StateContext } from '../context/context'
import WalletInfo from './WalletInfo'

const Nav = () => {
  const { connectedWalletAddress } = useContext(StateContext)
  return (
    <nav className='p-3 w-56 h-screen'>
      <h1 className='text-4xl font-bold'>NFT Market</h1>
      <WalletInfo />
      <div className='justify-between'>
        <div className='mt-4 flex flex-col'>
          <h2 className='text-2xl font-bold'>Market</h2>
          <Link to='/' className='text-blue-500 rounded'>
            Home
          </Link>
          <Link to='/create' className='text-blue-500 rounded'>
            Create & Sell
          </Link>
          <Link to='/my-collection' className='text-blue-500 rounded'>
            Purchased NFTs
          </Link>
          <Link to='/dashboard' className='text-blue-500 rounded'>
            Creator Dashboard
          </Link>
          <Link to='/all' className='text-blue-500 rounded'>
            All NFTs
          </Link>
          <Link to='/item/1' className='text-blue-500 rounded'>
            NFT By Id
          </Link>
          <Link
            to={`/wallet/${connectedWalletAddress}`}
            className='text-blue-500 rounded'>
            My Wallet NFTs
          </Link>
        </div>
        <div className='mt-4 flex flex-col'>
          <h2 className='text-2xl font-bold'>Loans</h2>
          <Link to='/home-debt' className='text-blue-500 rounded'>
            Home Fixed Debt
          </Link>
          <Link to='/create-debt' className='text-blue-500 rounded'>
            Create & Request Fixed Debt
          </Link>
          <Link
            to={`/my-fixed-positions/${connectedWalletAddress}`}
            className='text-blue-500 rounded'>
            My Positions
          </Link>
          <Link to='/all-debt' className='text-blue-500 rounded'>
            All Debt
          </Link>
        </div>
      </div>
    </nav>
  )
}

export default Nav
