import React from 'react'
import kakaomapLogo from '../images/kakaomap_logo.png';

/**
    chatType: {
        type: Sequelize.ENUM('user-chat', 'system', 'user-share'),
        allowNull: false,
    },
    username: { // user-chat, user-share
        type: Sequelize.STRING(50),
    },
    message: { // user-chat, system
        type: Sequelize.TEXT,
    },
    placeName: { // user-share
        type: Sequelize.STRING(50),
    },
    placeAddress: { // user-share
        type: Sequelize.STRING(100),
    },
    placeCategory: { // user-share
        type: Sequelize.STRING(50),
    },
    placeDistance: { // user-share
        type: Sequelize.FLOAT,
    },
    placeLink: { // user-share
        type: Sequelize.STRING(150),
    },
 */

function MessageBox(props) {
    const { chat, name } = props;

    return (
        <>
            {
                // my chat
                chat.chatType === 'user-chat' && name === chat.username &&
                <div className='self-end w-[200px] break-words'>
                    <p className='text-[gray] text-[14px]'>{chat.username}</p>
                    <div className='border border-black'>
                        <p>{chat.message}</p>
                    </div>
                </div>
            }
            {
                // other's chat
                chat.chatType === 'user-chat' && name !== chat.username &&
                <div className='self-start w-[200px] break-words'>
                    <p className='text-[gray] text-[14px]'>{chat.username}</p>
                    <div className='border border-black'>
                        <p>{chat.message}</p>
                    </div>
                </div>
            }
            {
                // system message
                chat.chatType === 'system' &&
                <div className='self-center w-[300px] text-center break-words'>
                    {chat.message}
                </div>
            }
            {
                // share
                chat.chatType === 'user-share' &&
                <div>
                    <p className='text-[gray] text-[14px]'>{chat.username}</p>
                    <div className='border border-black'>
                        <div>
                            <div>{chat.placeAddress}</div>
                            <div>{chat.placeCategory}</div>
                            <div>{chat.placeDistance}</div>
                            <div>
                                <a href={chat.placeLink} target="_blank" rel="noopener noreferrer">
                                    <img className='w-[40px] h-[40px]' src={kakaomapLogo} alt="logo" />
                                    카카오맵 링크
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