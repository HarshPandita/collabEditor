import React, { useEffect, useRef } from 'react'
import Codemirror from 'react-codemirror/node_modules/codemirror'
import 'react-codemirror/node_modules/codemirror/lib/codemirror.css'
import 'react-codemirror/node_modules/codemirror/theme/dracula.css'
import 'react-codemirror/node_modules/codemirror/mode/javascript/javascript';
import 'react-codemirror/node_modules/codemirror/addon/edit/closetag';
import 'react-codemirror/node_modules/codemirror/addon/edit/closebrackets';
import ACTIONS from '../actions';


export const Editor = ({socketRef, roomId, onCodeChange}) => {
  const editorRef = useRef(null)


    useEffect(()=>{  
      async function init(){
        
        editorRef.current = Codemirror.fromTextArea(document.getElementById('realtimeEditor'),{
              node: {name:'javascript', json: true},
              theme: "dracula",
              autoCloseTags: true,
              autoCloseBrackets: true,
              lineNumbers: true,
        });

        console.log(socketRef.current)
        editorRef.current.on('change',(instance, changes)=>{
          const {origin} = changes
          const code = instance.getValue()
          onCodeChange(code)
          if (origin!=='setValue'){
            socketRef.current.emit(ACTIONS.CODE_CHANGE, {
              roomId,
              code,
            })
          }
        });

        
           
      }
        init();
    },[]);

    useEffect(()=>{
      console.log(socketRef);
        if(socketRef.current!=null){
          socketRef.current.on(ACTIONS.CODE_CHANGE, ({code}) =>{
            if (code!==null){
              editorRef.current.setValue(code);
            }
          }
      
        )
        
      }
      return ()=>{
        socketRef.current.off(ACTIONS.CODE_CHANGE)
      }
        
    },[socketRef.current])
  return <textarea id="realtimeEditor"></textarea>;
}
