import React, {useState} from 'react';
import {Layout} from 'antd';
import {BrowserRouter, Routes, Route} from 'react-router-dom';
import "./index.css";
import Head from "./Head";
import Body from "./Body";
import Foot from "./Foot";
import Detail from "./Detail";
import PromptHistory from "./PromptHistory";

const App = () => {
    const [bodyHeight] = useState(window.innerHeight-64-64);

    return (
        <BrowserRouter>
            <Layout>
                <Head/>
                <Routes>
                    <Route path = '/' element={<Body windowHeight={bodyHeight}/>}/>
                    <Route path = '/detail' element={<Detail windowHeight={bodyHeight}/>}/>
                    <Route path = '/history' element={<PromptHistory windowHeight={bodyHeight}/>}/>
                </Routes>
                <Foot/>
            </Layout>
        </BrowserRouter>
    )
}

export default App;
