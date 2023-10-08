import React, { useEffect, useState } from 'react'
import { useNavigate, useLocation } from 'react-router-dom';
import axios from 'axios';
import markerImg from './images/marker.png';

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
            alert('There is no room with the given roomID');
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
                    level: 3
                });
                const zoomControl = new kakao.maps.ZoomControl();
                map.addControl(zoomControl, kakao.maps.ControlPosition.RIGHT);

                const marker = new kakao.maps.Marker({
                    position: map.getCenter(),
                    image: markerImage,
                });
                marker.setMap(map);
                const circle = new kakao.maps.Circle({
                    center : new kakao.maps.LatLng(position.coords.latitude, position.coords.longitude),   
                    radius: 500, 
                    strokeWeight: 1, 
                    strokeColor: '#75B8FA', 
                    strokeOpacity: 1, 
                    strokeStyle: 'solid',
                    fillColor: '#CFE7FF',  
                    fillOpacity: 0.3,
                }); 
                
                circle.setMap(map); 

                kakao.maps.event.addListener(map, 'click', function (mouseEvent) {
                    // marker
                    marker.setPosition(mouseEvent.latLng);
                    setLatitude(mouseEvent.latLng.getLat());
                    setLongitude(mouseEvent.latLng.getLng());
                    
                    circle.setPosition(mouseEvent.latLng);
                });
            });
        } else { // geolocation is not supported
            // ??????????????
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

        // kakao.maps.event.addListener(marker, 'click', () => {
        //     console.log(place);
        // });
    };

    return (
        <div>
            <div className='w-[400px] h-[400px] my-[24px]' id="map"></div>
            <h1>메뉴를 정할 기준 위치를 지도에 클릭하세요. 키워드 검색 시 해당하는 장소에 핀이 꽂힙니다.</h1>
            <div>
                {latitude}, {longitude}
            </div>
            <div>

                <form onSubmit={handleSubmit}>
                    <input
                        className='border border-gray-400'
                        type="text"
                        value={text}
                        onChange={(event) => { setText(event.target.value) }}
                    />
                    <button className='border border-gray-400' type="submit">검색</button>
                </form>


            </div>
            <button className='border border-gray-400' onClick={handleClick}>Create Room</button>
        </div>
    )
}

export default Home