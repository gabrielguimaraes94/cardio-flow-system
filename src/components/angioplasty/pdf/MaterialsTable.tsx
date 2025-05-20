
import React from 'react';

interface MaterialWithQuantity {
  id: string;
  description: string;
  quantity: number;
}

interface MaterialsTableProps {
  materials: MaterialWithQuantity[];
}

export const MaterialsTable: React.FC<MaterialsTableProps> = ({ materials }) => {
  if (materials.length === 0) return null;
  
  return (
    <div className="mb-6">
      <h3 className="font-bold mb-2 border-b pb-1">Materiais Solicitados</h3>
      <table className="w-full border-collapse">
        <thead>
          <tr className="bg-gray-50">
            <th className="border border-gray-300 px-4 py-2 text-left">Descrição</th>
            <th className="border border-gray-300 px-4 py-2 text-center w-1/5">Quantidade</th>
          </tr>
        </thead>
        <tbody>
          {materials.map((material, index) => (
            <tr key={material.id} className={index % 2 === 0 ? 'bg-white' : 'bg-gray-50'}>
              <td className="border border-gray-300 px-4 py-2">{material.description}</td>
              <td className="border border-gray-300 px-4 py-2 text-center">{material.quantity}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};
