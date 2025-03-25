import React, {useState} from 'react';
import './App.css';
import GoogleAuth from './GoogleAuth';
import GenericObjects from "./GenericObjects";

function App() {

    const [ogToken, setOgToken] = useState(null);

    return (
        <div className="content-wrapper">
            <h1>ObjectsGrid Authentication with Google and React</h1>
            <div><GoogleAuth onOgTokenReceived={setOgToken} /></div>
            <div><GenericObjects ogToken={ogToken} /></div>
        </div>
    );
}

export default App;