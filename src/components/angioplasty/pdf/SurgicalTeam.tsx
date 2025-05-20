
import React from 'react';

interface Doctor {
  id: string;
  name: string;
  crm: string;
}

interface SurgicalTeamProps {
  surgeon: Doctor | null;
  assistant: Doctor | null;
  anesthesiologist: Doctor | null;
}

export const SurgicalTeam: React.FC<SurgicalTeamProps> = ({ surgeon, assistant, anesthesiologist }) => {
  return (
    <>
      <div className="mb-10">
        <h3 className="font-bold mb-2 border-b pb-1">Equipe Cirúrgica</h3>
        <table className="w-full">
          <tbody>
            {surgeon && (
              <tr>
                <td className="py-1 font-medium w-1/4">Cirurgião:</td>
                <td className="py-1">{surgeon.name} - {surgeon.crm}</td>
              </tr>
            )}
            
            {assistant && (
              <tr>
                <td className="py-1 font-medium w-1/4">Auxiliar:</td>
                <td className="py-1">{assistant.name} - {assistant.crm}</td>
              </tr>
            )}
            
            {anesthesiologist && (
              <tr>
                <td className="py-1 font-medium w-1/4">Anestesista:</td>
                <td className="py-1">{anesthesiologist.name} - {anesthesiologist.crm}</td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
      
      {surgeon && (
        <div className="mt-16 text-center">
          <div className="w-64 mx-auto border-t border-gray-400 pt-2">
            <p>{surgeon.name}</p>
            <p className="text-sm">{surgeon.crm}</p>
          </div>
        </div>
      )}
    </>
  );
};
