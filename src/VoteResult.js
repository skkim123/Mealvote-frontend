import React, { useEffect, useState } from 'react'
import { useLocation, useNavigate } from 'react-router-dom'

function VoteResult() {

    const navigate = useNavigate();
    const location = useLocation();
    const [result,setResult] = useState({});

    useEffect(() => {
        if (!location.state?.placeID) {
            navigate('/', { replace: true, state: { redirect: 'unauthorized access' } });
        } else {
            setResult(prev => ({...prev, placeID: location.state.placeID, placeName: location.state.placeName}));
        }
    }, [location.state, navigate]);

    return (
        <div>
            <h1>VoteResult</h1>
            <h2>placeID: {result.placeID}</h2>
            <h2>placeName: {result.placeName}</h2>
        </div>
    )
}

export default VoteResult