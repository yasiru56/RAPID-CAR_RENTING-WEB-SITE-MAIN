import React,{useState} from 'react';
import Admin from '../assets/manager.webp';
import SupervisorAccountIcon from '@mui/icons-material/SupervisorAccount';
import rapidrent from '../assets/rapidrent.jpg';
import rapidRent from '../assets/rapidrent.jpg';
import {Link} from 'react-router-dom';

function AdminStartPage() {
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
          <img src={rapidRent} alt='Rapid Rent' className='img-fluid rounded mx-auto d-block shadow-lg mb-4' style={{width:'300px', height:'auto'}}/>
          <p className='lead text-center'>Welcome to Rapid Rent! We are a car rental service that offers a wide range of vehicles for rent. Please sign in to continue.</p>
          <hr className='w-100' />
          
          <video src={rapidRent} autoPlay loop muted className='w-100 h-50' />
  
          <hr className='w-100' />
  
          
          
  
          <div className='d-flex flex-column flex-md-row gap-3 mt-4'>
              <div className='text-center'>
                  <h3 className='bold font-weight-bold'>Admin</h3>
                  <p className='lead text-center'>Sign in as a admin to rent vehicles.</p>
                  <img src={Admin} alt='Client' className='img-fluid rounded mx-auto d-block shadow-lg mb-4 w-200' />
                  <Link to='/admin/login' className='btn btn-danger btn-lg mb-2 me-3'><SupervisorAccountIcon/>Sign In</Link>
                  <Link to='/admin/register' className='btn btn-outline-primary btn-lg mb-2'><SupervisorAccountIcon/>Register</Link>
  
                  
              </div>
          </div>
  
        
      </div>
    )
}

export default AdminStartPage

