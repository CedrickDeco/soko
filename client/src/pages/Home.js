import React from 'react';
// import React, { useContext } from 'react';
import LeftNav from '../components/LeftNav';
// import { UidContext } from "../components/AppContext";
import Thread from '../components/Thread';

const Home = () => {
  // const uid = useContext(UidContext);
  return (
    <div className="home">
      <LeftNav />
      <div className="main">
        <div className="home-header">

        </div>
        <Thread />
      </div>
    </div>
  );
};

export default Home;