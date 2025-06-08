
import React from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { TussCodeList, TussCode } from '@/components/angioplasty/TussCodeList';
import { MaterialsList } from '@/components/angioplasty/MaterialsList';
import { SurgicalTeamSelector } from '@/components/angioplasty/SurgicalTeamSelector';
import { MaterialWithQuantity } from '@/types/material';
import { SurgicalTeam } from '@/types/angioplasty-request';

interface ProceduresAndMaterialsFormProps {
  selectedProcedures: TussCode[];
  selectedMaterials: MaterialWithQuantity[];
  surgicalTeam: SurgicalTeam;
  onAddProcedure: (procedure: TussCode) => void;
  onRemoveProcedure: (procedureId: string) => void;
  onAddMaterial: (material: MaterialWithQuantity) => void;
  onRemoveMaterial: (materialId: string) => void;
  onUpdateMaterialQuantity: (materialId: string, quantity: number) => void;
  setSurgicalTeam: React.Dispatch<React.SetStateAction<SurgicalTeam>>;
}

export const ProceduresAndMaterialsForm: React.FC<ProceduresAndMaterialsFormProps> = ({
  selectedProcedures,
  selectedMaterials,
  surgicalTeam,
  onAddProcedure,
  onRemoveProcedure,
  onAddMaterial,
  onRemoveMaterial,
  onUpdateMaterialQuantity,
  setSurgicalTeam,
}) => {
  // Convert SurgicalTeam to SurgicalTeamData format
  const surgicalTeamData = {
    surgeon: surgicalTeam.surgeon,
    cardiologist: null, // SurgicalTeam doesn't have cardiologist, so set to null
    anesthesiologist: surgicalTeam.anesthesiologist,
    nurses: [], // SurgicalTeam doesn't have nurses array, so set to empty
  };

  const handleTeamChange = (teamData: any) => {
    // Convert back to SurgicalTeam format
    setSurgicalTeam({
      surgeon: teamData.surgeon,
      assistant: surgicalTeam.assistant, // Keep existing assistant
      anesthesiologist: teamData.anesthesiologist,
    });
  };

  return (
    <div className="space-y-6">
      <Card>
        <CardContent className="pt-6">
          <h3 className="text-lg font-medium mb-4">Procedimentos TUSS</h3>
          <TussCodeList 
            selectedProcedures={selectedProcedures}
            onAdd={onAddProcedure}
            onRemove={onRemoveProcedure}
          />
        </CardContent>
      </Card>

      <Card>
        <CardContent className="pt-6">
          <h3 className="text-lg font-medium mb-4">Materiais</h3>
          <MaterialsList
            selectedMaterials={selectedMaterials}
            onAdd={onAddMaterial}
            onRemove={onRemoveMaterial}
            onUpdateQuantity={onUpdateMaterialQuantity}
            selectedProcedures={selectedProcedures}
          />
        </CardContent>
      </Card>

      <Card>
        <CardContent className="pt-6">
          <h3 className="text-lg font-medium mb-4">Equipe Cirúrgica</h3>
          <SurgicalTeamSelector
            value={surgicalTeamData}
            onChange={handleTeamChange}
          />
        </CardContent>
      </Card>
    </div>
  );
};
