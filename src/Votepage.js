import React, { useState, useEffect } from 'react'
import { useParams, useNavigate } from 'react-router-dom';
import axios from 'axios';
import { io } from 'socket.io-client';
import markerImg from './images/marker.png';
import kakaomapLogo from './images/kakaomap_logo.png';
import MessageBox from './components/MessageBox';

const { kakao } = window;

function Votepage() {

    const { roomID } = useParams();
    const navigate = useNavigate();
    const [socket, setSocket] = useState(null);
    const [map, setMap] = useState(null);
    const [isOwner, setIsOwner] = useState(null); // null, 'Y', 'N'
    const [isVotingInProgress, setIsVotingInProgress] = useState(null); // null, 'Y', 'N'
    const [referencePosition, setReferencePosition] = useState({});

    const ps = new kakao.maps.services.Places();
    const [text, setText] = useState('');
    const [message, setMessage] = useState('');
    const [chats, setChats] = useState([]);
    const [searchedPlaces, setSearchedPlaces] = useState([]);
    const [circle, setCircle] = useState(null);
    const [radius, setRadius] = useState(500);

    useEffect(() => {

        const newSocket = io.connect('http://localhost:5000', { withCredentials: true, query: { roomID } });
        setSocket(newSocket);

        // inspect whether there is a room with the given roomID & fetch chats
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
                        setChats(res.data.chats);
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
        if (socket) {
            socket.on('userChat', (newChat) => {
                setChats((chats) => [...chats, newChat]);
            });
            socket.on('system',(newChat)=>{
                setChats((chats) => [...chats, newChat]);
            });
            socket.on('userShare',(newChat)=>{
                setChats((chats) => [...chats, newChat]);
            });
        }
    }, [socket]);

    useEffect(() => {
        const markerImgSrc = markerImg;
        const markerImgSize = new kakao.maps.Size(60, 60);
        const markerImgOption = { offset: new kakao.maps.Point(12, 35) };
        const markerImage = new kakao.maps.MarkerImage(markerImgSrc, markerImgSize, markerImgOption);

        if (isOwner && isVotingInProgress && referencePosition.latitude && referencePosition.longitude) {


            const mapElement = document.getElementById('votepage-map');
            if (mapElement && !map && !circle) {
                const newMap = new kakao.maps.Map(mapElement, {
                    center: new kakao.maps.LatLng(referencePosition.latitude, referencePosition.longitude),
                    level: 3
                });
                const newCircle = new kakao.maps.Circle({
                    center: new kakao.maps.LatLng(referencePosition.latitude, referencePosition.longitude),
                    radius: 500,
                    strokeWeight: 1,
                    strokeColor: '#75B8FA',
                    strokeOpacity: 1,
                    strokeStyle: 'solid',
                    fillColor: '#CFE7FF',
                    fillOpacity: 0.3,
                });

                setCircle(newCircle);
                setMap(newMap);
            }
            if (map && circle) {
                const zoomControl = new kakao.maps.ZoomControl();
                map.addControl(zoomControl, kakao.maps.ControlPosition.RIGHT);

                const marker = new kakao.maps.Marker({
                    position: map.getCenter(),
                    image: markerImage,
                });
                marker.setMap(map);
                circle.setMap(map);
            }
        }
    }, [isOwner, isVotingInProgress, referencePosition, map, circle]);

    const handleSubmit = (event) => {
        event.preventDefault();
        ps.keywordSearch(text, placesSearchCallback, {
            location: new kakao.maps.LatLng(referencePosition.latitude, referencePosition.longitude),
            radius: radius,
            // sort: kakao.maps.services.SortBy.DISTANCE,
        });
        setText('');
    };

    const placesSearchCallback = (data, status, pagination) => {
        if (status === kakao.maps.services.Status.OK) {
            setSearchedPlaces(data);
        }
    };

    const sendMessage = (event) => {
        event.preventDefault();
        socket.emit('userChat', message);
        setMessage('');
    };

    const sharePlace = (place) => {
        socket.emit('userShare', place);
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
                            onChange={(event) => {
                                setRadius(event.target.value);
                                circle.setRadius(event.target.value);
                            }}
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
                                        <button className='border border-black' onClick={()=>{sharePlace(place);}}>채팅창에 공유하기</button>
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
                    <div className='w-[400px]'>
                        <div className='flex flex-col gap-y-[12px]'>
                            {
                                chats.map((chat, idx) => <MessageBox key={idx} chat={chat} />)
                            }
                        </div>
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