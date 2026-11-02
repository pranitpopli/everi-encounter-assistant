import { Alert, Badge, Box, Button, Card, Group, Select, Stack, Text } from '@mantine/core';
import { IconMicrophone, IconMicrophoneOff } from '@tabler/icons-react';
import type { ReactNode } from 'react';
import { TYPE_LABEL } from '../data/checklists';
import { DEVICES, patients } from '../data/patients';
import { useEncounter } from '../state/encounterStore';
import { tokens } from '../theme';
import type { EncounterType } from '../types';
import { RecordingControls } from './RecordingControls';

// Explicit "not specified" option instead of a tiny clear (×) button
const AUTO = '__auto';
const TYPES = (Object.keys(TYPE_LABEL) as EncounterType[]).map((k) => ({ value: k, label: TYPE_LABEL[k] }));

const ageOf = (dob: string) => Math.floor((Date.now() - new Date(dob).getTime()) / 31_557_600_000);

/** Small caption inside a chip, so chips need no separate labels. */
const caption = (text: string) => <Text size="xs" fw={600} c="dimmed">{text}</Text>;

/** One labelled fact: a small caption over its value. */
function Fact({ label, children }: { label: string; children: ReactNode }) {
  return (
    <Stack gap="xs">
      <Text size="xs" fw={600} c="dimmed" tt="uppercase">{label}</Text>
      {children}
    </Stack>
  );
}

/**
 * Patient strip. Picking a patient fills everything in. The visit and device chips are the same choices
 * as before, shown as values rather than empty fields, and only open when clicked.
 * Start, Stop and Resume sit at the right of the top row, and the whole screen is one fixed page, so they
 * are always in view.
 */
export function SessionBar() {
  const { state, dispatch, patient, effectiveType } = useEncounter();
  const { phase } = state;
  const locked = phase === 'ended' || phase === 'finalized';
  const last = patient?.encounters[0];

  return (
    <Card>
      <Stack gap="md">
        <Group align="center" justify="space-between" gap="md" wrap="wrap">
          <Group gap="sm" wrap="wrap">
            <Select
              aria-label="Patient"
              w={tokens.chip.patient}
              variant="filled"
              radius="xl"
              placeholder="Select patient"
              searchable
              styles={{ input: { cursor: 'default' } }}
              leftSection={caption('Patient')}
              leftSectionWidth={tokens.chip.captionW}
              leftSectionPointerEvents="none"
              disabled={phase !== 'idle'}
              data={patients.map((p) => ({ value: p.id, label: p.name }))}
              value={state.patientId}
              onChange={(v) => dispatch({ t: 'setPatient', id: v })}
            />
            {patient && (
              <>
                <Select
                  aria-label="Encounter type"
                  w={tokens.chip.type}
                  variant="filled"
                  radius="xl"
                  allowDeselect={false}
                  styles={{ input: { cursor: 'default' } }}
                  leftSection={caption('Encounter')}
                  leftSectionWidth={tokens.chip.captionW}
                  leftSectionPointerEvents="none"
                  disabled={locked}
                  data={[{ value: AUTO, label: `Auto · ${TYPE_LABEL[effectiveType]}` }, ...TYPES]}
                  value={state.type ?? AUTO}
                  onChange={(v) => dispatch({ t: 'setType', type: v === AUTO ? null : (v as EncounterType) })}
                />
                {/* Long real-world catalog, so this one is searchable (the 3 types are not) */}
                <Select
                  aria-label="Device being evaluated"
                  w={tokens.chip.device}
                  variant="filled"
                  radius="xl"
                  searchable
                  styles={{ input: { cursor: 'default' } }}
                  nothingFoundMessage="No matching device"
                  allowDeselect={false}
                  placeholder="Not specified"
                  leftSection={caption('Device')}
                  leftSectionWidth={tokens.chip.captionW}
                  leftSectionPointerEvents="none"
                  disabled={locked}
                  data={[{ value: AUTO, label: 'Not specified' }, ...DEVICES]}
                  value={state.device ?? AUTO}
                  onChange={(v) => dispatch({ t: 'setDevice', device: v === AUTO ? null : v })}
                />
              </>
            )}
          </Group>

          <Box flex="none" ml="auto">
            {phase === 'idle' ? (
              <Button disabled={!patient} leftSection={<IconMicrophone size={tokens.icon.md} />} onClick={() => dispatch({ t: 'start' })}>
                Start recording
              </Button>
            ) : (
              <RecordingControls />
            )}
          </Box>
        </Group>

        {/* Three separate facts, each with its own caption, instead of one run-on sentence */}
        {patient && (
          <Group gap="xl" align="flex-start" wrap="wrap">
            <Fact label="Age">
              <Text size="sm" fw={600}>{ageOf(patient.dob)} yrs</Text>
            </Fact>
            <Fact label="Referral">
              {patient.diagnosis
                ? <Text size="sm" fw={600}>{patient.diagnosis}</Text>
                : <Badge color="amber">Not on referral</Badge>}
            </Fact>
            <Fact label="Last visit">
              <Text size="sm" fw={600}>{last ? last.date : 'First visit'}</Text>
            </Fact>
          </Group>
        )}

        {state.micIssue && (
          <Alert color="amber" icon={<IconMicrophoneOff size={tokens.icon.md} />} title="Can't hear audio" py="sm">
            <Group justify="space-between">
              <Text size="sm">Check the microphone. The clock is stopped until audio returns.</Text>
              <Button variant="default" onClick={() => dispatch({ t: 'setMic', issue: false })}>Retry</Button>
            </Group>
          </Alert>
        )}
      </Stack>
    </Card>
  );
}
