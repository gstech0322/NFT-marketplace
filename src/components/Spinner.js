import React from 'react'

const Spinner = ({ size }) => {
  console.log('size', size)
  const sizeMap = {
    large: '100px',
    medium: '50px',
    small: '24px',
  }

  return (
    <div
      style={{ width: sizeMap[size], height: sizeMap[size] }}
      className='spinner'></div>
  )
}

export default Spinner
