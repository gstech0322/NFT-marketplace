import React from 'react'

const NFTCard = ({ props, fullWidth }) => {
  const { nft, buyNFT, withdrawNFT, createSale } = props
  console.log('nft', nft)
  return (
    <div
      className={`border shadow rounded-xl overflow-hidden text-center ${
        fullWidth ? 'w-full' : 'w-full md:w-1/2  lg:w-1/3'
      }`}>
      <img className='card-image' src={nft.image} alt='nft' />
      <div className='flex'>
        <p
          style={{ height: '64px' }}
          className='text-2xl font-semibold px-2 flex items-center m-auto'>
          {nft.name}
        </p>
      </div>
      <div
        className='my-6 overflow-hidden flex'
        style={{
          height: '70px',
        }}>
        <p className='text-gray-400 px-2 flex items-center m-auto'>
          {nft.description}
        </p>
      </div>
      <div className='p-4 bg-gray-500'>
        {nft.price && (
          <div className='flex text-left items-center justify-center mb-4'>
            <p className='text-white pr-4'>Price:</p>
            <p className='text-xl font-bold text-white'>{nft.price} ETH</p>
          </div>
        )}
        <div className='flex flex-col'>
          {buyNFT && (
            <button
              className='w-full bg-blue-500 text-white font-bold py-2 px-12 rounded'
              onClick={() => buyNFT(nft)}>
              Buy
            </button>
          )}
          {withdrawNFT && (
            <button
              className='w-full bg-white text-blue-500 font-bold py-2 px-12 rounded'
              onClick={() => withdrawNFT(nft)}>
              Withdraw
            </button>
          )}
          {createSale && (
            <button
              className='w-full bg-white text-blue-500 font-bold py-2 px-12 rounded'
              onClick={() => createSale(nft)}>
              Sell
            </button>
          )}
        </div>
      </div>
    </div>
  )
}

export default NFTCard
