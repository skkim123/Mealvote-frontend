import React, { useEffect, useState } from 'react'
import { useLocation, useNavigate } from 'react-router-dom'
import markerImg from './images/marker.png';
import kakaomapLogo from './images/kakaomap_logo.png';

const { kakao } = window;

function VoteResult() {

    const navigate = useNavigate();
    const location = useLocation();
    const [selectedMenu, setSelectedMenu] = useState({});
    const [map, setMap] = useState(null);
    const [zoomControl, setZoomControl] = useState(null);

    useEffect(() => {
        if (!location.state?.selectedMenu) {
            navigate('/', { replace: true, state: { redirect: 'unauthorized access' } });
        } else {
            setSelectedMenu(location.state.selectedMenu);
        }
    }, [location.state, navigate]);

    useEffect(() => {
        if (Object.keys(selectedMenu).length !== 0) {
            const markerImgSrc = markerImg;
            const markerImgSize = new kakao.maps.Size(60, 60);
            const markerImgOption = { offset: new kakao.maps.Point(12, 35) };
            const markerImage = new kakao.maps.MarkerImage(markerImgSrc, markerImgSize, markerImgOption);
            const mapElement = document.getElementById('voteresult-map');

            if (!map && !zoomControl) {
                const newMap = new kakao.maps.Map(mapElement, {
                    center: new kakao.maps.LatLng(selectedMenu.placeLatitude, selectedMenu.placeLongitude),
                    level: 5
                });
                const newZoomControl = new kakao.maps.ZoomControl();
                setMap(newMap);
                setZoomControl(newZoomControl);
            }

            if (map && zoomControl) {
                map.addControl(zoomControl, kakao.maps.ControlPosition.RIGHT);

                const marker = new kakao.maps.Marker({
                    position: map.getCenter(),
                    image: markerImage,
                });
                marker.setMap(map);
            }
        }
    }, [selectedMenu, map, zoomControl]);

    return (
        <div>
            <h1>투표 결과</h1>
            <h2>가장 많은 득표를 받은 메뉴는 {selectedMenu.placeName} 입니다.</h2>
            <div className='w-[400px] h-[400px]' id="voteresult-map"></div>
            <div>
                <p>키카오맵 링크 :
                    <a href={selectedMenu.placeURL} >
                        <img className='w-[40px] h-[40px]' src={kakaomapLogo} alt="logo" />
                    </a>
                </p>
            </div>
        </div>
    )
}

export default VoteResult