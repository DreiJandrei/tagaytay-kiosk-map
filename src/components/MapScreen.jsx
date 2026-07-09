import React, { useEffect, useRef, useState } from 'react';
import { QRCodeSVG } from 'qrcode.react';

export default function MapScreen({ 
  offices, 
  selectedOfficeKey, 
  onSelectOffice, 
  currentFloor,
  setCurrentFloor,      // Prop added to allow canvas floor changing
  setSelectedOfficeKey, // Prop added to reset active rooms on floor change
  is3DActive,
  setIs3DActive
}) {
  const pathRef = useRef(null);
  const isDragging = useRef(false);
  const dragStart = useRef({ x: 0, y: 0 });

  const [zoom, setZoom] = useState(0.65);
  const [pan, setPan] = useState({ x: 20, y: -120 });

  // Handle drawing path animation whenever selections or floors adjust
// Handle drawing path animation
  useEffect(() => {
    // ITAMA NATIN DITO: Siguraduhin na "exist" ang pathRef.current
    if (pathRef.current && selectedOfficeKey && offices?.[selectedOfficeKey]) {
      const routeLine = pathRef.current;
      
      // I-reset ang styles nang maingat
      routeLine.style.animation = 'none';
      routeLine.style.transition = 'none';
      
      const totalLength = routeLine.getTotalLength() || 1000;
      routeLine.style.strokeDasharray = totalLength;
      routeLine.style.strokeDashoffset = totalLength;
      
      // Force repaint
      routeLine.getBoundingClientRect(); 
      
      routeLine.style.transition = 'stroke-dashoffset 1.2s ease-in-out';
      routeLine.style.strokeDashoffset = '0';
    }
  }, [selectedOfficeKey, offices]); // Trigger kapag nagbago ang selection

  const handleDragStart = (clientX, clientY) => {
    isDragging.current = true;
    dragStart.current = { x: clientX - pan.x, y: clientY - pan.y };
  };

  const handleDragMove = (clientX, clientY) => {
    if (!isDragging.current) return;
    setPan({ x: clientX - dragStart.current.x, y: clientY - dragStart.current.y });
  };

  const handleDragEnd = () => { isDragging.current = false; };

  const selectedOffice = selectedOfficeKey ? offices?.[selectedOfficeKey] : null;
  
  // Calculate Kiosk Position pin based on current active floors
  let kioskText = "🔴 YOU ARE HERE (Elevator)";
  let kioskStyle = { left: 860, top: 490 }; 

  if (currentFloor === 1) {
      kioskText = "🔴 YOU ARE HERE (Main Entrance)";
      kioskStyle = { left: 1030, top: 1000 };
  } else if (currentFloor >= 3 && currentFloor <= 5) {
      kioskStyle = { left: 620, top: 480 }; 
  } else if (currentFloor === 6) {
      kioskStyle = { left: 650, top: 480 }; 
  } else if (currentFloor === 7) {
      kioskStyle = { left: 550, top: 320 }; 
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
        if(!e.target.closest('.room-node') && !e.target.closest('.floor-selector') && !e.target.closest('.map-legend')) {
          handleDragStart(e.clientX, e.clientY);
        }
      }}
      onMouseMove={(e) => handleDragMove(e.clientX, e.clientY)}
      onMouseUp={handleDragEnd}
      onMouseLeave={handleDragEnd}
      onTouchStart={(e) => {
        if(!e.target.closest('.room-node') && !e.target.closest('.floor-selector') && !e.target.closest('.map-legend')) {
          handleDragStart(e.touches[0].clientX, e.touches[0].clientY);
        }
      }}
      onTouchMove={(e) => handleDragMove(e.touches[0].clientX, e.touches[0].clientY)}
      onTouchEnd={handleDragEnd}
    >
      {/* MAP LEGEND */}
      <div className="map-legend" style={{ position: 'absolute', bottom: 30, left: 30, background: 'rgba(15,23,42,0.85)', padding: '15px 20px', borderRadius: 12, border: '1px solid rgba(255,255,255,0.1)', color: 'white', zIndex: 100, pointerEvents: 'none' }}>
        <div style={{ fontSize: '0.85rem', fontWeight: 800, marginBottom: 10, color: '#94A3B8' }}>MAP LEGEND</div>
        <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 8, fontSize: '0.8rem', fontWeight: 600 }}><span style={{ width: 14, height: 14, borderRadius: 4, background: '#06B6D4' }}></span> Public Relations & Tourism</div>
        <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 8, fontSize: '0.8rem', fontWeight: 600 }}><span style={{ width: 14, height: 14, borderRadius: 4, background: '#4f46e5' }}></span> Executive & Admin / Legal</div>
        <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 8, fontSize: '0.8rem', fontWeight: 600 }}><span style={{ width: 14, height: 14, borderRadius: 4, background: '#0c6046' }}></span> Finance & Internal Audit</div>
        <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 8, fontSize: '0.8rem', fontWeight: 600 }}><span style={{ width: 14, height: 14, borderRadius: 4, background: '#4338ca' }}></span> Office of the Mayor</div>
        <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 8, fontSize: '0.8rem', fontWeight: 600 }}><span style={{ width: 14, height: 14, borderRadius: 4, background: '#911e1f' }}></span> Security & Support Services</div>
        <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 8, fontSize: '0.8rem', fontWeight: 600 }}><span style={{ width: 14, height: 14, borderRadius: 4, background: '#c2410c' }}></span> Public Halls & Events</div>
      </div>

      {/* CANVAS ADJUSTMENT CONTROLS */}
      <div className="floor-selector" style={{ zIndex: 10, display: 'flex', flexDirection: 'column', gap: '8px' }}>
        <button 
          className="ui-action-btn projection-toggle-btn" 
          onClick={() => setIs3DActive(!is3DActive)}
          style={{ padding: '12px', fontSize: '1rem', fontWeight: 'bold' }}
        >
          {is3DActive ? "🗺️ 2D" : "🌐 3D"}
        </button>
        <button className="ui-action-btn zoom-btn" style={{ height: '45px', fontSize: '1.2rem' }} onClick={() => setZoom(z => Math.min(1.8, z + 0.12))}>➕</button>
        <button className="ui-action-btn zoom-btn" style={{ height: '45px', fontSize: '1.2rem' }} onClick={() => setZoom(z => Math.max(0.35, z - 0.12))}>➖</button>
        
        <div style={{ width: '100%', height: '2px', background: 'rgba(255,255,255,0.15)', margin: '4px 0' }} />

        {/* FLOATING FLOOR LEVEL SELECTORS */}
        {[7, 6, 5, 4, 3, 2, 1].map(floor => (
          <button 
            key={floor}
            onClick={() => { setCurrentFloor(floor); setSelectedOfficeKey(null); }}
            style={{
              width: '50px',
              height: '50px',
              borderRadius: '10px',
              border: currentFloor === floor ? '2px solid #4F46E5' : '1px solid rgba(255,255,255,0.1)',
              backgroundColor: currentFloor === floor ? '#4F46E5' : 'rgba(15, 23, 42, 0.85)',
              color: 'white',
              fontWeight: '900',
              cursor: 'pointer',
              fontSize: '1.1rem',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              boxShadow: '0 4px 6px rgba(0,0,0,0.2)',
              transition: 'all 0.2s ease'
            }}
          >
            F{floor}
          </button>
        ))}
      </div>

      <div className={`map-canvas-container ${is3DActive ? 'is-3d-active' : ''}`} style={mapTransformStyle}>
        <div className="mock-map-graphic">
          
          {/* FLOOR PLANS PLATES & VECTOR PATH SCHEMATICS */}
          {currentFloor === 1 && <div className="floor-plate" style={{ width: 980, height: 900, left: 350, top: 100 }}></div>}
         {currentFloor === 2 && (
            <svg width="1400" height="1300" style={{ position: 'absolute', top: 0, left: 0, zIndex: 1, pointerEvents: 'none' }}>
              {/* Ginawang strokeWidth="8" para mas makapal at kitang-kita */}
              <g stroke="#9CA3AF" strokeWidth="8" fill="transparent" strokeLinecap="round">
                
                {/* 1. OUTER BORDER ng buong floor */}
                <rect x="30" y="80" width="1000" height="850" rx="12" />
                
                {/* 2. ITO YUNG DRINAWING MO: Solid at diretsong pader sa ilalim ng mga offices sa taas */}
                <path d="M 30 240 L 1030 240" />
                
                {/* 3. Mga pader para sa hagdan at ibang kwarto */}
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

          {/* STRUCTURAL LANDMARKS */}
          {/* MGA PADER SA 1ST FLOOR HALLWAY (May gap para sa pinto) */}
{/* ================= FLOOR 1 STRUCTURAL ELEMENTS ================= */}
        {currentFloor === 1 && (
          <>
            {/* Atrium Garden */}
            <div className="structural-element garden-area" style={{ width: '480px', height: '180px', left: '370px', top: '740px' }}>
              <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', width: '100%', height: '100%' }}>
                <div style={{ fontSize: '2.2rem', display: 'flex', gap: '15px', justifyContent: 'center' }}>🌿 🪴 🌴</div>
                <div style={{ textAlign: 'center', fontWeight: '800', marginTop: '10px' }}>Atrium Garden</div>
              </div>
            </div>

            {/* Stairs */}
            <div className="structural-element stairs-block" style={{ width: '255px', height: '100px', left: '370px', top: '585px' }}>
              <div className="stair-lines"></div>
              <span className="stair-label">Stairs ▶</span>
            </div>

            {/* Elevator */}
            <div className="structural-element elevator-block" style={{ width: '270px', height: '110px', left: '1040px', top: '690px' }}>
              Elevator
              <div className="elevator-doors" style={{ left: '105px' }}></div>
            </div>

            {/* Escalator */}
            <div className="structural-element escalator-block" style={{ width: '270px', height: '90px', left: '1040px', top: '820px' }}>
              <div className="stair-lines"></div>
              <span className="escalator-label">Escalator ◀</span>
            </div>

            {/* MGA PADER SA MAIN HALLWAY (May butas sa Y=710 para sakto sa likuan ng red line) */}
            
            {/* Taas na Pader (Mula sa Tourism Office pababa bago mag-pinto) */}
            <div 
              className="grey-wall" 
              style={{ width: '0px', height: '65px', left: '1010px', top: '615px' }}
            ></div>

            {/* YUNG PINTO AY NASA top: 680px hanggang 740px (Gitna niya ang 710px kung saan lumiliko ang routing arrow) */}

            {/* Babang Pader (Mula sa pinto pababa hanggang Main Entrance) */}
            <div 
              className="grey-wall" 
              style={{ width: '0px', height: '260px', left: '1010px', top: '740px' }}
            ></div>
          </>
        )}
          {currentFloor === 2 && (
            <>
              <div className="structural-element stairs-block" style={{ width: 150, height: 80, left: 150, top: 380, background: 'rgba(255,255,255,0.1)', border: '1px solid rgba(255,255,255,0.2)' }}>
                <div className="stair-lines"></div><span className="stair-label">Stairs ▼</span>
              </div>
              <div className="structural-element stairs-block" style={{ width: 100, height: 80, left: 100, top: 810, background: 'rgba(255,255,255,0.1)', border: '1px solid rgba(255,255,255,0.2)' }}>
                <div className="stair-lines"></div><span className="stair-label">Stairs ↗</span>
              </div>
              <div className="structural-element escalator-block" style={{ width: 150, height: 60, left: 500, top: 590, background: 'rgba(255,255,255,0.1)', border: '1px solid rgba(255,255,255,0.2)' }}>
                <div className="escalator-lines"></div><span className="escalator-label">Escalator ▼</span>
              </div>
              <div style={{ position: 'absolute', width: 40, height: 30, left: 800, top: 460, background: '#9CA3AF', borderRadius: '4px 4px 0 0', display: 'flex', alignItems: 'flex-end', justifyContent: 'center', fontSize: '10px', fontWeight: 'bold', color: '#1F2937' }}>ELEV</div>
              <div style={{ position: 'absolute', width: 40, height: 30, left: 850, top: 460, background: '#9CA3AF', borderRadius: '4px 4px 0 0', display: 'flex', alignItems: 'flex-end', justifyContent: 'center', fontSize: '10px', fontWeight: 'bold', color: '#1F2937' }}>ELEV</div>
            </>
          )}
          {(currentFloor >= 3 && currentFloor <= 5) && (
            <>
              <div className="structural-element stairs-block" style={{ width: 80, height: 80, left: 200, top: 680, background: 'rgba(255,255,255,0.1)', border: '1px solid rgba(255,255,255,0.2)' }}>
                <div className="stair-lines"></div><span className="stair-label">Stairs ↙</span>
              </div>
              <div className="structural-element stairs-block" style={{ width: 80, height: 80, left: 280, top: 740, background: 'rgba(255,255,255,0.1)', border: '1px solid rgba(255,255,255,0.2)' }}>
                <div className="stair-lines"></div><span className="stair-label">Stairs ↗</span>
              </div>
              <div style={{ position: 'absolute', width: 40, height: 30, left: 560, top: 410, background: '#9CA3AF', borderRadius: '4px 4px 0 0', display: 'flex', alignItems: 'flex-end', justifyContent: 'center', fontSize: '10px', fontWeight: 'bold', color: '#1F2937' }}>ELEV</div>
              <div style={{ position: 'absolute', width: 40, height: 30, left: 640, top: 410, background: '#9CA3AF', borderRadius: '4px 4px 0 0', display: 'flex', alignItems: 'flex-end', justifyContent: 'center', fontSize: '10px', fontWeight: 'bold', color: '#1F2937' }}>ELEV</div>
              {(currentFloor === 4 || currentFloor === 5) && (
                  <div className="structural-element escalator-block" style={{ width: 120, height: 50, left: 560, top: 480, background: 'rgba(255,255,255,0.1)', border: '1px solid rgba(255,255,255,0.2)' }}>
                      <div className="escalator-lines"></div><span className="escalator-label">Escalator ▼</span>
                  </div>
              )}
            </>
          )}
          {currentFloor === 6 && (
            <>
              <div style={{ position: 'absolute', width: 50, height: 40, left: 570, top: 350, background: '#9CA3AF', borderRadius: '4px 4px 0 0', display: 'flex', alignItems: 'flex-end', justifyContent: 'center', fontSize: '12px', fontWeight: 'bold', color: '#1F2937' }}>ELEV</div>
              <div style={{ position: 'absolute', width: 50, height: 40, left: 680, top: 350, background: '#9CA3AF', borderRadius: '4px 4px 0 0', display: 'flex', alignItems: 'flex-end', justifyContent: 'center', fontSize: '12px', fontWeight: 'bold', color: '#1F2937' }}>ELEV</div>
              <div className="structural-element stairs-block" style={{ width: 200, height: 60, left: 550, top: 550, background: 'rgba(255,255,255,0.1)', border: '1px solid rgba(255,255,255,0.2)' }}>
                <div className="stair-lines"></div><span className="stair-label">Stairs ↙ ↗</span>
              </div>
            </>
          )}
          {currentFloor === 7 && (
            <>
              <div style={{ position: 'absolute', width: 60, height: 40, left: 550, top: 320, background: '#9CA3AF', borderRadius: '4px', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '10px', fontWeight: 'bold', color: '#1F2937', zIndex: 5 }}>ELEV</div>
              <div className="structural-element stairs-block" style={{ width: 100, height: 60, left: 550, top: 430, background: 'rgba(255,255,255,0.1)', border: '1px solid rgba(255,255,255,0.2)' }}>
                <div className="stair-lines"></div><span className="stair-label">Stairs ↙</span>
              </div>
            </>
          )}

          {/* ROOM INTERFACES MAP */}
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

          {/* NAVIGATION HUD TRAIL */}
          <svg className="path-overlay" width="100%" height="100%">
            <path ref={pathRef} d={selectedOffice ? selectedOffice.pathData : ""} className="marching-route-line" />
          </svg>
          
          {/* USER GEOLOCATION PIN */}
          <div className="node pin-kiosk" style={{ display: 'block', ...kioskStyle }}>
            <span className="pulse-ring"></span>{kioskText}
          </div>

          {/* ENDPOINT PIN */}
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