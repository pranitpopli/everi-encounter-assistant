import { Box, Button, Card, Group, Select, Stack, Text, Textarea, Tooltip } from '@mantine/core';
import { IconCircleCheckFilled, IconCircleDashed, IconMicrophone } from '@tabler/icons-react';
import { useEffect, useRef, useState } from 'react';
import { VOICE_DELAY_MS } from '../constants';
import { useEncounter } from '../state/encounterStore';
import { tokens } from '../theme';
import type { CaptureItem as Item, GapStatus } from '../types';
import { SourceTime } from './SourceTime';

interface Props {
  item: Item;
  ended: boolean;
  /** The ONLY way to jump from the capture list to the transcript, and only for transcript-derived items */
  onViewSources: (ids: string[]) => void;
  onChange: (status: GapStatus, answer?: string) => void;
}

const RESOLVED_LABEL: Partial<Record<GapStatus, string>> = {
  later: 'Saved for later',
  not_relevant: 'Not relevant',
};

/** Status icon, not a checkbox: there is nothing to tick. The conversation or an answer sets it. */
function StatusCheck({ item, done }: { item: Item; done: boolean }) {
  return (
    <Box role="img" aria-label={`${item.label}: ${done ? 'captured' : 'not captured yet'}`} c={done ? 'green.7' : 'everiSlate.5'} lh={0} flex="none">
      {done ? <IconCircleCheckFilled size={tokens.icon.md} /> : <IconCircleDashed size={tokens.icon.md} />}
    </Box>
  );
}

/** Timestamp of where the transcript produced this item. Requirements nobody has mentioned have none. */
function Provenance({ item, onViewSources }: Pick<Props, 'item' | 'onViewSources'>) {
  // flex none: a long question must never squeeze the timestamp
  return <Box flex="none"><SourceTime ids={item.evidenceLineIds} label={item.label} onOpen={() => onViewSources(item.evidenceLineIds)} /></Box>;
}

export function CaptureItem(props: Props) {
  const { item, ended } = props;
  const resolving = ended && !item.captured && item.status === 'open';
  return resolving ? <ResolveCard {...props} /> : <CompactRow {...props} />;
}

/** Glanceable row: used during the visit and for captured/handled items after it. */
function CompactRow({ item, ended, onViewSources, onChange }: Props) {
  const resolvedLabel = ended ? RESOLVED_LABEL[item.status] : undefined;
  const answered = item.status === 'answered';
  const done = item.captured || answered;
  const asking = item.source === 'conversation' && !item.captured && item.status === 'open';
  const showDetail = asking || (item.source === 'history' && !done && item.sourceNote);
  return (
    <Stack gap="xs" py="sm" px="sm">
      <Group justify="space-between" wrap="nowrap">
        <Group gap="sm" wrap="nowrap" miw={0}>
          <StatusCheck item={item} done={done} />
          {/* Done items recede, so what still needs attention stands out */}
          <Text size="sm" fw={done ? 400 : 600} c={done || item.status === 'not_relevant' ? 'dimmed' : undefined}>{item.label}</Text>
        </Group>
        <Provenance item={item} onViewSources={onViewSources} />
      </Group>
      {(showDetail || answered || resolvedLabel) && (
        <Stack gap="xs" pl={tokens.checkIndent}>
          {asking && <Text size="sm" c="dimmed">{item.question}</Text>}
          {item.source === 'history' && !done && item.sourceNote && <Text size="sm" c="dimmed">{item.sourceNote}</Text>}
          {(answered || resolvedLabel) && (
            <Group gap="sm">
              <Text size="sm" c={answered ? undefined : 'dimmed'}>{answered ? item.answer : resolvedLabel}</Text>
              {ended && <Button size="compact-sm" variant="subtle" onClick={() => onChange('open')}>Undo</Button>}
            </Group>
          )}
        </Stack>
      )}
    </Stack>
  );
}

/** "Before they leave": answer in seconds while the patient is still in the room. */
function ResolveCard({ item, onViewSources, onChange }: Props) {
  const { transcript } = useEncounter();
  const [draft, setDraft] = useState(item.answer ?? '');
  const [listening, setListening] = useState(false);
  const timer = useRef<number | undefined>(undefined);
  useEffect(() => () => window.clearTimeout(timer.current), []);
  // What was actually said, so the clinician rarely needs to open the transcript at all
  const evidence = transcript.find((l) => l.id === item.evidenceLineIds[0]);

  const startVoice = () => {
    setListening(true);
    timer.current = window.setTimeout(() => { setDraft(item.voiceAnswer); setListening(false); }, VOICE_DELAY_MS);
  };

  return (
    <Card padding="md" bg="white" radius="sm">
      <Stack gap="sm">
        <Group justify="space-between" wrap="nowrap" align="flex-start">
          <Group gap="sm" wrap="nowrap" align="flex-start" miw={0}>
            <Box pt="calc(var(--mantine-spacing-xs) / 2)"><StatusCheck item={item} done={false} /></Box>
            <Text fw={600}>{item.question}</Text>
          </Group>
          <Provenance item={item} onViewSources={onViewSources} />
        </Group>

        <Stack gap="sm" pl={tokens.checkIndent}>
          <Text size="sm" c="dimmed">{item.why}</Text>
          {evidence && <Text size="sm" c="dimmed" fs="italic">{evidence.text}</Text>}

          {item.answerType === 'coded' ? (
            <Select
              aria-label={`Answer: ${item.label}`}
              placeholder="Choose an answer"
              data={item.options}
              value={draft || null}
              onChange={(v) => setDraft(v ?? '')}
              allowDeselect={false}
            />
          ) : (
            <Group align="flex-start" wrap="nowrap" gap="sm">
              <Textarea
                flex={1}
                aria-label={`Answer: ${item.label}`}
                placeholder={listening ? 'Listening…' : 'Type or use the mic'}
                autosize
                minRows={1}
                value={draft}
                onChange={(e) => setDraft(e.currentTarget.value)}
              />
              <Tooltip label={listening ? 'Listening…' : 'Answer by voice'}>
                <Button variant="light" loading={listening} onClick={startVoice} aria-label="Answer by voice" px="sm">
                  <IconMicrophone size={tokens.icon.md} />
                </Button>
              </Tooltip>
            </Group>
          )}

          <Group gap="sm">
            <Button size="xs" disabled={!draft.trim()} onClick={() => onChange('answered', draft.trim())}>Add to note</Button>
            <Tooltip label="Handle it after the visit. Saved as a follow-up question on the note.">
              <Button size="xs" variant="default" onClick={() => onChange('later')}>Later</Button>
            </Tooltip>
            <Tooltip label="The AI was wrong. Don't ask again.">
              <Button size="xs" variant="subtle" color="everiSlate" onClick={() => onChange('not_relevant')}>Not relevant</Button>
            </Tooltip>
          </Group>
        </Stack>
      </Stack>
    </Card>
  );
}
