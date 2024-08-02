import React, { useState, useEffect } from 'react';
import Draggable from 'react-draggable';
import { ResizableBox } from 'react-resizable';
import { SketchPicker } from 'react-color';
import 'react-resizable/css/styles.css';
import './LogoEditor.css';


const LogoEditor = () => {
  const [activeDrags, setActiveDrags] = useState(0);
  const [initialState, setInitialState] = useState({
    activeDrags: 0,
    deltaPosition: {
      x: 0,
      y: 0,
    },
    controlledPosition: {
      x: -400,
      y: 200,
    },
  });
  const [logo, setLogo] = useState({
    url: 'https://via.placeholder.com/150', // Default logo URL
    width: 100,
    height: 100,
    rotate: 0,
    color: '#000000',
  });
  const onStart = () => {
    console.log('---------start clicked--------');
    if (activeDrags == 0) setActiveDrags((prevState) => ++prevState);
  };

  useEffect(() => {
    console.log('=======activeDrags=====', activeDrags);
  }, [activeDrags]);

  const onStop = () => {
    if (activeDrags == 1) setActiveDrags((prevState) => --prevState);
  };

  const handleResize = (e, { size }) => {
    console.log('----------size is changing--------', size);
    // setLogo((prevState) => ({
    //   ...prevState,
    //   width: size.width,
    //   height: size.height,
    // }));
    setSize({ width: size.width, height: size.height });
    setIsResizing(true);
  };

  const [position, setPosition] = useState({ x: 0, y: 0 });
  const [size, setSize] = useState({ width: 100, height: 200 });

  const handleDrag = (e, data) => {
    setPosition({ x: data.x, y: data.y });
  };

  // const handleDrag =  (e, ui) => {
  //   const {x, y} = initialState.deltaPosition;
  //   setInitialState({
  //     deltaPosition: {
  //       x: x + ui.deltaX,
  //       y: y + ui.deltaY,
  //     }
  //   });
  //   setLogo((prevState) => ({
  //     ...prevState,
  //     width: x + ui.deltaX,
  //     height: y + ui.deltaY,
  //   }))
  // };
  const dragHandlers = {
    // onStart: onStart,
    // onStop: onStop,
    handleDrag: handleDrag,
  };

  const [isResizing, setIsResizing] = useState(false);
  useEffect(() => {
console.log("-------resizing --------", isResizing)
  }, [isResizing])
  

  const handleDragStop = (e, data) => {
    if (!isResizing) {
      setPosition({ x: data.x, y: data.y });
    }
  };

  const handleResizeStart = () => {
    setIsResizing(true);
  };

  const handleResizeStop = (e, { size }) => {
    setIsResizing(false);
    setSize({ width: size.width, height: size.height });
  };


  return (
    <div
      className='box'
      style={{
        height: '600px',
        width: '600px',
        border: '1px solid black',
        borderRadius: '50%',
        position: 'relative',
        overflow: 'hidden',
        padding: '0',
      }}
    >
      <div style={{ height: '100', width: '100', padding: '10px' }}>
        <Draggable  
        onDrag={(e, data) => {
          if (!isResizing) {
            console.log("-----OnDrag--------", data)
            setPosition({ x: data.x, y: data.y });
          }
        }}
        onStop={handleDragStop}
         disabled={isResizing} 
         position={position} >
          {/* <div className="box1"> */}
          <div style={{ display: 'inline-block', position: 'relative' }}>
            <ResizableBox
              // width={logo.width}
              // height={logo.height}
              width={size.width}
              height={size.height}
              // className='box'
              style={{ border: '1px solid black', background: 'lightblue' }}
              // onResize={handleResize}
              onResizeStart={handleResizeStart}
            onResizeStop={handleResizeStop}
              // resizeHandles={['se']}
              minConstraints={[50, 50]}
              maxConstraints={[500, 500]}
            >
              {/* <div className='logo-container'>
                <img
                  src={
                    'https://w7.pngwing.com/pngs/285/461/png-transparent-bmw-m-car-bmw-5-series-logo-bmw-emblem-trademark-logo.png'
                  }
                  alt='Logo'
                  style={{
                    width: '100%',
                    height: '100%',
                    transform: `rotate(${logo.rotate}deg)`,
                    filter: `hue-rotate(${logo.color})`,
                  }}
                />
              </div> */}
              <div style={{ width: '100%', height: '100%' }}>
            Drag me! Resize me!
          </div>
            </ResizableBox>
          </div>
          {/* </div> */}
        </Draggable>
      </div>
    </div>
  );
};

export default LogoEditor;
