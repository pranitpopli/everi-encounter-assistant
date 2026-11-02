import { Box, Button, Group, Text } from '@mantine/core';
import { IconCircleCheck, IconPlayerPlay, IconPlayerStopFilled } from '@tabler/icons-react';
import { fmtClock, TIME_SCALE } from '../constants';
import { useEncounter } from '../state/encounterStore';
import { tokens } from '../theme';

/**
 * Recording status and the two controls: Stop, and Resume. One recording per visit, no pause.
 * Lives in the top bar, which never scrolls, so the clinician can always see that it is recording and stop it,
 * whatever they are looking at or however short the window is.
 */
export function RecordingControls() {
  const { state, dispatch } = useEncounter();
  const clock = fmtClock(state.elapsed * TIME_SCALE);

  if (state.phase === 'idle') return null;

  if (state.phase === 'recording') {
    return (
      <Group gap="md" wrap="nowrap">
        {/* Quiet and static: a red dot, the time, and the word. Nothing moves. */}
        <Group gap="sm" wrap="nowrap" aria-live="polite">
          <Box w={tokens.dot} h={tokens.dot} bdrs="50%" bg={state.micIssue ? 'everiSlate.4' : 'recordRed.6'} />
          <Text fw={600} aria-label="Session timer">{clock}</Text>
          <Text size="sm" c="dimmed">{state.micIssue ? 'No audio' : 'Recording'}</Text>
        </Group>
        {/* Red outline only, so it is findable without pulling focus from the content */}
        <Button
          variant="outline"
          color="recordRed.7"
          leftSection={<IconPlayerStopFilled size={tokens.icon.md} />}
          onClick={() => dispatch({ t: 'endVisit' })}
        >
          Stop
        </Button>
      </Group>
    );
  }

  return (
    <Group gap="md" wrap="nowrap">
      <Group gap="sm" wrap="nowrap">
        <IconCircleCheck size={tokens.icon.md} color="var(--mantine-color-green-7)" />
        <Text size="sm" fw={600}>Recording stopped · {clock}</Text>
      </Group>
      {/* Resume continues this same recording. After the note is finalized there is nothing to resume. */}
      {state.phase === 'ended' && (
        <Button variant="default" leftSection={<IconPlayerPlay size={tokens.icon.md} />} onClick={() => dispatch({ t: 'resume' })}>
          Resume recording
        </Button>
      )}
    </Group>
  );
}
