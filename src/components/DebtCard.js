import React from 'react'

const DebtCard = ({ props, fullWidth }) => {
  const { nft, fillDebt, repayDebt, defaultDebt } = props
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
        {nft.principal && (
          <>
            <div className='flex text-left items-center justify-center'>
              <p className='text-white pr-1'>Price:</p>
              <p className='text-xl font-bold text-white'>
                {nft.principal} ETH
              </p>
            </div>
            <div className='flex text-left items-center justify-center'>
              <p className='text-white pr-1'>Interest:</p>
              <p className='text-xl font-bold text-white'>
                {nft.interest} ETH
              </p>
            </div>
            <div className='flex text-left items-center justify-center mb-4'>
              <p className='text-white pr-1'>Duration:</p>
              <p className='text-xl font-bold text-white'>
                {nft.duration} seconds
              </p>
            </div>
          </>
        )}
        <div className='flex flex-col'>
          {fillDebt && (
            <button
              className='w-full bg-blue-500 text-white font-bold py-2 px-12 rounded'
              onClick={() => fillDebt(nft)}>
              Fill Debt
            </button>
          )}
          {repayDebt && (
            <button
              className='w-full bg-blue-500 text-white font-bold py-2 px-12 rounded'
              onClick={() => repayDebt(nft)}>
              Repay Debt
            </button>
          )}
          {defaultDebt && (
            <button
              className='w-full bg-blue-500 text-white font-bold py-2 px-12 rounded'
              onClick={() => defaultDebt(nft)}>
              Default Debt
            </button>
          )}
        </div>
      </div>
    </div>
  )
}

export default DebtCard
