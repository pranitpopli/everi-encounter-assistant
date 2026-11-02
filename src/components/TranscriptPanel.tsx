import { ActionIcon, Box, Card, Divider, Drawer, Group, Highlight, ScrollArea, Stack, Text, TextInput, Title, Tooltip } from '@mantine/core';
import { IconDeviceFloppy, IconLayoutSidebarRightCollapse, IconMessages, IconSearch, IconX } from '@tabler/icons-react';
import { useEffect, useState } from 'react';
import { fmtClock } from '../constants';
import { useEncounter } from '../state/encounterStore';
import { tokens } from '../theme';
import classes from './TranscriptRail.module.css';

const time = (ms: number) => new Date(ms).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });

interface Props {
  open: boolean;
  inline: boolean; // wide screens: a column; narrow screens: a non-modal side sheet
  highlight: string[];
  onToggle: () => void;
  onSave: () => void;
}

function Body({ highlight, onToggle, onSave }: Omit<Props, 'open' | 'inline'>) {
  const { state, revealed } = useEncounter();
  const [query, setQuery] = useState('');
  const hi = new Set(highlight);
  const q = query.trim();
  const shown = q ? revealed.filter((l) => l.text.toLowerCase().includes(q.toLowerCase())) : revealed;
  const first = highlight.find((id) => shown.some((l) => l.id === id));

  // Jumping to a source clears any search so the source line is visible
  useEffect(() => { if (highlight.length) setQuery(''); }, [highlight]);

  useEffect(() => {
    if (first) document.getElementById(`tx-${first}`)?.scrollIntoView({ block: 'center', behavior: 'smooth' });
  }, [first, highlight]);

  // Keep the newest line in view while recording (unless tracing a source or searching)
  const lastId = revealed[revealed.length - 1]?.id;
  useEffect(() => {
    if (!first && !q && lastId && state.phase === 'recording') document.getElementById(`tx-${lastId}`)?.scrollIntoView({ block: 'end' });
  }, [lastId, first, q, state.phase]);

  return (
    <Stack h="100%" gap={0}>
      <Group h={tokens.panelHeader} px="md" justify="space-between" wrap="nowrap" flex="none">
        <Group gap="sm">
          <IconMessages size={tokens.icon.md} color="var(--mantine-color-everiBlue-6)" />
          <Title order={4}>Live Transcript</Title>
        </Group>
        <Group gap={0} wrap="nowrap">
          {state.saved.transcript && <Text size="xs" c="green.8" mr="sm">Saved {time(state.saved.transcript)}</Text>}
          <Tooltip label="Save transcript">
            <ActionIcon color="everiSlate" aria-label="Save transcript" disabled={!revealed.length} onClick={onSave}>
              <IconDeviceFloppy size={tokens.icon.md} />
            </ActionIcon>
          </Tooltip>
          <Tooltip label="Collapse transcript">
            <ActionIcon color="everiSlate" aria-label="Collapse transcript" onClick={onToggle}>
              <IconLayoutSidebarRightCollapse size={tokens.icon.md} />
            </ActionIcon>
          </Tooltip>
        </Group>
      </Group>
      <Divider />
      <Box p="sm" flex="none">
        <TextInput
          aria-label="Search transcript"
          placeholder="Search transcript"
          leftSection={<IconSearch size={tokens.icon.md} />}
          rightSection={q ? (
            <ActionIcon color="everiSlate" size="sm" aria-label="Clear search" onClick={() => setQuery('')}>
              <IconX size={tokens.icon.sm} />
            </ActionIcon>
          ) : undefined}
          value={query}
          onChange={(e) => setQuery(e.currentTarget.value)}
        />
      </Box>
      <Divider />
      <Box flex={1} mih={0}>
        <ScrollArea h="100%" type="auto" viewportProps={{ tabIndex: 0, 'aria-label': 'Transcript' }}>
          {revealed.length === 0 ? (
            <Stack align="center" justify="center" gap="sm" p="xl" mih="100%">
              <IconMessages size={tokens.icon.xl} color="var(--mantine-color-everiSlate-4)" />
              <Text c="dimmed" size="sm">Click Start Recording to begin</Text>
            </Stack>
          ) : shown.length === 0 ? (
            <Text c="dimmed" size="sm" p="md">No lines match your search.</Text>
          ) : (
            <Stack gap={0} p="sm" aria-live="polite">
              {shown.map((l) => (
                <Group
                  key={l.id}
                  id={`tx-${l.id}`}
                  wrap="nowrap"
                  align="flex-start"
                  p="sm"
                  bdrs="sm"
                  bg={hi.has(l.id) ? 'amber.0' : undefined}
                  bd={hi.has(l.id) ? tokens.border.amber : tokens.border.none}
                >
                  <Text size="xs" c="dimmed" w={tokens.stampW} flex="none">{fmtClock(l.tSec)}</Text>
                  <Stack gap={0} flex={1}>
                    <Text size="xs" fw={600} c={l.speaker === 'Clinician' ? 'everiBlue.7' : 'dimmed'}>{l.speaker}</Text>
                    <Highlight size="sm" highlight={q} c={hi.size && !hi.has(l.id) ? 'dimmed' : undefined}>{l.text}</Highlight>
                  </Stack>
                </Group>
              ))}
            </Stack>
          )}
        </ScrollArea>
      </Box>
    </Stack>
  );
}

export function TranscriptPanel(props: Props) {
  const { open, inline, onToggle } = props;
  const { state, revealed } = useEncounter();
  // A soft glow while lines are actually arriving, so it is clear that is where the transcript is kept
  const listening = state.phase === 'recording' && !state.micIssue;

  const rail = (
    <Card w={tokens.rail} h="100%" padding="xs" flex="none">
      <Stack align="center" gap="sm">
        <Tooltip label={listening ? 'Live transcript: lines appear here. Click to open.' : 'Open live transcript'} position="left">
          <ActionIcon
            color="everiBlue"
            variant="light"
            className={listening ? classes.glow : undefined}
            aria-label="Open live transcript"
            onClick={onToggle}
          >
            <IconMessages size={tokens.icon.md} />
          </ActionIcon>
        </Tooltip>
        <Text size="xs" c="dimmed" ta="center">{revealed.length}</Text>
      </Stack>
    </Card>
  );

  if (inline) {
    return open
      ? <Card w={tokens.transcriptW} h="100%" padding={0} flex="none"><Body {...props} /></Card>
      : rail;
  }
  return (
    <>
      {rail}
      <Drawer
        opened={open}
        onClose={onToggle}
        position="right"
        size={tokens.transcriptW}
        withOverlay={false}
        withCloseButton={false}
        trapFocus={false}
        lockScroll={false}
        closeOnClickOutside={false}
        shadow="lg"
        padding={0}
      >
        <Box h="100dvh"><Body {...props} /></Box>
      </Drawer>
    </>
  );
}
