import { Button, Tooltip } from '@mantine/core';
import { fmtClock } from '../constants';
import { useEncounter } from '../state/encounterStore';

/**
 * Provenance as a timestamp: "2:00" means the AI got this from the conversation at 2:00.
 * Clicking it opens the transcript at that moment. Only used for things the transcript produced.
 */
export function SourceTime({ ids, label, onOpen }: { ids: string[]; label: string; onOpen: () => void }) {
  const { transcript } = useEncounter();
  const times = ids
    .map((id) => transcript.find((l) => l.id === id)?.tSec)
    .filter((t): t is number => t !== undefined)
    .sort((a, b) => a - b);
  if (!times.length) return null;
  const text = times.slice(0, 2).map(fmtClock).join(' · ') + (times.length > 2 ? ` +${times.length - 2}` : '');
  return (
    <Tooltip label="Jump to this moment in the transcript">
      <Button
        size="compact-sm"
        variant="subtle"
        color="everiBlue"
        aria-label={`View source at ${text} for ${label} in the transcript`}
        onClick={onOpen}
      >
        {text}
      </Button>
    </Tooltip>
  );
}
