import { Box, Card, Divider, Group, Loader, Paper, RingProgress, ScrollArea, Skeleton, Stack, Text, Title } from '@mantine/core';
import { notifications } from '@mantine/notifications';
import { IconChecklist } from '@tabler/icons-react';
import { RISK_ORDER } from '../data/checklists';
import { templateDef } from '../data/mockNote';
import { useEncounter } from '../state/encounterStore';
import { tokens } from '../theme';
import { CaptureItem } from './CaptureItem';

interface Props { onViewSources: (ids: string[]) => void }

export function CapturePanel({ onViewSources }: Props) {
  const { state, dispatch, patient, items, pendingReview, transcript } = useEncounter();
  const ended = state.phase === 'ended' || state.phase === 'finalized';
  const captured = items.filter((i) => i.captured).length;
  const open = items.filter((i) => !i.captured && i.status === 'open');

  // During the visit: still-to-capture first, captured at the bottom.
  // After it: open items to resolve first, then everything handled.
  const active = items.filter((i) => (ended ? open.includes(i) : !i.captured)).sort((a, b) => RISK_ORDER[a.risk] - RISK_ORDER[b.risk]);
  const done = items.filter((i) => !active.includes(i));

  const noRequirements = state.templateId === 'clean';

  const row = (i: (typeof items)[number]) => (
    <CaptureItem
      key={i.id}
      item={i}
      ended={ended}
      onViewSources={onViewSources}
      onChange={(status, answer) => {
        dispatch({ t: 'item', id: i.id, status, answer });
        // Say where it went. The form also scrolls to the field and highlights it.
        if (status === 'answered') {
          notifications.show({ message: `Added to ${templateDef(state.templateId, transcript).place(i.id, i.section)}`, color: 'green.7' });
        }
      }}
    />
  );

  return (
    <Card h="100%" padding={0}>
      <Stack h="100%" gap={0}>
        <Group h={tokens.panelHeader} px="md" justify="space-between" wrap="nowrap" flex="none">
          <Group gap="sm">
            <IconChecklist size={tokens.icon.md} color="var(--mantine-color-everiBlue-6)" />
            <Title order={4}>{ended ? 'Before they leave' : 'What you need to capture'}</Title>
          </Group>
          {patient && !ended && (
            <Group gap="sm" wrap="nowrap">
              <RingProgress
                size={tokens.ring.size}
                thickness={tokens.ring.thickness}
                roundCaps
                rootColor="var(--mantine-color-everiSlate-1)"
                sections={[{ value: items.length ? (captured / items.length) * 100 : 0, color: 'green.6' }]}
              />
              <Text size="sm" fw={600} aria-label={`${captured} of ${items.length} captured`}>{captured}/{items.length}</Text>
            </Group>
          )}
          {ended && <Text size="sm" fw={600}>{open.length} {open.length === 1 ? 'question' : 'questions'} open</Text>}
        </Group>
        <Divider />

        <Box flex={1} mih={0}>
          <ScrollArea h="100%" type="auto" viewportProps={{ tabIndex: 0, 'aria-label': 'Capture list' }}>
            {!patient ? (
              <Text c="dimmed" size="sm" p="md">Select a patient to begin.</Text>
            ) : (
              <Stack gap="sm" p="sm">
                {noRequirements && <Text size="sm" c="dimmed" px="sm">No required fields for this template.</Text>}
                {active.map(row)}
                {pendingReview && (
                  <Stack gap="sm" p="sm" aria-live="polite">
                    <Group gap="sm"><Loader size="xs" /><Text size="sm" c="dimmed">Reviewing the last few minutes…</Text></Group>
                    <Skeleton h={tokens.skeleton.title} w="70%" />
                    <Skeleton h={tokens.skeleton.line} w="50%" />
                  </Stack>
                )}
                {ended && !pendingReview && open.length === 0 && (
                  <Paper p="md" bg="green.0" radius="sm"><Text size="sm">Nothing left to ask.</Text></Paper>
                )}
                {done.length > 0 && (
                  <>
                    <Text size="xs" fw={600} c="dimmed" tt="uppercase" px="sm" pt="sm">{ended ? 'Handled' : 'Captured'}</Text>
                    {done.map(row)}
                  </>
                )}
              </Stack>
            )}
          </ScrollArea>
        </Box>
      </Stack>
    </Card>
  );
}
