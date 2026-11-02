import { Button, Group, Menu, Text } from '@mantine/core';
import { IconChevronDown, IconDeviceFloppy, IconFileText, IconMessages, IconStack2 } from '@tabler/icons-react';
import { useEncounter, type SaveKind } from '../state/encounterStore';
import { tokens } from '../theme';

const time = (ms: number) => new Date(ms).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });

/** Save the whole session, or a single artifact. */
export function SaveMenu({ onSave }: { onSave: (k: SaveKind) => void }) {
  const { state, revealed, noteLines } = useEncounter();
  const hasTranscript = revealed.length > 0;
  const hasNote = noteLines.length > 0;
  return (
    <Group gap="sm" wrap="nowrap">
      {state.saved.session && <Text size="xs" c="green.8">Session saved {time(state.saved.session)}</Text>}
      <Button.Group>
        <Button variant="default" leftSection={<IconDeviceFloppy size={tokens.icon.md} />} disabled={!hasTranscript} onClick={() => onSave('session')}>
          Save session
        </Button>
        <Menu position="bottom-end" withinPortal>
          <Menu.Target>
            <Button variant="default" px="sm" aria-label="More save options" disabled={!hasTranscript}>
              <IconChevronDown size={tokens.icon.md} />
            </Button>
          </Menu.Target>
          <Menu.Dropdown>
            <Menu.Label>Save individually</Menu.Label>
            <Menu.Item leftSection={<IconStack2 size={tokens.icon.sm} />} onClick={() => onSave('session')}>
              Whole session (transcript, note, capture list)
            </Menu.Item>
            <Menu.Item leftSection={<IconMessages size={tokens.icon.sm} />} disabled={!hasTranscript} onClick={() => onSave('transcript')}>
              Transcript only
            </Menu.Item>
            <Menu.Item leftSection={<IconFileText size={tokens.icon.sm} />} disabled={!hasNote} onClick={() => onSave('note')}>
              Generated note only
            </Menu.Item>
          </Menu.Dropdown>
        </Menu>
      </Button.Group>
    </Group>
  );
}
