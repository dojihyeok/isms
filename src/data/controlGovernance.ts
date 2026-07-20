import requirementsCatalog from '../../refer/requirements.json';
import { getMoinWorkOrganization } from './moinOrganizationMapping';
import { operatingWorkMaster } from './operatingWorkMaster';
import { getOperatingWorkWbs } from './operatingWorkWbs';

export type ControlReviewStatus = '초안' | '검토요청' | '승인';

export type ControlReviewHistory = {
  at: string;
  actor: string;
  action: string;
  note: string;
};

export type ControlReviewRecord = {
  reqId: string;
  actionText: string;
  status: ControlReviewStatus;
  updatedAt: string;
  updatedBy: string;
  reviewer?: string;
  approver?: string;
  history: ControlReviewHistory[];
};

export type ControlOutputMapping = {
  mappingId: string;
  outputId: string;
  reqId: string;
  workId: string;
  activity: string;
  output: string;
  task: string;
  completionCriteria: string;
  responsible: string;
  accountable: string;
  reviewer: string;
  approver: string;
};

export type OutputEvidenceLink = {
  outputId: string;
  fileName: string;
  fileSize: number;
  fileHash: string;
  referenceDate: string;
  targetPeriod: string;
  sourceUrl: string;
  uploadedAt: string;
  uploadedBy: string;
  verificationStatus: '검토대기' | '검증완료' | '반려';
  verifiedBy?: string;
  verifiedAt?: string;
  note?: string;
};

export const controlOutputMappings: ControlOutputMapping[] = requirementsCatalog.flatMap(requirement =>
  operatingWorkMaster
    .filter(work => work.isms.includes(requirement.req_id))
    .flatMap(work => {
      const organization = getMoinWorkOrganization(work);
      return getOperatingWorkWbs(work)
        .filter(item => work.outputs.includes(item.requiredOutput))
        .map(item => ({
          mappingId: `${requirement.req_id}::${work.id}::${item.requiredOutput}`,
          outputId: `${work.id}::${item.requiredOutput}`,
          reqId: requirement.req_id,
          workId: work.id,
          activity: work.activity,
          output: item.requiredOutput,
          task: item.task,
          completionCriteria: item.completionCriteria,
          responsible: item.responsible,
          accountable: item.accountable,
          reviewer: organization.reviewerDepartment,
          approver: organization.approver,
        }));
    }),
);

export const defaultControlReviews: ControlReviewRecord[] = requirementsCatalog.map(requirement => {
  const mappings = controlOutputMappings.filter(mapping => mapping.reqId === requirement.req_id);
  return {
    reqId: requirement.req_id,
    actionText: [...new Set(mappings.map(mapping => `${mapping.workId} ${mapping.activity}`))].join('\n'),
    status: '초안',
    updatedAt: '',
    updatedBy: '',
    history: [],
  };
});

export const governanceRequirements = requirementsCatalog;

export const getControlMappings = (reqId: string) =>
  controlOutputMappings.filter(mapping => mapping.reqId === reqId);

export const uniqueControlOutputs = [
  ...new Map(controlOutputMappings.map(mapping => [mapping.outputId, mapping])).values(),
];
