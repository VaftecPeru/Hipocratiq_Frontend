export type AdminSpecialty = {
  id: number;
  code: string;
  name: string;
  parentId: number | null;
  parent: { id: number; name: string } | null;
  isActive: boolean;
  subspecialtiesCount: number;
  usage: {
    doctors: number;
    patientIntakes: number;
  };
};

export type AdminSpecialtyPayload = {
  code: string;
  name: string;
  parentId: number | null;
  isActive: boolean;
};
