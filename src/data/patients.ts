import type { Patient } from '../types';

export const DEVICES = [
  'Trans-tibial prosthesis',
  'Trans-femoral prosthesis',
  'Trans-radial prosthesis',
  'Trans-humeral prosthesis',
  'Partial foot prosthesis',
  'Ankle-foot orthosis (AFO)',
  'Knee-ankle-foot orthosis (KAFO)',
  'Knee orthosis (custom)',
  'Foot orthosis (custom)',
  'Spinal orthosis (TLSO)',
  'Cranial orthosis',
];

/** Mock patient profiles: today's booked encounter type, device on record, history. */
export const patients: Patient[] = [
  {
    id: 'p1',
    name: 'Daniel Alvarez',
    dob: '1961-03-14',
    device: 'Trans-tibial prosthesis',
    diagnosis: 'Diabetic vascular disease, left below-knee amputation',
    scheduledType: 'prosthetic',
    historyGaps: [{ fieldId: 'l-k', label: 'Functional level (K-level)', note: 'Left open at the 12 Sep visit' }],
    encounters: [
      { id: 'e3', date: '12 Sep 2026', type: 'followup', device: 'Trans-tibial prosthesis', status: 'open_gaps',
        openGaps: ['Functional level (K-level) still not documented'] },
      { id: 'e2', date: '18 Jun 2026', type: 'prosthetic', device: 'Trans-tibial prosthesis', status: 'signed' },
      { id: 'e1', date: '02 Mar 2026', type: 'initial', device: 'Trans-tibial prosthesis', status: 'draft' },
    ],
  },
  {
    id: 'p2',
    name: 'Priya Raman',
    dob: '1974-11-02',
    device: 'Ankle-foot orthosis (AFO)',
    diagnosis: 'Foot drop, post-stroke',
    scheduledType: 'followup',
    encounters: [
      { id: 'e4', date: '29 Aug 2026', type: 'initial', device: 'Ankle-foot orthosis (AFO)', status: 'signed' },
    ],
  },
  { id: 'p3', name: 'Walter Chen', dob: '1988-07-21', encounters: [] },
];
