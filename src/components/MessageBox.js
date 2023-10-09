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
    const { chat } = props;

  return (
    <div className='border border-black'>
        {
            chat.chatType === 'user-chat' &&
            <div>
                {chat.message}
                {chat.username}
            </div>
        }
        {
            chat.chatType === 'system' &&
            <div>
                {chat.message}
            </div>
        }
        {
            chat.chatType === 'user-share' &&
            <div>
                {/* {chat.username}님이 {chat.placeName}을 공유했습니다. */}
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
        }
    </div>
  )
}

export default MessageBox