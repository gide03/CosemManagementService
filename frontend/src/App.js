import React, { useEffect, useState } from 'react';
import styled from 'styled-components'
import { BrowserRouter as Router, Route, Link, Routes } from 'react-router-dom';
import DataViewer from './PageDataViewer';
import LoginPage from './Login';
import RegisterPage from './Register';
import AccountPage from './Account';
import HomePage from './HomePage';
import LogoutPage from './LogoutPage';
import axios from 'axios';

const StyledNavigator = styled.nav`
  min-width: 10rem;
  border:1px solid black;
  padding: .7rem;
  border-bottom-left-radius: 10px;
  border-bottom-right-radius: 10px;
  z-index: 10;
  top: 0;
  margin-left: 50%;
  margin-right: 50%;
  display: flex;
  position: absolute;
  justify-content: space-evenly;
  transform: translate(-50%, -25%);

  background-color: white;

  .nav-item{
    margin-left: 0.50rem;
    margin-right: 0.50rem;
    
    color: black;
    text-decoration: none;
  }
`

function App() {
  const [jwt, update_jwt] = useState(null);
  const [username, updateUsername] = useState('');

  const AssociationContext = {
    jwt: jwt,
    update_jwt: update_jwt,
    username: username,
    updateUsername: updateUsername,
  }

  useEffect(()=>{
    console.log('[App] Fresh run')
    // To retrieve data from localStorage
    const data = JSON.parse(localStorage.getItem('association'));
    if (data !== null){
      console.log(`[App] testing jwt ${data.jwt}`)
      axios.get(
        "http://10.23.40.185/api/auth/test", 
        {headers:{
          Authorization: `Bearer ${data.jwt}`,
          'Content-Type': 'multipart/form-data'
        }})
        .then(()=>{
          console.log('[App] Already Logged In');
          update_jwt(data.jwt);
          updateUsername(data.user.username);
        })
        .catch((error)=>{
          console.log(`[App] Token invalid}`);
          console.log(error);
          localStorage.removeItem('association');
          alert('Your session is over');
          window.location.href = '/'
      })
    }
    else{
      update_jwt('')
    }

    // To set data in localStorage
    // localStorage.setItem('association', 'value');

    // To remove localStorage by key
    // localStorage.removeItem('association');

  }, [])



  return (
    <Router>
      <StyledNavigator> 
        <Link to='/'></Link>
        <div className='nav-item'>
          <Link to='/dataviewer'>DataViewer</Link>
        </div>
        {
          jwt === '' ? <>
            <div className='nav-item'>
              <Link to='/login'>Login</Link>
            </div>
          </>
          :
          <div>
            <Link to='/account'>{username}</Link>
          </div>
        }
      </StyledNavigator>
    
      <Routes>
        <Route path="/" element={<HomePage AssociationContext={AssociationContext}/>}></Route>
        <Route path="/dataviewer" element={<DataViewer AssociationContext={AssociationContext}/>} />
        {jwt === '' && <>
          <Route path="/login" element={<LoginPage AssociationContext={AssociationContext}/>} />
          <Route path="/register" element={<RegisterPage AssociationContext={AssociationContext}/>} />
        </>}
        <Route path="/account" element={<AccountPage AssociationContext={AssociationContext}/>}/>
        <Route path="/logout" element={<LogoutPage AssociationContext={AssociationContext}s></LogoutPage>}/>
      </Routes>
   
    </Router>
    );
  }
  
  export default App;
  