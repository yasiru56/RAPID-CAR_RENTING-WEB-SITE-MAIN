import React, { useState } from 'react'
import rapidRent from '../assets/rapidrent.jpg';
import rapidVideo from '../assets/rapidrent.mp4';
import {Link} from 'react-router-dom';
import Client from '../assets/client.jpg';
import PersonIcon from '@mui/icons-material/Person';

function StartPage() {
   const [hover,setHover] = useState(false);

  return (
    <div className='container-fluid  min-vh-100 d-flex flex-column justify-content-center align-items-center'>
        <h1 className='display-3 mb-4 bold font-weight-bold text-center'  
        style={{
            color: hover ? 'red' : 'green',
            transition: 'color 0.5s'
        }}
        onMouseEnter={() => setHover(true)}
        onMouseLeave={() => setHover(false)}
        > Rapid Rent</h1>
        <img src={rapidRent} alt='Rapid Rent' className='img-fluid rounded mx-auto d-block shadow-lg mb-4 w-10' style={{width:'300px', height:'auto'}}/>
        <p className='lead text-center'>Welcome to Rapid Rent! We are a car rental service that offers a wide range of vehicles for rent. Please sign in to continue.</p>
        <hr className='w-100' />
        
        <video src={rapidVideo} autoPlay loop muted className='w-100 h-50' />

        <hr className='w-100' />

        
        

        <div className='d-flex flex-column flex-md-row gap-3 mt-4'>
            <div className='text-center'>
                <h3 className='bold font-weight-bold'>User</h3>
                <p className='lead text-center'>Sign in as a user to rent vehicles.</p>
                <img src={Client} alt='Client' className='img-fluid rounded mx-auto d-block shadow-lg mb-4 w-200' />
                <Link to='/user/login' className='btn btn-outline-danger btn-lg mb-2 me-3' style={{color: hover? 'white' : 'red', transition: 'color 0.5s'}}
                onMouseEnter={() => setHover(true)}
                onMouseLeave={() => setHover(false)}
                ><PersonIcon/>Sign In</Link>
                <Link to='/user/register' className='btn btn-outline-primary btn-lg mb-2'><PersonIcon/>Register</Link>

                
            </div>
        </div>

      
    </div>
  )
}

export default StartPage
