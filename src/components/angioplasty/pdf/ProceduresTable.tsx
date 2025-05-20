
import React from 'react';

interface TussCode {
  id: string;
  code: string;
  description: string;
}

interface ProceduresTableProps {
  tussProcedures: TussCode[];
}

export const ProceduresTable: React.FC<ProceduresTableProps> = ({ tussProcedures }) => {
  return (
    <div className="mb-6">
      <h3 className="font-bold mb-2 border-b pb-1">Código TUSS</h3>
      <table className="w-full border-collapse">
        <thead>
          <tr className="bg-gray-50">
            <th className="border border-gray-300 px-4 py-2 text-left w-1/3">Código</th>
            <th className="border border-gray-300 px-4 py-2 text-left">Descrição</th>
          </tr>
        </thead>
        <tbody>
          {tussProcedures.map((proc, index) => (
            <tr key={proc.id} className={index % 2 === 0 ? 'bg-white' : 'bg-gray-50'}>
              <td className="border border-gray-300 px-4 py-2">{proc.code}</td>
              <td className="border border-gray-300 px-4 py-2">{proc.description}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};
