import React, { useState, useEffect } from 'react'
import { useParams, useNavigate } from 'react-router-dom';
import axios from 'axios';
import { io } from 'socket.io-client';
import markerImg from './images/marker.png';
import kakaomapLogo from './images/kakaomap_logo.png';

const { kakao } = window;

function Votepage() {

    const { roomID } = useParams();
    const navigate = useNavigate();
    const [socket, setSocket] = useState(null);
    const [isOwner, setIsOwner] = useState(null); // null, 'Y', 'N'
    const [isVotingInProgress, setIsVotingInProgress] = useState(null); // null, 'Y', 'N'
    const [referencePosition, setReferencePosition] = useState({});

    const ps = new kakao.maps.services.Places();
    const [text, setText] = useState('');
    const [message, setMessage] = useState('');
    const [searchedPlaces, setSearchedPlaces] = useState([]);
    const [radius, setRadius] = useState(500);

    useEffect(() => {

        const newSocket = io.connect('http://localhost:5000', { withCredentials: true, query: { roomID } });
        setSocket(newSocket);

        // inspect wheter there is a room with the given roomID
        const checkRoomAndOwner = async () => {
            try {
                await axios.get(`/rooms/check/${roomID}`, { withCredentials: true }).then(
                    (res) => {
                        if (!res.data.isRoomExist) {
                            navigate('/', { replace: true, state: { redirect: 'votepage-no-room-id' } });
                        }
                        setIsOwner(res.data.isOwner);
                        setIsVotingInProgress(res.data.votingInProgress);
                        setReferencePosition({ latitude: res.data.latitude, longitude: res.data.longitude });
                    }
                );
            } catch (error) {
                console.log(error.response.data);
            }
        };

        checkRoomAndOwner();

        return () => { newSocket.close(); }
    }, [roomID, navigate]);

    useEffect(() => {
        const markerImgSrc = markerImg;
        const markerImgSize = new kakao.maps.Size(60, 60);
        const markerImgOption = { offset: new kakao.maps.Point(12, 35) };
        const markerImage = new kakao.maps.MarkerImage(markerImgSrc, markerImgSize, markerImgOption);

        if (isOwner && isVotingInProgress && referencePosition.latitude && referencePosition.longitude) {
            const mapElement = document.getElementById('votepage-map');
            if (mapElement) {
                const map = new kakao.maps.Map(mapElement, {
                    center: new kakao.maps.LatLng(referencePosition.latitude, referencePosition.longitude),
                    level: 3
                });
                const zoomControl = new kakao.maps.ZoomControl();
                map.addControl(zoomControl, kakao.maps.ControlPosition.RIGHT);

                const marker = new kakao.maps.Marker({
                    position: map.getCenter(),
                    image: markerImage,
                });
                marker.setMap(map);

                // const circle = new kakao.maps.Circle({
                //     center : new kakao.maps.LatLng(referencePosition.latitude, referencePosition.longitude),   
                //     radius: radius, 
                //     strokeWeight: 1, 
                //     strokeColor: '#75B8FA', 
                //     strokeOpacity: 1, 
                //     strokeStyle: 'solid',
                //     fillColor: '#CFE7FF',  
                //     fillOpacity: 0.3,
                // }); 
                
                // circle.setMap(map); 

                // kakao.maps.event.addListener(map, 'click', function (mouseEvent) {
                //     // marker
                //     marker.setPosition(mouseEvent.latLng);
                // });
            }
        }
    }, [isOwner, isVotingInProgress, referencePosition, radius]);

    const handleSubmit = (event) => {
        event.preventDefault();
        ps.keywordSearch(text, placesSearchCallback, {
            location: new kakao.maps.LatLng(referencePosition.latitude, referencePosition.longitude),
            radius: radius,
            // sort: kakao.maps.services.SortBy.DISTANCE,
        });
        console.log("text : ", text);

        setText('');
    };

    const placesSearchCallback = (data, status, pagination) => {
        if (status === kakao.maps.services.Status.OK) {
            console.log(data);
            setSearchedPlaces(data);
        }
    };

    const sendMessage = (event) => {
        event.preventDefault();
        if (socket) {
            socket.emit('message', message);
        } else {
            console.log('socket is null');
        }
        setMessage('');
    };

    return (
        <>
            {
                isOwner &&
                isVotingInProgress &&
                referencePosition.latitude &&
                referencePosition.longitude &&
                socket &&
                <div>
                    <div className='w-[400px] h-[400px]' id="votepage-map"></div>
                    <div>
                        <p>검색 반경 : {radius} m</p>
                        <input 
                            type="range" 
                            name="radius" 
                            defaultValue={radius} 
                            min={100} 
                            max={3000} 
                            step={100}
                            onChange={(event) => { setRadius(event.target.value) }}
                        />
                    </div>
                    <div className='border-black border-2 w-[400px] h-[300px] overflow-y-scroll'>
                        <form onSubmit={handleSubmit} className='border-b'>
                            <input
                                type="text"
                                value={text}
                                className='border'
                                placeholder='맛집'
                                onChange={(event) => { setText(event.target.value) }}
                            />
                            <button type='submit' className='border'>검색하기 </button>
                            {isOwner === 'Y' && <button>투표 시작</button>}
                        </form>
                        <div className='flex flex-col gap-y-[12px]'>
                            {
                                searchedPlaces.map((place, idx) =>
                                    <div key={idx} className='flex flex-col'>
                                        <h2 className='font-bold'>
                                            {place.place_name}
                                        </h2>
                                        <div>채팅창에 공유하기</div>
                                        <div>투표 목록에 넣기</div>
                                        <p>{place.category_name.split('>').slice(-1)[0]}</p>
                                        <p>키카오맵 링크 :
                                            <a href={place.place_url} target="_blank" rel="noopener noreferrer">
                                                <img className='w-[40px] h-[40px]' src={kakaomapLogo} alt="logo" />
                                            </a>
                                        </p>
                                    </div>
                                )
                            }
                        </div>
                    </div>
                    <div>
                        <div></div>
                        <form onSubmit={sendMessage}>
                            <input
                                type="text"
                                className='border border-black'
                                value={message}
                                name="message"
                                onChange={(event) => { setMessage(event.target.value) }}
                            />
                            <button type='submit' className='border border-black'>보내기</button>
                        </form>
                    </div>
                </div>
            }
        </>
    )
}

export default Votepage