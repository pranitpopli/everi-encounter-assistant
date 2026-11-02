import { Box, Group, Modal, Stack, Title } from '@mantine/core';
import { useMediaQuery } from '@mantine/hooks';
import { notifications } from '@mantine/notifications';
import { useEffect, useState } from 'react';
import { CapturePanel } from '../components/CapturePanel';
import { SaveMenu } from '../components/SaveMenu';
import { SessionBar } from '../components/SessionBar';
import { TemplatePanel } from '../components/TemplatePanel';
import { TranscriptPanel } from '../components/TranscriptPanel';
import { LAYER2_DELAY_MS, TICK_MS } from '../constants';
import { useEncounter, type SaveKind } from '../state/encounterStore';
import { tokens } from '../theme';

const WIDE = tokens.wideQuery; // transcript fits as a column

/** AI Transcription: one fixed screen, everything in place. It never scrolls. */
export function TranscriptionPage() {
  const { state, dispatch, revealed, noteLines, items } = useEncounter();
  const wide = useMediaQuery(WIDE, window.matchMedia(WIDE).matches) ?? false;
  // The transcript opens ONLY from a source/provenance button (or the rail icon).
  const [transcriptOpen, setTranscriptOpen] = useState(false);
  const [highlight, setHighlight] = useState<string[]>([]);
  // The template opens as a dialog over a dimmed page, for reading and editing at length
  const [expanded, setExpanded] = useState(false);

  // Mock recording clock
  useEffect(() => {
    if (state.phase !== 'recording') return;
    const id = window.setInterval(() => dispatch({ t: 'tick' }), TICK_MS);
    return () => window.clearInterval(id);
  }, [state.phase, dispatch]);

  // "Reviewing the last few minutes…" after Stop
  useEffect(() => {
    if (!state.reviewing) return;
    const id = window.setTimeout(() => dispatch({ t: 'reviewDone' }), LAYER2_DELAY_MS);
    return () => window.clearTimeout(id);
  }, [state.reviewing, dispatch]);

  // New session: clear selections
  useEffect(() => {
    if (state.phase === 'idle') { setHighlight([]); setExpanded(false); }
  }, [state.phase, state.patientId]);

  const showSources = (ids: string[]) => {
    setHighlight(ids);
    setTranscriptOpen(true);
  };
  // The transcript is hidden behind the popup, so jumping to a source leaves it.
  const viewSources = (ids: string[]) => {
    setExpanded(false);
    showSources(ids);
  };

  const save = (kind: SaveKind) => {
    dispatch({ t: 'save', kind });
    const msg = {
      session: `Session saved: transcript (${revealed.length} lines), note (${noteLines.length} lines), capture list (${items.length} items).`,
      transcript: `Transcript saved (${revealed.length} lines).`,
      note: `Generated note saved (${noteLines.length} lines).`,
    }[kind];
    notifications.show({ message: msg, color: 'green.7' });
  };

  return (
    <Stack h="100%" gap="md" p="lg">
      <Group justify="space-between">
        <Title order={1}>AI Transcription</Title>
        <SaveMenu onSave={save} />
      </Group>
      <SessionBar />
      <Group flex={1} mih={0} align="stretch" gap="md" wrap="nowrap">
        <Box flex={5} miw={0} mih={0}>
          <CapturePanel onViewSources={showSources} />
        </Box>
        {/* Only one copy of the template exists at a time: inline, or in the popup */}
        <Box flex={7} miw={0} mih={0}>
          {!expanded && (
            <TemplatePanel expanded={false} onToggleExpand={() => setExpanded(true)} onViewSources={showSources} onSave={() => save('note')} />
          )}
        </Box>
        <TranscriptPanel
          open={transcriptOpen}
          inline={wide}
          highlight={highlight}
          onToggle={() => setTranscriptOpen((v) => !v)}
          onSave={() => save('transcript')}
        />
      </Group>

      {/* A centered dialog over a dark-tinted page. Click outside or press Esc to close. */}
      <Modal.Root opened={expanded} onClose={() => setExpanded(false)} size={tokens.modalW} centered transitionProps={{ transition: 'fade', duration: 150 }}>
        <Modal.Overlay backgroundOpacity={0.55} />
        <Modal.Content aria-label="Generated template" radius="lg">
          <Modal.Body p={0}>
            <Box h="86dvh">
              <TemplatePanel expanded onToggleExpand={() => setExpanded(false)} onViewSources={viewSources} onSave={() => save('note')} />
            </Box>
          </Modal.Body>
        </Modal.Content>
      </Modal.Root>
    </Stack>
  );
}
