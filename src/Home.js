import React, { useEffect, useState } from 'react'
import { useNavigate, useLocation } from 'react-router-dom';
import axios from 'axios';
import markerImg from './images/marker.png';
import './index.css'

const { kakao } = window;
let map = null;
const DEFAULT_LATITUDE = 37;
const DEFAULT_LONGITUDE = 127;

function Home() {

    const navigate = useNavigate();
    const location = useLocation();
    const [latitude, setLatitude] = useState(DEFAULT_LATITUDE);
    const [longitude, setLongitude] = useState(DEFAULT_LONGITUDE);
    const [text, setText] = useState('');

    useEffect(() => {
        if (location.state && location.state.redirect === 'votepage-no-room-id') {
            alert('해당하는 방이 없습니다.');
        } else if (location.state && location.state.redirect === 'unauthorized access') {
            alert('허가되지 않은 접근입니다.');
        }

        const markerImgSrc = markerImg;
        const markerImgSize = new kakao.maps.Size(60, 60);
        const markerImgOption = { offset: new kakao.maps.Point(24, 35) };
        const markerImage = new kakao.maps.MarkerImage(markerImgSrc, markerImgSize, markerImgOption);


        if (navigator.geolocation) {
            navigator.geolocation.getCurrentPosition((position) => {
                setLatitude(position.coords.latitude);
                setLongitude(position.coords.longitude);
                map = new kakao.maps.Map(document.getElementById('map'), {
                    center: new kakao.maps.LatLng(position.coords.latitude, position.coords.longitude),
                    level: 5
                });
                const zoomControl = new kakao.maps.ZoomControl();
                map.addControl(zoomControl, kakao.maps.ControlPosition.RIGHT);

                const marker = new kakao.maps.Marker({
                    position: map.getCenter(),
                    image: markerImage,
                });
                marker.setMap(map);

                kakao.maps.event.addListener(map, 'click', function (mouseEvent) {
                    marker.setPosition(mouseEvent.latLng);
                    setLatitude(mouseEvent.latLng.getLat());
                    setLongitude(mouseEvent.latLng.getLng());
                });
            });
        } else { // geolocation is not supported
            console.log('geolocation is not supported');
        }
    }, [location.state]);

    const handleClick = async (event) => {
        event.preventDefault();
        const res = await axios.post(
            '/rooms',
            { latitude, longitude },
            { withCredentials: true }
        );
        navigate(`/votepage/${res.data.roomID}`, { replace: true });
    };

    const handleSubmit = (event) => {
        event.preventDefault();
        const ps = new kakao.maps.services.Places();
        ps.keywordSearch(text, placesSearchCallback);

        setText('');
    };

    const placesSearchCallback = (data, status, pagination) => {
        if (status === kakao.maps.services.Status.OK) {
            const bounds = new kakao.maps.LatLngBounds();
            data.forEach(item => {
                displayMarker(item);
                bounds.extend(new kakao.maps.LatLng(item.y, item.x));
            });

            map.setBounds(bounds);
        }
    };

    const displayMarker = (place) => {
        const marker = new kakao.maps.Marker({
            map: map,
            position: new kakao.maps.LatLng(place.y, place.x)
        });
    };

    return (
        <div className='w-[360px] flex flex-col items-center'>
            <div className='mealvote font-bold text-[48px] mb-[24px]'>Mealvote</div>
            <div className='w-[360px] h-[360px] shadow' id="map"></div>
            <button
                className='border border-gray-400 mt-[32px] w-[180px] h-[48px] rounded-[4px] shadow bg-indigo-600 text-white hover:bg-indigo-500'
                onClick={handleClick}
            >
                현재 위치로 방 만들기
            </button>
            <h1 className='mt-[32px]'>현재 위치가 아닌 다른 곳을 기준으로 잡고 싶다면 </h1>
            <h1 className='mt-[8px]'> 키워드 검색으로 원하는 위치를 찾아보세요.</h1>
            <div className='mt-[12px]'>
                <form onSubmit={handleSubmit}>
                    <input
                        className='border border-gray-400 w-[250px] h-[40px] pl-[8px] rounded-[4px]'
                        type="text"
                        value={text}
                        onChange={(event) => { setText(event.target.value) }}
                    />
                    <button className='border border-gray-400 ml-[16px] w-[80px] h-[40px] rounded-[4px] shadow' type="submit">검색</button>
                </form>
            </div>
        </div>
    )
}

export default Home