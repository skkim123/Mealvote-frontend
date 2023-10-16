import React from 'react'
import kakaomapLogo from '../images/kakaomap_logo.png';

function MessageBox(props) {
    const { chat, name } = props;
    return (
        <>
            {
                // my chat
                chat.chatType === 'user-chat' && name === chat.username &&
                <div className='self-end w-[200px] break-words mb-[16px]'>
                    <p className='text-[gray] text-[14px]'>{chat.username}</p>
                    <div className='border border-black rounded-[4px] shadow p-[4px]'>
                        <p>{chat.message}</p>
                    </div>
                </div>
            }
            {
                // other's chat
                chat.chatType === 'user-chat' && name !== chat.username &&
                <div className='self-start w-[200px] break-words mb-[16px] rounded-[4px] shadow'>
                    <p className='text-[gray] text-[14px]'>{chat.username}</p>
                    <div className='border border-black rounded-[4px] shadow p-[4px]'>
                        <p>{chat.message}</p>
                    </div>
                </div>
            }
            {
                // system message
                chat.chatType === 'system' &&
                <div className='self-center w-[300px] text-center break-words mb-[16px]'>
                    {chat.message}
                </div>
            }
            {
                // share
                chat.chatType === 'user-share' &&
                <div className='mb-[16px]'>
                    <p className='text-[gray] text-[14px]'>{chat.username}</p>
                    <div className='border border-black rounded-[8px] shadow p-[4px]'>
                        <div>
                            <div>{chat.placeAddress}</div>
                            <div>카테고리 : {chat.placeCategory}</div>
                            <div>거리 : {chat.placeDistance} m</div>
                            <div>
                                <a href={chat.placeURL} target="_blank" rel="noopener noreferrer" className='flex items-center'>
                                    <p>카카오맵 링크 :</p>
                                    <img className='w-[40px] h-[40px] ml-[8px] mb-[4px]' src={kakaomapLogo} alt="logo"/>
                                </a>
                            </div>
                        </div>
                    </div>
                </div>
            }
        </>
    )
}

export default MessageBox