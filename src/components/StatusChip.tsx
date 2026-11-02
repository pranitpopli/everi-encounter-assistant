import { Badge, Text } from '@mantine/core';
import type { NoteStatus } from '../types';

/**
 * Status of a template field. The default state (AI wrote it, nobody has reviewed it) is plain text so
 * ten of them in a row don't shout; the states that need attention or show trust get a badge.
 */
export function NoteStatusBadge({ status }: { status: NoteStatus; edited?: boolean }) {
  switch (status) {
    case 'confirmed':
      // The clinician wrote or edited it. The absence of "AI-inferred" says enough.
      return null;
    case 'from_checkpoint':
      return <Badge color="green" variant="outline">Clinician answer</Badge>;
    case 'open_gap':
      return <Badge color="amber" variant="light">Needs answer</Badge>;
    default:
      return <Text size="xs" c="dimmed">AI-inferred</Text>;
  }
}
