import React, {useState} from 'react'
import {v4 as uuidv4} from 'uuid';
import toast, { Toast } from 'react-hot-toast';
import {useNavigate} from 'react-router-dom';

const Home = () => {
    console.log("homepage")
    const navigate = useNavigate();

    const [roomId, setRoomId] = useState('');
    const [userName, setUserName] = useState('');

    
    const createNewRoom =(e)=>{
        e.preventDefault();
        const id = uuidv4();
        setRoomId(id)
        console.log(id)
        toast.success('created a new room')

    }
    const joinRoom = ()=>{
        if(!roomId || !userName){
            toast.error("Roomid and username is required")
            return;
        }
        navigate(`/editor/${roomId}`,{
            state:{
                userName,

            },
        })

    }
    const handleInputEnter=(e)=>{
        e.preventDefault(); 
        console.log('event', e.code);
        if (e.code==='Enter'){
            joinRoom();
        }

    }

  return (
    <div className='homePageWrapper'>
        <div className='formWrapper'>
            <img className='homePageLogo' src="/code-sync.png" alt="code-sync-logo"/>
            <h4 className='mainLabel'>Paste invitation room id</h4>
            <div className='inputGroup'>
                <input 
                type="text" 
                className='inputbox' 
                placeholder='ROOM ID' 
                onChange={(e)=>
                    setRoomId(e.target.value)
                }
                value={roomId}
                onKeyUp={handleInputEnter}
                >

                </input>
                <input 
                type="text" 
                className='inputbox' 
                placeholder='USERNAME'
                onChange={(e)=>
                    setUserName(e.target.value)
                }
                value={userName}
                onKeyUp={handleInputEnter}

                >
                </input>
                <button className='btn joinBtn' onClick={joinRoom}>JOIN</button>
                <span className='crateInfo'>
                    If you dont have an invite, create &nbsp;
                    <a onClick={createNewRoom}href="" className='createNewBtn'>
                        new room    
                    </a> 
                </span>
            </div>
        </div>
        <footer>
            <h4>Built with love by Me </h4>
        </footer>
    </div>
  )
}

export default Home;