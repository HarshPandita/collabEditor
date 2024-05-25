import React, { useEffect, useRef, useState } from 'react'
import { Client } from '../components/Client'
import { Editor } from '../components/Editor'
import { initSocket } from '../socket';
import ACTIONS from '../actions';
import toast from 'react-hot-toast';
import { Navigate, useLocation, useNavigate, useParams } from 'react-router-dom';

export const EditorPage = () => {
    console.log("12341234")
    const socketRef = useRef(null);
    const codeRef = useRef(null);
    const location = useLocation();
    const reactNavigator = useNavigate();
    const {roomId} = useParams();
    const [ clients,setClients] = useState([

    ])
    // console.log(params)
    useEffect(()=>{
            const init = async ()=>{
                socketRef.current = await initSocket();
                socketRef.current.on('connect_error', (err)=>handleErrors(err))
                socketRef.current.on('connect_failed', (err)=>handleErrors(err))
                
                function handleErrors(e){
                    console.log("scoket error: ",e)
                    toast.error('Socket connection failed, try again')
                    reactNavigator('/')
                }
                socketRef.current.emit(ACTIONS.JOIN,{
                    roomId,
                    userName: location.state?.userName,
                }
                )

                socketRef.current.on(ACTIONS.JOINED, ({ clients, userName, socketId})=>{
                    if (userName !== location.state?.userName){
                        toast.success(`${userName} joined the room.`)
                        console.log(`${userName} joind the room.`)
                    }
                    setClients(clients);
                    socketRef.current.emit(ACTIONS.SYNC_CODE, {code: codeRef.current,
                        socketId
                    });
                    
                    
                })
                socketRef.current.on(ACTIONS.DISCONNECTED, ({ userName, socketId})=>{
                    console.log("disconnected")
                    if (userName !== location.state?.userName){
                        toast.success(`${userName} left the room.`)
                        console.log(`${userName} left the room.`)
                    }
                    setClients((prev)=>{
                        return prev.filter(client =>
                            client.socketId !== socketId)
                    })
                })

            };
            init();
            return () =>{
                socketRef.current.disconnect()
                socketRef.current.off(ACTIONS.JOINED);
                socketRef.current.off(ACTIONS.DISCONNECTED);

            }
    },[]);

    async function copyRoomId(){
        try{
            await navigator.clipboard.writeText(roomId)
            toast.success("Room id has been copied to your clipboard")
        }
        catch(error){

            toast.error("cannot copy roomid")
            console.error(error)

        }
    }
    if (!location.state){
        return <Navigate/>
    }

    async function leaveRoom(){
        reactNavigator("/")
    }
    if (!location.state){
        return <Navigate/>
    }
    


  return (
    <div className='mainWrap'>

        <div className='aside'>
            <div className='asideInner'>
                <div className='logo'>
                    <img src="/code-sync.png" alt="logo"></img>

                </div>
                <h3>connected</h3>
                <div className='clientsList'>
                    {clients.map((client)=>{
                        console.log(client.userName)
                        return <Client key={client.socketId} userName={client.userName}/>

                    }
                    )}
                </div>
            </div>
            <button className="btn copyBtn" onClick={copyRoomId}>copy roomid</button>
            <button className="btn leaveBtn" onClick={leaveRoom}>leave</button>

        </div>
        <div  className="editorWrap">
            <Editor socketRef={socketRef} roomId={roomId} onCodeChange={(code)=>{
                codeRef.current= code;
            }}/>
            Editor page goes here....
        </div>
    </div>
  )
}

export default EditorPage;



