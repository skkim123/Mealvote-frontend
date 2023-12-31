import React, { useState, useEffect, useRef } from 'react'
import { useParams, useNavigate } from 'react-router-dom';
import axios from 'axios';
import { io } from 'socket.io-client';
import markerImgSrc from './images/marker.png';
import kakaomapLogo from './images/kakaomap_logo.png';
import markerSpriteImgSrc from './images/marker_sprite_images.png';
import MessageBox from './components/MessageBox';

const { kakao } = window;
const API_URL = process.env.REACT_APP_API_URL || 'http://localhost:5000';

function Votepage() {
    const { roomID } = useParams();
    const navigate = useNavigate();
    const [socket, setSocket] = useState(null);
    const [map, setMap] = useState(null);
    const [isOwner, setIsOwner] = useState(null); // null, 'Y', 'N'
    const [isVotingInProgress, setIsVotingInProgress] = useState(null); // null, 'Y', 'N'
    const [referencePosition, setReferencePosition] = useState({});
    const [name, setName] = useState('');
    const [text, setText] = useState('');
    const [message, setMessage] = useState('');
    const [chats, setChats] = useState([]);
    const [candidates, setCandidates] = useState([]);
    const [searchedPlaces, setSearchedPlaces] = useState([]);
    const [circle, setCircle] = useState(null);
    const [zoomControl, setZoomControl] = useState(null);
    const [radius, setRadius] = useState(500);
    const [isVoteStartButtonClicked, setIsVoteStartButtonClicked] = useState(false);
    const [isVoteFinishButtonClicked, setIsVoteFinishButtonClicked] = useState(false);
    const [votedItemID, setVotedItemID] = useState(null);
    const [voteCount, setVoteCount] = useState(0);

    const ps = new kakao.maps.services.Places();
    const chatRef = useRef(null);
    const searchedPlaceRef = useRef(null);

    useEffect(() => {
        // inspect whether there is a room with the given roomID & fetch data
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
                        setCandidates(res.data.candidates);
                        setName(res.data.name);
                        setVoteCount(res.data.voteCount);

                        const newSocket = io.connect(API_URL, { withCredentials: true, query: { roomID } });
                        newSocket.on('userChat', (newChat) => {
                            setChats((chats) => [...chats, newChat]);
                        });
                        newSocket.on('system', (newChat) => {
                            setChats((chats) => [...chats, newChat]);
                        });
                        newSocket.on('userShare', (newChat) => {
                            setChats((chats) => [...chats, newChat]);
                        });
                        newSocket.on('addCandidate', (newCandidate) => {
                            setCandidates((candidates) => [...candidates, newCandidate]);
                        });
                        newSocket.on('deleteCandidate', (deletedCandidate) => {
                            setCandidates((candidates) => candidates.filter((candidate) => candidate.placeID !== deletedCandidate.placeID));
                        });
                        newSocket.on('voteStart', () => {
                            setIsVotingInProgress('Y');
                        });
                        newSocket.on('vote', (votes) => {
                            setVoteCount(votes);
                        });
                        newSocket.on('voteFinish', (candidate) => {
                            newSocket.disconnect();
                            navigate(`/voteresult/${roomID}`, { replace: true, state: { selectedMenu: candidate } });
                        });
                        setSocket(newSocket);
                    }
                );
            } catch (error) {
                console.log(error.response.data);
            }
        };
        checkRoomAndOwner();

    }, [roomID, navigate]);

    useEffect(() => {
        const markerImgSize = new kakao.maps.Size(60, 60);
        const markerImgOption = { offset: new kakao.maps.Point(12, 35) };
        const markerImage = new kakao.maps.MarkerImage(markerImgSrc, markerImgSize, markerImgOption);

        if (isOwner && isVotingInProgress && referencePosition.latitude && referencePosition.longitude) {
            const mapElement = document.getElementById('votepage-map');
            if (mapElement && !map && !circle && !zoomControl) {
                const newMap = new kakao.maps.Map(mapElement, {
                    center: new kakao.maps.LatLng(referencePosition.latitude, referencePosition.longitude),
                    level: 5
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
                const newZoomControl = new kakao.maps.ZoomControl();

                setMap(newMap);
                setCircle(newCircle);
                setZoomControl(newZoomControl);
            }
            if (map && circle && zoomControl) {
                map.removeControl(zoomControl, kakao.maps.ControlPosition.RIGHT);

                const marker = new kakao.maps.Marker({
                    position: map.getCenter(),
                    image: markerImage,
                });
                marker.setMap(map);
                circle.setMap(map);
                map.addControl(zoomControl, kakao.maps.ControlPosition.RIGHT);
            }
        }
    }, [isOwner, isVotingInProgress, referencePosition, map, circle, zoomControl]);

    useEffect(() => {
        const spriteMarkers = [];
        const bounds = new kakao.maps.LatLngBounds();
        const infowindow = new kakao.maps.InfoWindow({ zIndex: 1 });

        if (map && searchedPlaces.length > 0) {
            searchedPlaces.forEach((place, index) => {
                const placePosition = new kakao.maps.LatLng(place.y, place.x);
                const markerSpriteImgSize = new kakao.maps.Size(36, 37);
                const markerSpriteImgOption = {
                    spriteSize: new kakao.maps.Size(36, 691),
                    spriteOrigin: new kakao.maps.Point(0, (index * 46) + 10),
                    offset: new kakao.maps.Point(13, 37),
                };
                const markerSpriteImg = new kakao.maps.MarkerImage(markerSpriteImgSrc, markerSpriteImgSize, markerSpriteImgOption);
                const spriteMarker = new kakao.maps.Marker({
                    position: placePosition,
                    image: markerSpriteImg,
                });
                spriteMarker.setMap(map);
                spriteMarkers.push(spriteMarker);

                bounds.extend(placePosition);

                kakao.maps.event.addListener(spriteMarker, 'click', function () {
                    scrollToSearchedPlace(index);
                });

                kakao.maps.event.addListener(spriteMarker, 'mouseover', function () {
                    infowindow.setContent(place.place_name);
                    infowindow.open(map, spriteMarker);
                });

                kakao.maps.event.addListener(spriteMarker, 'mouseout', function () {
                    infowindow.close();
                });
            });
            map.setBounds(bounds);
        }

        return () => {
            if (map) {
                spriteMarkers.forEach((spriteMarker) => {
                    spriteMarker.setMap(null);
                });
            }
        };
    }, [map, searchedPlaces]);

    useEffect(() => {
        scrollToBottom();
    }, [chats]);

    const handleSubmit = (event) => {
        event.preventDefault();
        ps.keywordSearch(text, placesSearchCallback, {
            location: new kakao.maps.LatLng(referencePosition.latitude, referencePosition.longitude),
            radius: radius,
            category_group_code: 'FD6',
        });
        setText('');
    };

    const placesSearchCallback = (data, status) => {
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

    const addCandidate = (place) => {
        if (candidates.length >= 15) {
            alert('투표 목록은 최대 15개까지만 가능합니다.');
        } else {
            socket.emit('addCandidate', place);
        }
    };

    const deleteCandidate = (candidate) => {
        socket.emit('deleteCandidate', candidate);
    };

    const handleVoteStart = () => {
        if (candidates.length < 2) {
            alert('투표 목록은 최소 2개 이상이어야 합니다.');
        } else {
            setIsVoteStartButtonClicked(true);
            socket.emit('voteStart');
        }
    };

    const handleVote = (candidate) => {
        if (candidate.placeID !== votedItemID) {
            setVotedItemID(candidate.placeID);
            socket.emit('vote', candidate);
        }
    };

    const handleVoteFinish = () => {
        if (voteCount < 2) {
            alert('투표를 종료하려면 최소 2명 이상의 투표가 필요합니다.')
        } else {
            setIsVoteFinishButtonClicked(true);
            socket.emit('voteFinish');
        }
    };

    const scrollToBottom = () => {
        if (chatRef && chatRef.current) {
            if (chatRef.current.scrollHeight > chatRef.current.clientHeight || chatRef.current.scrollWidth > chatRef.current.clientWidth) {
                chatRef.current.scrollTop = chatRef.current.scrollHeight;
            }
        }
    };

    const scrollToSearchedPlace = (idx) => {
        if (searchedPlaceRef && searchedPlaceRef.current) {
            searchedPlaceRef.current.scrollIntoView({ behavior: 'instant' });
            searchedPlaceRef.current.scrollTop = 209 * idx;
        }
    };

    const copyToClipboard = (text) => {
        navigator.clipboard.writeText(text);
    };

    return (
        <>
            {
                isOwner &&
                isVotingInProgress &&
                referencePosition.latitude &&
                referencePosition.longitude &&
                socket &&
                <div className='w-[360px]'>
                    <div className='w-[360px] h-[360px] shadow' id="votepage-map"></div>
                    <div className='flex mt-[16px] items-center'>
                        <div className='ml-[24px]'>
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
                        <button 
                            onClick={()=>{copyToClipboard(`https://mealvote.net/votepage/${roomID}`)}}
                            className='border border-gray-400 ml-[20px] w-[78px] text-[14px] rounded-[4px] shadow hover:bg-gray-200 py-[4px]'
                        >
                            채팅방 주소 복사하기
                        </button>
                        {
                            isOwner === 'Y' &&
                            isVotingInProgress === 'N' &&
                            <button
                                onClick={handleVoteStart}
                                className='border border-gray-400 ml-[20px] w-[100px] h-[40px] rounded-[4px] shadow bg-indigo-600 text-white hover:bg-indigo-500 disabled:bg-gray-500'
                                disabled={isVoteStartButtonClicked}
                            >
                                투표 시작
                            </button>
                        }
                        {
                            isOwner === 'Y' &&
                            isVotingInProgress === 'Y' &&
                            <button
                                onClick={handleVoteFinish}
                                className='border border-gray-400 ml-[20px] w-[100px] h-[40px] rounded-[4px] shadow bg-indigo-600 text-white hover:bg-indigo-500 disabled:bg-gray-500'
                                disabled={isVoteFinishButtonClicked}
                            >
                                투표 종료
                            </button>
                        }
                    </div>
                    <div className='w-[360px]'>
                        <div className='flex flex-col px-[20px] h-[250px] overflow-y-scroll border rounded-[8px] mt-[16px] shadow' ref={chatRef} >
                            {
                                chats.map((chat, idx) => <MessageBox key={idx} chat={chat} name={name} />)
                            }
                        </div>
                        <div>
                            <form onSubmit={sendMessage} className='mt-[8px]'>
                                <input
                                    type="text"
                                    className='border border-gray-400 px-[4px] py-[2px] w-[260px] rounded-[4px]'
                                    value={message}
                                    name="message"
                                    onChange={(event) => { setMessage(event.target.value) }}
                                />
                                <button type='submit' className='border border-gray-400 ml-[16px] bg-blue-500 text-white rounded-[4px] w-[80px] h-[32px]'>보내기</button>
                            </form>
                        </div>
                    </div>
                    <hr className='mt-[32px]' />
                    <p className='mt-[32px] font-semibold text-[18px]'>주변 식당 키워드로 검색 <span className='font-normal text-[16px]'>ex.죽전동 맛집</span></p>
                    <div className='shadow mt-[8px]'>
                        <form onSubmit={handleSubmit} className='flex justify-between h-[40px]'>
                            <input
                                type="text"
                                value={text}
                                className='border w-[270px] px-[4px] py-[2px]'
                                placeholder='맛집'
                                onChange={(event) => { setText(event.target.value) }}
                            />
                            <button type='submit' className='border w-[120px]'>검색하기</button>
                        </form>
                        <div className='border w-[360px] h-[300px] overflow-y-scroll' ref={searchedPlaceRef}>
                            <div className='flex flex-col gap-y-[12px]'>
                                {
                                    searchedPlaces.map((place, idx) =>
                                        <>
                                            <div key={idx} className='flex flex-col border-b pb-[12px] pl-[12px]'>
                                                <h2 className='font-bold'>
                                                    {idx + 1}. {place.place_name}
                                                </h2>
                                                <button className='border w-[144px] h-[40px] self-center rounded-[4px] mt-[8px]' onClick={() => { sharePlace(place); }}>채팅창에 공유하기</button>
                                                <button className='border w-[144px] h-[40px] self-center rounded-[4px] mt-[8px]' onClick={() => { addCandidate(place); }}>투표 후보로 넣기</button>
                                                <p>{place.category_name?.split('>').slice(-1)[0]}</p>
                                                <div>
                                                    <a href={place.place_url} target="_blank" rel="noopener noreferrer" className='flex items-center'>
                                                        <p>카카오맵 링크 :</p>
                                                        <img className='w-[40px] h-[40px] ml-[8px]' src={kakaomapLogo} alt="logo" />
                                                    </a>
                                                </div>
                                            </div>
                                        </>
                                    )
                                }
                            </div>
                        </div>
                    </div>
                    <p className='mt-[20px] font-semibold text-[18px]'>후보 목록</p>
                    <div className='w-[360px] border shadow rounded-[4px] h-[120px] overflow-y-scroll mt-[8px]'>
                        {
                            isVotingInProgress === 'Y' &&
                            <div> 투표한 사람 수 : {voteCount}</div>
                        }
                        {
                            candidates.map((candidate, idx) =>
                                <div className='flex border-b h-[40px] items-center' key={idx}>
                                    <p className='mx-[8px]'> {candidate.placeName}</p>
                                    {
                                        isOwner === 'Y' &&
                                        isVotingInProgress === 'N' &&
                                        <button className='text-white text-[14px] bg-red-500 hover:bg-red-600 rounded-[4px] w-[64px] h-[24px] shadow' onClick={() => { deleteCandidate(candidate); }}>삭제하기</button>
                                    }
                                    {
                                        isVotingInProgress === 'Y' &&
                                        <>
                                            {
                                                votedItemID === candidate.placeID ?
                                                    <button onClick={() => { handleVote(candidate); }} className='text-white text-[14px] bg-gray-500 rounded-[4px] w-[64px] h-[24px] shadow'>투표하기</button> :
                                                    <button onClick={() => { handleVote(candidate); }} className='text-white text-[14px] bg-blue-500 hover:bg-blue-600 rounded-[4px] w-[64px] h-[24px] shadow'>투표하기</button>
                                            }
                                        </>
                                    }
                                </div>
                            )
                        }
                    </div>
                </div>
            }
        </>
    )
}

export default Votepage