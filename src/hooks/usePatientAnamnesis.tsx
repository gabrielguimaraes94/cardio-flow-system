
import { useState, useEffect } from 'react';

interface AnamnesisRecord {
  id: string;
  patientId: string;
  date: string;
  doctor: string;
  content: any; // actual anamnesis content
}

export function usePatientAnamnesis(patientId?: string) {
  const [loading, setLoading] = useState(true);
  const [anamnesisRecords, setAnamnesisRecords] = useState<AnamnesisRecord[]>([]);

  useEffect(() => {
    if (!patientId) {
      setLoading(false);
      return;
    }

    // This would be replaced with an actual API call
    const fetchAnamnesisRecords = () => {
      setLoading(true);
      
      // Mock data - in a real app, fetch from API
      const mockRecords = [
        { id: 'a1', patientId: '1', date: '2023-10-15', doctor: 'Dr. Cardoso', content: {} },
        { id: 'a2', patientId: '1', date: '2024-02-20', doctor: 'Dra. Santos', content: {} },
        { id: 'a3', patientId: '2', date: '2023-11-05', doctor: 'Dr. Ferreira', content: {} },
        { id: 'a4', patientId: '4', date: '2024-01-10', doctor: 'Dr. Oliveira', content: {} },
      ];
      
      setTimeout(() => {
        const filteredRecords = mockRecords.filter(record => record.patientId === patientId);
        setAnamnesisRecords(filteredRecords);
        setLoading(false);
      }, 500); // Simulating API delay
    };

    fetchAnamnesisRecords();
  }, [patientId]);

  const getMostRecentAnamnesis = () => {
    if (anamnesisRecords.length === 0) return null;
    
    return anamnesisRecords.sort((a, b) => 
      new Date(b.date).getTime() - new Date(a.date).getTime()
    )[0];
  };

  return {
    loading,
    anamnesisRecords,
    getMostRecentAnamnesis
  };
}
