import { ActionIcon, Anchor, Box, Button, Card, Checkbox, Divider, Grid, Group, Paper, ScrollArea, Select, Skeleton, Stack, Text, ThemeIcon, Title, Tooltip } from '@mantine/core';
import { IconArrowsMaximize, IconArrowsMinimize, IconCheck, IconChevronLeft, IconChevronRight, IconDeviceFloppy, IconSparkles } from '@tabler/icons-react';
import { useEffect, useState } from 'react';
import { TYPE_LABEL } from '../data/checklists';
import { TEMPLATE_OPTIONS, templateDef, type TemplateId } from '../data/mockNote';
import { useEncounter } from '../state/encounterStore';
import { tokens } from '../theme';
import { FormField } from './FormField';

const STREAM_MS = 110;
const FLASH_MS = 1600;
const time = (ms: number) => new Date(ms).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
const today = new Date().toLocaleDateString([], { day: 'numeric', month: 'short', year: 'numeric' });

interface Props {
  expanded: boolean;
  onToggleExpand: () => void;
  /** The only action here that opens the transcript panel */
  onViewSources: (sources: string[]) => void;
  onSave: () => void;
}

export function TemplatePanel({ expanded, onToggleExpand, onViewSources, onSave }: Props) {
  const { state, dispatch, patient, effectiveType, transcript, revealed, fields, noteLines, skipped, skipNotes, refillable, streaming } = useEncounter();
  const [signed, setSigned] = useState(false);
  const [navIdx, setNavIdx] = useState(-1);
  const [flashId, setFlashId] = useState<string | null>(null);
  const tpl = state.template;
  const finalized = state.phase === 'finalized';
  const ended = state.phase === 'ended' || finalized;

  // The selected template is ALWAYS on screen, as a form. Generated values only show for the template they belong to.
  const def = templateDef(state.templateId, transcript);
  const filled = !!tpl && tpl.id === state.templateId;

  // Stream generated values in one field at a time
  useEffect(() => {
    if (!tpl || tpl.visible >= tpl.lines.length) return;
    const id = window.setTimeout(() => dispatch({ t: 'streamStep' }), STREAM_MS);
    return () => window.clearTimeout(id);
  }, [tpl, dispatch]);

  // Point at where the latest answer landed: scroll to that field and highlight it
  useEffect(() => {
    if (!state.lastAdded) return;
    const { id } = state.lastAdded;
    let tries = 0;
    const timer = window.setInterval(() => {
      const el = document.getElementById(`field-${id}`);
      if (!el && ++tries <= 15) return; // the field appears once the note has finished writing
      window.clearInterval(timer);
      if (!el) return;
      el.scrollIntoView({ block: 'center', behavior: 'smooth' });
      setFlashId(id);
      window.setTimeout(() => setFlashId((cur) => (cur === id ? null : cur)), FLASH_MS);
    }, 200);
    return () => window.clearInterval(timer);
  }, [state.lastAdded]);

  const words = noteLines.reduce((n, l) => n + l.text.split(/\s+/).filter(Boolean).length, 0);
  const needAnswer = noteLines.filter((l) => l.status === 'open_gap');

  // Fields that need attention: still empty (and not marked Not applicable), or waiting on an answer
  const attention = fields.filter((f) => (f.empty && !skipped[f.id]) || f.status === 'open_gap').map((f) => f.id);
  useEffect(() => { if (navIdx >= attention.length) setNavIdx(-1); }, [attention.length, navIdx]);

  // Required fields (and high-priority open questions) are what the sign-off warns about
  const requiredOpen =
    fields.filter((f) => f.required && f.empty && !skipped[f.id]).length +
    needAnswer.filter((l) => l.risk === 'high').length;

  const flash = (id: string) => {
    setFlashId(id);
    window.setTimeout(() => setFlashId((cur) => (cur === id ? null : cur)), FLASH_MS);
  };

  const go = (dir: 1 | -1) => {
    if (!attention.length) return;
    const next = navIdx === -1 ? (dir === 1 ? 0 : attention.length - 1) : (navIdx + dir + attention.length) % attention.length;
    setNavIdx(next);
    const id = attention[next];
    const el = document.getElementById(`field-${id}`);
    el?.scrollIntoView({ block: 'center', behavior: 'smooth' });
    el?.querySelector<HTMLElement>('textarea, input:not([role="combobox"])')?.focus({ preventScroll: true });
    setFlashId(id);
    window.setTimeout(() => setFlashId((cur) => (cur === id ? null : cur)), FLASH_MS);
  };

  const canFill = revealed.length > 0 && !finalized;
  const generatedText = filled && tpl
    ? `Generated ${time(tpl.generatedAt)} from ${tpl.sourceCount} transcript ${tpl.sourceCount === 1 ? 'line' : 'lines'}${state.phase === 'recording' ? ' so far' : ''}`
    : null;

  const picker = (
    <Group gap="sm" wrap="nowrap" flex={1} maw={expanded ? tokens.toolbarW : undefined}>
      <Select
        flex={1}
        aria-label="Template"
        data={TEMPLATE_OPTIONS}
        value={state.templateId}
        allowDeselect={false}
        onChange={(v) => v && dispatch({ t: 'selectTemplate', id: v as TemplateId })}
      />
      <Tooltip label={canFill ? 'Keeps your edits' : 'Start recording first, so there is a transcript to fill from'} disabled={canFill && !filled}>
        <Box>
          <Button
            variant={filled ? 'light' : 'filled'}
            disabled={!canFill || streaming}
            leftSection={<IconSparkles size={tokens.icon.md} />}
            onClick={() => { setSigned(false); dispatch({ t: 'fillTemplate' }); }}
          >
            {filled ? 'Update from transcript' : 'Fill from transcript'}
          </Button>
        </Box>
      </Tooltip>
    </Group>
  );

  return (
    <Card h="100%" padding={0}>
      <Stack h="100%" gap={0}>
        <Group h={tokens.panelHeader} px="md" justify="space-between" wrap="nowrap" flex="none">
          <Group gap="sm">
            <IconSparkles size={tokens.icon.md} color="var(--mantine-color-everiBlue-6)" />
            <Title order={4}>Generated Template</Title>
          </Group>
          {expanded && !finalized && picker}
          <Group gap="sm" wrap="nowrap">
            <Tooltip label={generatedText ?? 'Not generated yet'}>
              <Text size="xs" c="dimmed" tabIndex={0}>{words} words</Text>
            </Tooltip>
            {state.saved.note && <Text size="xs" c="green.8">Saved {time(state.saved.note)}</Text>}
            <Tooltip label={expanded ? 'Collapse template' : 'Expand template'}>
              <ActionIcon color="everiSlate" aria-label={expanded ? 'Collapse template' : 'Expand template'} aria-pressed={expanded} onClick={onToggleExpand}>
                {expanded ? <IconArrowsMinimize size={tokens.icon.md} /> : <IconArrowsMaximize size={tokens.icon.md} />}
              </ActionIcon>
            </Tooltip>
            <Tooltip label="Save generated note">
              <ActionIcon color="everiSlate" aria-label="Save generated note" disabled={!noteLines.length} onClick={onSave}>
                <IconDeviceFloppy size={tokens.icon.md} />
              </ActionIcon>
            </Tooltip>
          </Group>
        </Group>
        <Divider />

        {/* Normal layout: its own row. Focus mode puts the same controls in the header, to save height. */}
        {!finalized && !expanded && (
          <Stack gap="sm" p="sm" flex="none">
            {picker}
            {generatedText && <Text size="xs" c="dimmed">{generatedText}</Text>}
          </Stack>
        )}
        {!finalized && !expanded && <Divider />}

        <Box flex={1} mih={0}>
          <ScrollArea h="100%" type="auto" viewportProps={{ tabIndex: 0, 'aria-label': 'Generated template' }}>
            {finalized ? (
              <Stack align="center" gap="md" p="xl">
                <ThemeIcon size={tokens.successIcon} radius="xl" color="green.7"><IconCheck size={tokens.icon.xl} /></ThemeIcon>
                <Title order={3}>Note ready</Title>
                <Text c="dimmed" ta="center" size="sm">
                  Signed off{requiredOpen ? ' with required fields still empty' : ''}.
                </Text>
                <Group>
                  <Button variant="default" onClick={() => dispatch({ t: 'reset' })}>Back to patients</Button>
                  <Button onClick={() => dispatch({ t: 'reset' })}>Start new encounter</Button>
                </Group>
              </Stack>
            ) : (
              <Stack gap="md" p="sm" maw={expanded ? tokens.docW : undefined} mx="auto">
                <Stack gap="sm" px="sm">
                  <Title order={3}>{def.label}</Title>
                  <Text size="sm" c="dimmed">
                    {[patient?.name ?? 'No patient selected', patient ? TYPE_LABEL[effectiveType] : null, state.device, today].filter(Boolean).join(' · ')}
                  </Text>
                  {def.sources.length > 0 && (
                    <Text size="xs" c="dimmed">
                      Sources:{' '}
                      {def.sources.map((s, i) => (
                        <span key={s.url + s.label}>
                          {i > 0 && ' · '}
                          <Anchor href={s.url} target="_blank" rel="noopener noreferrer" size="xs">{s.label}</Anchor>
                        </span>
                      ))}
                    </Text>
                  )}
                </Stack>

                {def.sections.map((section) => {
                  const inSection = fields.filter((f) => f.section === section.title);
                  if (!inSection.length) return null;
                  return (
                    <Paper key={section.title} bg="everiSlate.0" p="md" radius="sm">
                      <Stack gap="md">
                        <Title order={4}>{section.title}</Title>
                        <Grid gap="sm">
                          {inSection.map((f) => (
                            <Grid.Col key={`${f.id}-${tpl?.generatedAt}`} span={f.span}>
                              <FormField
                                field={f}
                                filled={filled}
                                skipped={!!skipped[f.id]}
                                skipNote={skipNotes[f.id]}
                                flash={flashId === f.id}
                                onViewSources={() => onViewSources(f.sourceLineIds)}
                                onEdit={(text) => dispatch({ t: 'editLine', id: f.id, text })}
                                onSkip={() => dispatch({ t: 'skipField', id: f.id })}
                                onUnskip={() => dispatch({ t: 'unskipField', id: f.id })}
                                // Clinician answers and pick-lists don't come from the transcript, so they have no update icon
                                onRefill={f.id.startsWith('c-') || f.options ? undefined : () => { dispatch({ t: 'refillField', id: f.id }); flash(f.id); }}
                                canRefill={refillable.has(f.id)}
                              />
                            </Grid.Col>
                          ))}
                        </Grid>
                      </Stack>
                    </Paper>
                  );
                })}
                {filled && streaming && (
                  <Stack gap="sm" aria-live="polite" px="sm">
                    <Skeleton h={tokens.skeleton.title} w="80%" />
                    <Skeleton h={tokens.skeleton.line} w="40%" />
                  </Stack>
                )}
              </Stack>
            )}
          </ScrollArea>
        </Box>

        {filled && !finalized && (
          <>
            <Divider />
            {/* One row when there is room (focus mode), two when there is not */}
            <Group justify="space-between" gap="md" p={expanded ? 'sm' : 'md'} wrap="wrap" flex="none">
              {/* Jump between what is missing, like a form that points at the next unanswered field */}
              <Group gap="md" wrap="nowrap">
                <Text size="sm" fw={600} aria-live="polite">
                  {attention.length
                    ? `${attention.length} ${attention.length === 1 ? 'field needs' : 'fields need'} attention`
                    : 'Nothing missing'}
                </Text>
                {attention.length > 0 && (
                  <Group gap="xs" wrap="nowrap">
                    <Tooltip label="Previous">
                      <ActionIcon color="everiSlate" aria-label="Previous field that needs attention" onClick={() => go(-1)}>
                        <IconChevronLeft size={tokens.icon.md} />
                      </ActionIcon>
                    </Tooltip>
                    <Text size="sm" c="dimmed" miw={tokens.stampW} ta="center">{navIdx >= 0 ? `${navIdx + 1} of ${attention.length}` : `${attention.length}`}</Text>
                    <Tooltip label="Next">
                      <ActionIcon color="everiSlate" aria-label="Next field that needs attention" onClick={() => go(1)}>
                        <IconChevronRight size={tokens.icon.md} />
                      </ActionIcon>
                    </Tooltip>
                  </Group>
                )}
              </Group>
              {/* Review is one honest sign-off, not a confirm button on every field */}
              <Group gap="md" wrap="nowrap">
                <Checkbox
                  checked={signed}
                  onChange={(e) => setSigned(e.currentTarget.checked)}
                  size="sm"
                  label={requiredOpen > 0
                    ? "I've reviewed this note, including the required fields still empty"
                    : "I've reviewed this note"}
                />
                <Tooltip label="Stop the recording first" disabled={ended}>
                  <Box>
                    <Button disabled={!ended || streaming || !signed} onClick={() => dispatch({ t: 'finalize' })}>
                      Finalize note
                    </Button>
                  </Box>
                </Tooltip>
              </Group>
            </Group>
          </>
        )}
      </Stack>
    </Card>
  );
}
