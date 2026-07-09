import React, { useState } from 'react';
import { QRCodeSVG } from 'qrcode.react';

export default function Directory({ offices, onSelectOffice, selectedOfficeKey }) {
  const [searchTerm, setSearchTerm] = useState('');
  
  // Kinukuha nito yung URL ng app niyo automatically para sa QR Code
  const appUrl = window.location.origin;
  // Sa Directory.jsx
const currentHost = window.location.hostname; // Ito ay magiging 192.168.x.x imbes na localhost
const qrValue = `http://${currentHost}:5174/download/${selectedOfficeKey}`;

  const filteredOffices = Object.entries(offices || {}).filter(([key, office]) =>
    office.title?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    office.head?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div style={{ 
      width: '320px', 
      backgroundColor: '#1e293b', 
      padding: '20px', 
      borderRadius: '12px', 
      display: 'flex', 
      flexDirection: 'column', 
      gap: '15px',
      height: 'calc(100vh - 160px)', 
      minHeight: '600px',            
      boxSizing: 'border-box'
    }}>
      <h3 style={{ margin: 0, fontSize: '1.2rem', color: '#6366f1', display: 'flex', alignItems: 'center', gap: '8px' }}>
        🏢 Office Directory
      </h3>
      
      <input
        type="text"
        placeholder="Search office or department..."
        value={searchTerm}
        onChange={(e) => setSearchTerm(e.target.value)}
        style={{ 
          width: '100%', 
          padding: '12px', 
          borderRadius: '8px', 
          border: '1px solid #475569', 
          backgroundColor: '#0f172a', 
          color: 'white',
          boxSizing: 'border-box'
        }}
      />

      <div style={{ 
        flex: 1, 
        overflowY: 'auto', 
        display: 'flex', 
        flexDirection: 'column', 
        gap: '8px',
        paddingRight: '4px' 
      }}>
        {filteredOffices.length === 0 ? (
          <p style={{ color: '#94a3b8', fontSize: '0.9rem', textAlign: 'center', marginTop: '20px' }}>
            No offices found.
          </p>
        ) : (
          filteredOffices.map(([key, office]) => (
            <div
              key={key}
              onClick={() => onSelectOffice(key)}
              style={{
                padding: '14px 12px',
                borderRadius: '8px',
                backgroundColor: selectedOfficeKey === key ? '#10b981' : '#334155', 
                cursor: 'pointer',
                transition: 'all 0.15s ease-in-out',
                borderLeft: selectedOfficeKey === key ? '4px solid white' : '4px solid transparent',
                boxShadow: '0 2px 4px rgba(0,0,0,0.1)'
              }}
            >
              <strong style={{ display: 'block', fontSize: '0.95rem', color: 'white' }}>
                {office.title}
              </strong>
              <span style={{ fontSize: '0.75rem', color: '#cbd5e1', display: 'block', marginTop: '4px' }}>
                {office.badge || 'No Room Listed'}
              </span>
            </div>
          ))
        )}
      </div>

      {/* Dito natin pumu-pwesto yung QR Code sa ilalim kapag may napili nang office */}
      {selectedOfficeKey && (
        <div style={{
          marginTop: '10px',
          padding: '15px',
          backgroundColor: 'white',
          borderRadius: '8px',
          textAlign: 'center',
          boxShadow: '0 4px 6px rgba(0,0,0,0.1)'
        }}>
          <h4 style={{ color: '#1e293b', margin: '0 0 10px 0', fontSize: '0.9rem', fontWeight: 'bold' }}>
            Scan for Requirements
          </h4>
          
          <QRCodeSVG
            value={`${appUrl}/download/${selectedOfficeKey}`}
            size={130}
          />
          
          <p style={{ color: '#64748b', fontSize: '0.75rem', marginTop: '10px', marginBottom: 0 }}>
            Use your phone camera to download the PDF.
          </p>
        </div>
      )}
    </div>
  );
}