import React, { useState } from 'react';
import Owner from '../assets/owner.webp';
import BusinessIcon from '@mui/icons-material/Business';
import rapidVideo from '../assets/rapidrent.mp4';
import rapidRent from '../assets/rapidrent.jpg';
import { Link } from 'react-router-dom';

function OwnerStartPage() {
    const [hover, setHover] = useState(false);

    return (
        <div className='container-fluid min-vh-100 d-flex flex-column justify-content-center align-items-center'>
            <h1 className='display-3 mb-4 bold font-weight-bold text-center'
                style={{
                    color: hover ? 'blue' : 'green',
                    transition: 'color 0.5s'
                }}
                onMouseEnter={() => setHover(true)}
                onMouseLeave={() => setHover(false)}
            > Rapid Rent</h1>
            <img src={rapidRent} alt='Rapid Rent' className='img-fluid rounded mx-auto d-block shadow-lg mb-4' style={{ width: '300px', height: 'auto' }} />
            <p className='lead text-center'>Welcome to Rapid Rent! We are a car rental service that connects vehicle owners with renters. Please sign in to continue.</p>
            <hr className='w-100' />

            <video src={rapidVideo} autoPlay loop muted className='w-100 h-50' />

            <hr className='w-100' />

            <div className='d-flex flex-column flex-md-row gap-3 mt-4'>
                <div className='text-center'>
                    <h3 className='bold font-weight-bold'>Vehicle Owner</h3>
                    <p className='lead text-center'>Sign in as a vehicle owner to manage your fleet.</p>
                    <img src={Owner} alt='Owner' className='img-fluid rounded mx-auto d-block shadow-lg mb-4 w-200' />
                    <Link to='/owner/login' className='btn btn-primary btn-lg mb-2 me-3'><BusinessIcon />Sign In</Link>
                    <Link to='/owner/register' className='btn btn-outline-success btn-lg mb-2'><BusinessIcon />Register</Link>
                </div>
            </div>
        </div>
    )
}

export default OwnerStartPage;
