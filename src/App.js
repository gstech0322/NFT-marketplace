import { BrowserRouter as Router, Switch, Route } from 'react-router-dom'
import ContextProvider from './context/context'
import Nav from './components/Nav'
import Home from './components/Home'
import Create from './components/Create'
import MyCollection from './components/MyCollection'
import Dashboard from './components/Dashboard'
import AllNFTs from './components/AllNFTs'
import WalletNFTs from './components/WalletNFTs'
import SingleNFT from './components/SingleNFT'
import CreateDebt from './components/CreateDebt'
import HomeDebt from './components/HomeDebt'
import AllDebt from './components/AllDebt'
import MyFixedDebtPositions from './components/MyFixedDebtPositions'
import './App.css'

import logo from './logo.svg'
{
  /* <img src={logo} className="App-logo" alt="logo" /> */
}

function App() {
  return (
    <ContextProvider>
      <Router>
        <div className='flex'>
          <Nav />
          <div className='w-full'>
            <Switch>
              <Route exact path='/' component={Home} />
              <Route path='/create' component={Create} />
              <Route path='/my-collection' component={MyCollection} />
              <Route path='/dashboard' component={Dashboard} />
              <Route path='/all' component={AllNFTs} />
              <Route path='/wallet/:address' component={WalletNFTs} />
              <Route path='/item/:id' component={SingleNFT} />
              <Route path='/create-debt' component={CreateDebt} />
              <Route path='/home-debt' component={HomeDebt} />
              <Route path='/all-debt' component={AllDebt} />
              <Route
                path='/my-fixed-positions/:address'
                component={MyFixedDebtPositions}
              />
            </Switch>
          </div>
        </div>
      </Router>
    </ContextProvider>
  )
}

export default App
