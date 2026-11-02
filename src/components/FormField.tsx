import { ActionIcon, Badge, Button, Group, Menu, Select, Stack, Text, Textarea, TextInput, Tooltip } from '@mantine/core';
import { IconDots, IconRefresh } from '@tabler/icons-react';
import { useEffect, useState } from 'react';
import { tokens } from '../theme';
import type { FieldView } from '../types';
import { SourceTime } from './SourceTime';
import { NoteStatusBadge } from './StatusChip';

interface Props {
  field: FieldView;
  /** Template has been filled from the transcript (changes the empty-state hint) */
  filled: boolean;
  /** Marked Not applicable: it stops counting as missing */
  skipped: boolean;
  /** Why it was marked automatically, if it was */
  skipNote?: string;
  /** Briefly highlighted after the attention arrows jump here */
  flash: boolean;
  /** The ONLY thing that opens the transcript panel */
  onViewSources: () => void;
  onEdit: (text: string) => void;
  onSkip: () => void;
  onUnskip: () => void;
  /** Rewrite this one field from the transcript (undefined = this field can't come from the transcript) */
  onRefill?: () => void;
  canRefill: boolean;
}

/** One labelled, editable template field with its provenance underneath. */
export function FormField({ field, filled, skipped, skipNote, flash, onViewSources, onEdit, onSkip, onUnskip, onRefill, canRefill }: Props) {
  const [draft, setDraft] = useState(field.text);
  useEffect(() => setDraft(field.text), [field.text]);
  const n = field.sourceLineIds.length;

  // Typing is free. Leaving the field commits it, and an edited field counts as confirmed by the clinician.
  const commit = () => {
    const t = draft.trim();
    if (!t) { setDraft(field.text); return; }
    if (t !== field.text) onEdit(t);
  };

  // Required fields can't be skipped, and neither can pick-lists
  const canSkip = filled && field.empty && !field.required && !field.options && !skipped;
  const placeholder = skipped ? 'Not applicable' : field.placeholder ?? (filled ? 'Not mentioned. Type to add.' : 'Fills from the transcript');
  const skipMenu = canSkip ? (
    <Menu position="bottom-end" withinPortal>
      <Menu.Target>
        <ActionIcon size="sm" color="everiSlate" aria-label={`More options for ${field.label}`}>
          <IconDots size={tokens.icon.sm} />
        </ActionIcon>
      </Menu.Target>
      <Menu.Dropdown>
        <Menu.Item onClick={onSkip}>Not applicable</Menu.Item>
      </Menu.Dropdown>
    </Menu>
  ) : undefined;

  // A very soft icon on the right of every free-text field: rewrite just this field from the transcript
  const refill = onRefill && filled && !skipped ? (
    <Tooltip label={canRefill ? 'Update this field from the transcript' : 'Nothing in the transcript for this yet'}>
      <ActionIcon
        size="sm"
        variant="subtle"
        color="everiSlate.5"
        aria-label={`Update ${field.label} from the transcript`}
        disabled={!canRefill}
        onClick={onRefill}
      >
        <IconRefresh size={tokens.icon.sm} stroke={1.5} />
      </ActionIcon>
    </Tooltip>
  ) : undefined;
  const right = refill || skipMenu ? <Group gap={0} wrap="nowrap">{refill}{skipMenu}</Group> : undefined;
  const rightW = refill && skipMenu ? tokens.fieldActionsW : undefined;

  return (
    <Stack id={`field-${field.id}`} gap="sm" p="xs" bg={flash ? 'amber.0' : undefined} bdrs="sm">
      {field.options ? (
        <Select
          label={field.label}
          placeholder={placeholder}
          data={field.options}
          searchable
          allowDeselect={false}
          value={field.text || null}
          onChange={(v) => v && onEdit(v)}
        />
      ) : field.span !== 12 ? (
        <TextInput
          label={field.label}
          placeholder={placeholder}
          variant="default"
          disabled={skipped}
          value={draft}
          rightSection={right}
          rightSectionWidth={rightW}
          onChange={(e) => setDraft(e.currentTarget.value)}
          onBlur={commit}
          onKeyDown={(e) => { if (e.key === 'Enter') e.currentTarget.blur(); }}
        />
      ) : (
        <Textarea
          label={field.label}
          placeholder={placeholder}
          variant="default"
          disabled={skipped}
          value={draft}
          rightSection={right}
          rightSectionWidth={rightW}
          autosize
          minRows={1}
          maxRows={6}
          onChange={(e) => setDraft(e.currentTarget.value)}
          onBlur={commit}
        />
      )}

      {skipped && (
        <Group gap="sm">
          <Badge color="everiSlate" variant="light">Not applicable</Badge>
          {skipNote && <Text size="xs" c="dimmed">{skipNote}</Text>}
          <Button size="compact-sm" variant="subtle" onClick={onUnskip}>Undo</Button>
        </Group>
      )}
      {field.empty && !skipped && (field.required || field.carryNote) && (
        <Group gap="sm" wrap="wrap">
          {field.required && <Text size="xs" fw={600} c="amber.8">Required</Text>}
          {field.carryNote && <Text size="xs" c="amber.8">{field.carryNote}</Text>}
        </Group>
      )}
      {!field.empty && (
        <Group gap="sm" wrap="wrap">
          <NoteStatusBadge status={field.status} edited={field.edited} />
          {n > 0 && <SourceTime ids={field.sourceLineIds} label={field.label} onOpen={onViewSources} />}
          {field.kept && <Text size="xs" c="green.8">kept your edit</Text>}
        </Group>
      )}
    </Stack>
  );
}
