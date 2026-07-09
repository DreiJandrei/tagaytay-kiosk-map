import React, { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import { jsPDF } from 'jspdf';
import { supabase } from './lib/supabase';

export default function DownloadPDF() {
  const { officeKey } = useParams();
  const [status, setStatus] = useState('Generating and Downloading PDF...');

  useEffect(() => {
    const generatePDF = async () => {
      try {
        // 1. Kunin ang data ng office mula sa Supabase
        const { data, error } = await supabase
          .from('offices')
          .select('*')
          .eq('office_key', officeKey)
          .single();

        if (error || !data) {
          setStatus('Office not found.');
          return;
        }

        // 2. Gawa ng PDF gamit ang jsPDF
        const doc = new jsPDF();
        
        // Design ng PDF
        doc.setFontSize(22);
        doc.text(`${data.title}`, 20, 20); // Title ng Office
        
        doc.setFontSize(12);
        doc.text(`Department Head: ${data.head || 'N/A'}`, 20, 35);
        doc.text(`Office Hours: ${data.hours || 'N/A'}`, 20, 45);
        
        doc.setFontSize(14);
        doc.text('Requirements:', 20, 60);
        
        doc.setFontSize(12);
        // Automatic na babasagin ang mahabang text para hindi lumagpas sa papel
        const requirementsText = data.requirements || 'No specific requirements listed.';
        const splitRequirements = doc.splitTextToSize(requirementsText, 170);
        doc.text(splitRequirements, 20, 70);

        // 3. I-download automatic sa phone ng user
        doc.save(`${data.title}_Requirements.pdf`);
        setStatus('✅ PDF Downloaded! You can close this page.');
        
      } catch (err) {
        console.error(err);
        setStatus('❌ Error generating PDF.');
      }
    };

    if (officeKey) {
      generatePDF();
    }
  }, [officeKey]);

  return (
    <div style={{ textAlign: 'center', padding: '50px', fontFamily: 'sans-serif' }}>
      <h2>{status}</h2>
    </div>
  );
}