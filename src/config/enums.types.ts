// Enum types from GET /api/config/enums

export interface EnumValue {
  value: string;
  displayName: string;
}

export interface EnumsResponse {
  roleArchetypes: EnumValue[];
  jobStatus: EnumValue[];
  seniorityLevel: EnumValue[];
  candidateJobStatus: EnumValue[];
  profileSource: EnumValue[];
  userRole: EnumValue[];
}
