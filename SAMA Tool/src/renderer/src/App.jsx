import { useState, useEffect } from "react";
import Navigation from "./components/Navigation";
import {Route, HashRouter as Router, Routes} from "react-router-dom";


function App() {
const [data, setData] = useState([{}]);
useEffect(() =>{
  fetch("/members").then(
    res => res.json()
  ).then(
    data => {
      setData(data);
      console.log(data);
    }
  )
}, [])
  return (
    <>
        {/* <Navigation/> */}
        {(typeof data.members === "undefined") ?(
          <p>loading</p>
        ): (
          data.members.map((member, i) => (
            <p key={ii}>{member}</p>
          ))
        )}
    </>
  )
}

export default App

