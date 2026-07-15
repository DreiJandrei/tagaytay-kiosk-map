import React, { useEffect, useRef, useState } from 'react';

export default function MapScreen({ 
  offices, 
  selectedOfficeKey, 
  onSelectOffice, 
  currentFloor,
  setCurrentFloor,      
  setSelectedOfficeKey, 
  is3DActive,
  setIs3DActive,
  transportMethod = 'elevator' 
}) {
 const pathRef = useRef(null);
  const isDragging = useRef(false);
  const dragStart = useRef({ x: 0, y: 0 });

  // Auto-detect kung mobile (width <= 1024px) para naka-zoom out agad at nakagitna
  // Auto-detect kung mobile (width <= 1024px) para naka-zoom out agad at nakagitna
 // Auto-detect kung mobile (width <= 1024px)
// Auto-detect kung mobile (width <= 1024px)
  const isMobile = typeof window !== 'undefined' && window.innerWidth <= 1024;
  
  const [zoom, setZoom] = useState(isMobile ? 0.28 : 0.65);
  
  

 // BAGO: Hinatak sa saktong gitna (y: -230)
  // BAGO: Hinatak sa saktong gitna (y: -230)
  const [pan, setPan] = useState(isMobile ? { x: -450, y: -230 } : { x: 20, y: -120 });

  useEffect(() => {
    if (pathRef.current && selectedOfficeKey && offices?.[selectedOfficeKey]) {
      const routeLine = pathRef.current;
      routeLine.style.animation = 'none';
      routeLine.style.transition = 'none';
      const totalLength = routeLine.getTotalLength() || 1000;
      routeLine.style.strokeDasharray = totalLength;
      routeLine.style.strokeDashoffset = totalLength;
      routeLine.getBoundingClientRect(); 
      routeLine.style.transition = 'stroke-dashoffset 1.2s ease-in-out';
      routeLine.style.strokeDashoffset = '0';
    }
  }, [selectedOfficeKey, offices]); 

  const handleDragStart = (clientX, clientY) => {
    if (isMobile) return; // BAGO: I-LOCK ANG MAPA SA PHONE (Bawal i-drag)
    isDragging.current = true;
    dragStart.current = { x: clientX - pan.x, y: clientY - pan.y };
  };

  const handleDragMove = (clientX, clientY) => {
    if (isMobile || !isDragging.current) return; // BAGO: I-LOCK DIN DITO
    setPan({ x: clientX - dragStart.current.x, y: clientY - dragStart.current.y });
  };

  const handleDragEnd = () => { isDragging.current = false; };

  const selectedOffice = selectedOfficeKey ? offices?.[selectedOfficeKey] : null;
  
  // ==============================================================
  // DYNAMIC KIOSK PIN PLACEMENT
  // ==============================================================
  let kioskText = "";
  let kioskStyle = { display: 'none' }; 

  if (currentFloor === 1) {
      kioskText = "🔴 YOU ARE HERE (Main Entrance)";
      kioskStyle = { left: 1030, top: 1000, display: 'block' }; 
  } else {
      kioskStyle = { display: 'block' };
      if (transportMethod === 'stairs') {
          kioskText = "🚶‍♂️ ARRIVED VIA STAIRS";
          if (currentFloor === 2) kioskStyle = { left: 220, top: 420 };
          else if (currentFloor >= 3 && currentFloor <= 5) kioskStyle = { left: 240, top: 720 };
          else if (currentFloor === 6) kioskStyle = { left: 650, top: 580 };
          else if (currentFloor === 7) kioskStyle = { left: 600, top: 460 };
      } else {
          kioskText = "🛗 ARRIVED VIA ELEVATOR";
          if (currentFloor === 2) kioskStyle = { left: 820, top: 460 };
          else if (currentFloor >= 3 && currentFloor <= 5) kioskStyle = { left: 600, top: 410 };
          else if (currentFloor === 6) kioskStyle = { left: 620, top: 350 };
          else if (currentFloor === 7) kioskStyle = { left: 580, top: 320 };
      }
  }

  // ==============================================================
  // SMART ROUTER: AVOIDING WALLS FOR STAIRS & ELEVATORS
  // ==============================================================
  let finalPathData = selectedOffice ? selectedOffice.pathData : "";

  if (selectedOffice && currentFloor !== 1) {
      if (currentFloor === 2) {
          if (transportMethod === 'stairs') {
              if (finalPathData.includes("L 680 260")) {
                  // Lilikod siya para umiwas sa solid horizontal wall (y=310)
                  finalPathData = finalPathData.replace(
                      "M 860 490 L 860 470 L 680 470 L 680 260", 
                      "M 220 420 L 220 350 L 420 350 L 420 260 L 680 260"
                  );
              } else if (finalPathData.includes("L 530 470")) {
                  // Pagpunta sa Library, dadaan sa gap
                  finalPathData = finalPathData.replace(
                      "M 860 490 L 860 470 L 530 470 L 530 560", 
                      "M 220 420 L 220 350 L 530 350 L 530 560"
                  );
              }
          }
      } 
      else if (currentFloor >= 3 && currentFloor <= 5) {
          if (transportMethod === 'stairs') {
              if (finalPathData.startsWith("M 620 480 L 450 480")) {
                  finalPathData = finalPathData.replace("M 620 480 L 450 480", "M 240 720 L 370 720 L 370 630 L 450 630 L 450 480");
              } else if (finalPathData.startsWith("M 620 480 L 770 480")) {
                  finalPathData = finalPathData.replace("M 620 480 L 770 480", "M 240 720 L 370 720 L 370 630 L 450 630 L 450 480 L 770 480");
              } else if (finalPathData.startsWith("M 620 480 L 620 520")) {
                  finalPathData = finalPathData.replace("M 620 480 L 620 520", "M 240 720 L 370 720 L 370 630 L 450 630 L 450 480 L 620 480 L 620 520");
              }
          }
      }
      else if (currentFloor === 6) {
          if (transportMethod === 'stairs') {
              if (finalPathData.startsWith("M 650 480 L 450 480")) finalPathData = finalPathData.replace("M 650 480 L 450 480", "M 650 580 L 650 480 L 450 480");
              else if (finalPathData.startsWith("M 700 480 L 850 480")) finalPathData = finalPathData.replace("M 700 480 L 850 480", "M 650 580 L 650 480 L 700 480 L 850 480");
              else if (finalPathData.startsWith("M 650 480 L 480 480")) finalPathData = finalPathData.replace("M 650 480 L 480 480", "M 650 580 L 650 480 L 480 480");
          }
      }
      else if (currentFloor === 7) {
          // Umiwas sa pagtagos sa y=380 wall
          if (transportMethod === 'stairs') {
              finalPathData = finalPathData.replace("M 580 340 L 580 400", "M 600 460 L 430 460 L 430 400 L 580 400");
          } else if (transportMethod === 'elevator') {
              finalPathData = finalPathData.replace("M 580 340 L 580 400", "M 580 340 L 430 340 L 430 400 L 580 400");
          }
      }
  }

  const mapTransformStyle = {
    transform: `translate3d(${pan.x}px, ${pan.y}px, 0) scale(${zoom}) rotateX(${is3DActive ? '35deg' : '0deg'}) rotateZ(${is3DActive ? '-4deg' : '0deg'})`,
    transition: isDragging.current ? 'none' : 'transform 0.35s cubic-bezier(0.16, 1, 0.3, 1)'
  };

  return (
    <main 
      className="map-viewport"
      style={{ flexGrow: 1, position: 'relative', overflow: 'hidden', cursor: isDragging.current ? 'grabbing' : 'grab' }}
      onMouseDown={(e) => {
        if(!e.target.closest('.room-node') && !e.target.closest('.floor-selector') && !e.target.closest('.map-legend') && !e.target.closest('.bottom-floor-bar')) {
          handleDragStart(e.clientX, e.clientY);
        }
      }}
      onMouseMove={(e) => handleDragMove(e.clientX, e.clientY)}
      onMouseUp={handleDragEnd}
      onMouseLeave={handleDragEnd}
      onTouchStart={(e) => {
        if(!e.target.closest('.room-node') && !e.target.closest('.floor-selector') && !e.target.closest('.map-legend') && !e.target.closest('.bottom-floor-bar')) {
          handleDragStart(e.touches[0].clientX, e.touches[0].clientY);
        }
      }}
      onTouchMove={(e) => handleDragMove(e.touches[0].clientX, e.touches[0].clientY)}
      onTouchEnd={handleDragEnd}
    >
      <div className="map-legend">
        <div style={{ fontSize: '0.85rem', fontWeight: 800, marginBottom: '10px', color: '#94A3B8' }}>MAP LEGEND</div>
        <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '8px', fontSize: '0.8rem', fontWeight: 600 }}><span style={{ width: '14px', height: '14px', borderRadius: '4px', background: '#06B6D4' }}></span> Public Relations & Tourism</div>
        <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '8px', fontSize: '0.8rem', fontWeight: 600 }}><span style={{ width: '14px', height: '14px', borderRadius: '4px', background: '#4f46e5' }}></span> Executive & Admin / Legal</div>
        <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '8px', fontSize: '0.8rem', fontWeight: 600 }}><span style={{ width: '14px', height: '14px', borderRadius: '4px', background: '#0c6046' }}></span> Finance & Internal Audit</div>
        <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '8px', fontSize: '0.8rem', fontWeight: 600 }}><span style={{ width: '14px', height: '14px', borderRadius: '4px', background: '#4338ca' }}></span> Office of the Mayor</div>
        <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '8px', fontSize: '0.8rem', fontWeight: 600 }}><span style={{ width: '14px', height: '14px', borderRadius: '4px', background: '#911e1f' }}></span> Security & Support Services</div>
        <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '8px', fontSize: '0.8rem', fontWeight: 600 }}><span style={{ width: '14px', height: '14px', borderRadius: '4px', background: '#c2410c' }}></span> Public Halls & Events</div>
      </div>

      <div className="floor-selector" style={{ position: 'absolute', top: 30, right: 30, zIndex: 10, display: 'flex', flexDirection: 'column', gap: '8px' }}>
        <button className="ui-action-btn projection-toggle-btn" onClick={() => setIs3DActive(!is3DActive)} style={{ padding: '12px', fontSize: '1rem', fontWeight: 'bold' }}>
          {is3DActive ? "🗺️ 2D" : "🌐 3D"}
        </button>
        <button className="ui-action-btn zoom-btn" style={{ height: '45px', fontSize: '1.2rem' }} onClick={() => setZoom(z => Math.min(1.8, z + 0.12))}>➕</button>
        <button className="ui-action-btn zoom-btn" style={{ height: '45px', fontSize: '1.2rem' }} onClick={() => setZoom(z => Math.max(0.35, z - 0.12))}>➖</button>
      </div>

      <div className="bottom-floor-bar" style={{
          position: 'absolute', bottom: '30px', left: '50%', transform: 'translateX(-50%)',
          display: 'flex', gap: '12px', background: 'rgba(15, 23, 42, 0.85)', padding: '15px 25px',
          borderRadius: '24px', border: '1px solid rgba(255,255,255,0.1)', backdropFilter: 'blur(10px)',
          zIndex: 100, boxShadow: '0 20px 40px rgba(0,0,0,0.3)', overflowX: 'auto', maxWidth: '90%', scrollBehavior: 'smooth'
      }}>
        {[1, 2, 3, 4, 5, 6, 7].map(floor => {
          const isActive = currentFloor === floor;
          return (
            <button 
              key={floor}
              onClick={() => { setCurrentFloor(floor); setSelectedOfficeKey(null); }}
              style={{
                minWidth: '130px', padding: '14px 20px', borderRadius: '16px',
                border: isActive ? '2px solid #4F46E5' : '1px solid rgba(255,255,255,0.2)',
                backgroundColor: isActive ? '#4F46E5' : 'transparent', color: isActive ? '#FFFFFF' : '#E2E8F0',
                fontWeight: '900', fontSize: '1.1rem', cursor: 'pointer', transition: 'all 0.2s ease', 
                whiteSpace: 'nowrap', boxShadow: isActive ? '0 8px 15px rgba(79, 70, 229, 0.4)' : 'none'
              }}
            >
              {floor === 1 ? 'GF / 1st' : `${floor}${floor === 2 ? 'nd' : floor === 3 ? 'rd' : 'th'} Floor`}
            </button>
          )
        })}
      </div>

      <div className={`map-canvas-container ${is3DActive ? 'is-3d-active' : ''}`} style={mapTransformStyle}>
        <div className="mock-map-graphic">
          
          {currentFloor === 1 && <div className="floor-plate" style={{ width: 980, height: 900, left: 350, top: 100 }}></div>}
          
          {currentFloor === 2 && (
            <svg width="1400" height="1300" style={{ position: 'absolute', top: 0, left: 0, zIndex: 1, pointerEvents: 'none' }}>
              <g stroke="#9CA3AF" strokeWidth="8" fill="transparent" strokeLinecap="round">
                <rect x="30" y="80" width="1000" height="850" rx="12" />
                {/* Ito yung may butas na pinto sa taas: */}
                <path d="M 30 240 L 80 240 M 120 240 L 190 240 M 230 240 L 310 240 M 350 240 L 430 240 M 470 240 L 665 240 M 705 240 L 915 240 M 955 240 L 1030 240" />
                {/* Ito yung mga walls sa ibaba na nawala kanina (ibinalik na natin): */}
                <path d="M 30 310 L 380 310" />
                <path d="M 380 380 L 380 520" />
                <path d="M 720 490 L 720 280 L 800 280 M 870 280 L 950 280 L 950 490 L 880 490 M 780 490 L 720 490" />
                <path d="M 30 520 L 480 520 M 580 520 L 1030 520" />
              </g>
            </svg>
          )}
          
          {(currentFloor === 3 || currentFloor === 4 || currentFloor === 5) && (
            <svg width="1400" height="1300" style={{ position: 'absolute', top: 0, left: 0, zIndex: 1, pointerEvents: 'none' }}>
              <g stroke="#9CA3AF" strokeWidth="6" fill="rgba(255,255,255,0.03)">
                <path d="M 150 300 L 410 300 L 410 80 L 810 80 L 810 170 L 1080 170 L 1080 580 L 780 580 L 780 740 L 480 740 L 480 870 L 150 870 Z" />
                <path d="M 410 300 L 150 300 L 150 610 L 410 610 L 410 490 M 410 430 L 410 300" />
                <path d="M 410 270 L 410 80 L 810 80 L 810 270 L 740 270 M 680 270 L 570 270 M 510 270 L 410 270" />
                <path d="M 510 300 L 510 460 L 730 460 L 730 300 L 660 300 M 580 300 L 510 300" />
                <path d="M 820 170 L 1080 170 L 1080 580 L 820 580 L 820 420 M 820 360 L 820 170" />
                <path d="M 480 520 L 480 740 L 780 740 L 780 520 L 670 520 M 600 520 L 480 520" />
                <path d="M 150 650 L 150 870 L 480 870 L 480 650 L 400 650 M 340 650 L 150 650" />
              </g>
            </svg>
          )}
          
          {currentFloor === 6 && (
            <svg width="1400" height="1300" style={{ position: 'absolute', top: 0, left: 0, zIndex: 1, pointerEvents: 'none' }}>
              <g stroke="#9CA3AF" strokeWidth="6" fill="rgba(255,255,255,0.03)">
                <rect x="200" y="100" width="750" height="800" rx="4" fill="none" stroke="#9CA3AF" strokeWidth="6" />
                <path d="M 450 150 L 250 150 L 250 650 L 450 650 L 450 520 M 450 440 L 450 150" />
                <path d="M 600 150 L 500 150 L 500 450 L 800 450 L 800 150 L 700 150" />
                <path d="M 500 650 L 500 850 L 900 850 L 900 650 L 750 650 M 650 650 L 500 650" />
              </g>
            </svg>
          )}
          
          {currentFloor === 7 && (
            <svg width="1400" height="1300" style={{ position: 'absolute', zIndex: 1, pointerEvents: 'none' }}>
              <g stroke="#9CA3AF" strokeWidth="6" fill="transparent">
                <rect x="50" y="50" width="900" height="820" />
                <path d="M 50 450 L 450 450" />
                <path d="M 450 50 L 450 380" />
                <path d="M 450 380 L 950 380" />
                <path d="M 680 50 L 680 380" />
                <path d="M 620 420 L 515 420 L 515 510 L 600 510" />
                <path d="M 600 510 L 600 605" />
                <path d="M 590 605 L 820 605" />
                <path d="M 590 605 L 590 870" />
              </g>
            </svg>
          )}

          {currentFloor === 1 && (
            <>
              <div className="structural-element garden-area" style={{ width: '480px', height: '180px', left: '370px', top: '740px' }}>
                <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', width: '100%', height: '100%' }}>
                  <div style={{ fontSize: '2.2rem', display: 'flex', gap: '15px', justifyContent: 'center' }}>🌿 🪴 🌴</div>
                  <div style={{ textAlign: 'center', fontWeight: '800', marginTop: '10px' }}>Atrium Garden</div>
                </div>
              </div>
              <div className="structural-element stairs-block" style={{ width: '255px', height: '100px', left: '370px', top: '585px' }}>
                <div className="stair-lines"></div><span className="stair-label">Stairs ▶</span>
              </div>
              <div className="structural-element elevator-block" style={{ width: '270px', height: '110px', left: '1040px', top: '690px' }}>
                Elevator<div className="elevator-doors" style={{ left: '105px' }}></div>
              </div>
              <div className="structural-element escalator-block" style={{ width: '270px', height: '90px', left: '1040px', top: '820px' }}>
                <div className="stair-lines"></div><span className="escalator-label">Escalator ◀</span>
              </div>
              <div className="grey-wall" style={{ width: '0px', height: '65px', left: '1010px', top: '615px' }}></div>
              <div className="grey-wall" style={{ width: '0px', height: '260px', left: '1010px', top: '740px' }}></div>
            </>
          )}
          
          {currentFloor === 2 && (
            <>
              <div className="structural-element stairs-block" style={{ width: 150, height: 80, left: 150, top: 380, background: 'rgba(255,255,255,0.1)', border: '1px solid rgba(255,255,255,0.2)' }}><div className="stair-lines"></div><span className="stair-label">Stairs ▼</span></div>
              <div className="structural-element stairs-block" style={{ width: 100, height: 80, left: 100, top: 810, background: 'rgba(255,255,255,0.1)', border: '1px solid rgba(255,255,255,0.2)' }}><div className="stair-lines"></div><span className="stair-label">Stairs ↗</span></div>
              <div className="structural-element escalator-block" style={{ width: 150, height: 60, left: 500, top: 590, background: 'rgba(255,255,255,0.1)', border: '1px solid rgba(255,255,255,0.2)' }}><div className="escalator-lines"></div><span className="escalator-label">Escalator ▼</span></div>
              <div style={{ position: 'absolute', width: 40, height: 30, left: 800, top: 460, background: '#9CA3AF', borderRadius: '4px 4px 0 0', display: 'flex', alignItems: 'flex-end', justifyContent: 'center', fontSize: '10px', fontWeight: 'bold', color: '#1F2937' }}>ELEV</div>
              <div style={{ position: 'absolute', width: 40, height: 30, left: 850, top: 460, background: '#9CA3AF', borderRadius: '4px 4px 0 0', display: 'flex', alignItems: 'flex-end', justifyContent: 'center', fontSize: '10px', fontWeight: 'bold', color: '#1F2937' }}>ELEV</div>
            </>
          )}
          
          {(currentFloor >= 3 && currentFloor <= 5) && (
            <>
              <div className="structural-element stairs-block" style={{ width: 80, height: 80, left: 200, top: 680, background: 'rgba(255,255,255,0.1)', border: '1px solid rgba(255,255,255,0.2)' }}><div className="stair-lines"></div><span className="stair-label">Stairs ↙</span></div>
              <div className="structural-element stairs-block" style={{ width: 80, height: 80, left: 280, top: 740, background: 'rgba(255,255,255,0.1)', border: '1px solid rgba(255,255,255,0.2)' }}><div className="stair-lines"></div><span className="stair-label">Stairs ↗</span></div>
              <div style={{ position: 'absolute', width: 40, height: 30, left: 560, top: 410, background: '#9CA3AF', borderRadius: '4px 4px 0 0', display: 'flex', alignItems: 'flex-end', justifyContent: 'center', fontSize: '10px', fontWeight: 'bold', color: '#1F2937' }}>ELEV</div>
              <div style={{ position: 'absolute', width: 40, height: 30, left: 640, top: 410, background: '#9CA3AF', borderRadius: '4px 4px 0 0', display: 'flex', alignItems: 'flex-end', justifyContent: 'center', fontSize: '10px', fontWeight: 'bold', color: '#1F2937' }}>ELEV</div>
              {(currentFloor === 4 || currentFloor === 5) && (
                  <div className="structural-element escalator-block" style={{ width: 120, height: 50, left: 560, top: 480, background: 'rgba(255,255,255,0.1)', border: '1px solid rgba(255,255,255,0.2)' }}><div className="escalator-lines"></div><span className="escalator-label">Escalator ▼</span></div>
              )}
            </>
          )}
          
          {currentFloor === 6 && (
            <>
              <div style={{ position: 'absolute', width: 50, height: 40, left: 570, top: 350, background: '#9CA3AF', borderRadius: '4px 4px 0 0', display: 'flex', alignItems: 'flex-end', justifyContent: 'center', fontSize: '12px', fontWeight: 'bold', color: '#1F2937' }}>ELEV</div>
              <div style={{ position: 'absolute', width: 50, height: 40, left: 680, top: 350, background: '#9CA3AF', borderRadius: '4px 4px 0 0', display: 'flex', alignItems: 'flex-end', justifyContent: 'center', fontSize: '12px', fontWeight: 'bold', color: '#1F2937' }}>ELEV</div>
              <div className="structural-element stairs-block" style={{ width: 200, height: 60, left: 550, top: 550, background: 'rgba(255,255,255,0.1)', border: '1px solid rgba(255,255,255,0.2)' }}><div className="stair-lines"></div><span className="stair-label">Stairs ↙ ↗</span></div>
            </>
          )}
          
          {currentFloor === 7 && (
            <>
              <div style={{ position: 'absolute', width: 60, height: 40, left: 550, top: 320, background: '#9CA3AF', borderRadius: '4px', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '10px', fontWeight: 'bold', color: '#1F2937', zIndex: 5 }}>ELEV</div>
              <div className="structural-element stairs-block" style={{ width: 100, height: 60, left: 550, top: 430, background: 'rgba(255,255,255,0.1)', border: '1px solid rgba(255,255,255,0.2)' }}><div className="stair-lines"></div><span className="stair-label">Stairs ↙</span></div>
            </>
          )}

          {Object.entries(offices || {}).map(([key, office]) => {
            const isVertical = office.cssClass && office.cssClass.includes('vertical-text-wrapper');
            const activeStyle = selectedOfficeKey === key ? {
              boxShadow: '0 0 30px 10px rgba(255, 255, 255, 0.5)',
              transform: 'scale(1.02)',
              transition: 'all 0.3s ease',
              border: '2px solid white',
              zIndex: 20
            } : { transition: 'all 0.3s ease' };

            return (
              <div 
                key={key}
                className={`room-node ${office.cssClass || ''} ${selectedOfficeKey === key ? 'active-room' : ''}`}
                style={{...office.style, ...activeStyle}}
                onClick={() => onSelectOffice(key)}
              >
                <span className="room-label">
                  {isVertical ? <span className="vertical-text">{office.title}</span> : office.title}
                </span>
              </div>
            );
          })}

          <svg className="path-overlay" width="100%" height="100%">
            <path ref={pathRef} d={finalPathData} className="marching-route-line" />
          </svg>
          
          <div className="node pin-kiosk" style={{ ...kioskStyle }}>
            <span className="pulse-ring"></span>{kioskText}
          </div>

          {selectedOffice && selectedOffice.targetX && (
            <div className="node pin-destination" style={{ display: 'block', left: selectedOffice.targetX, top: selectedOffice.targetY, zIndex: 100 }}>
              🎯 {selectedOffice.title}
            </div>
          )}

        </div>
      </div>
    </main>
  );
}