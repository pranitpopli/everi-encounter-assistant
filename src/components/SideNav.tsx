import { Box, Group, Image, NavLink, ScrollArea, Stack, Tooltip } from '@mantine/core';
import { notifications } from '@mantine/notifications';
import {
  IconClipboardCheck, IconFileCheck, IconFileText, IconGavel, IconLayoutGrid, IconMessageChatbot,
  IconMicrophone, IconUserPlus, IconUsers, type Icon,
} from '@tabler/icons-react';
import logoUrl from '../assets/everi-logo.svg';
import markUrl from '../assets/everi-mark.svg';
import { tokens } from '../theme';

// Same items and order as the current Everi Labs product menu
const NAV: { label: string; icon: Icon }[] = [
  { label: 'Home', icon: IconLayoutGrid },
  { label: 'Patients', icon: IconUsers },
  { label: 'Document Intake', icon: IconUserPlus },
  { label: 'AI Transcription', icon: IconMicrophone },
  { label: 'Documentation Templates', icon: IconFileText },
  { label: 'Claim Preparation', icon: IconFileCheck },
  { label: 'Audit Management', icon: IconClipboardCheck },
  { label: 'Appeal Management', icon: IconGavel },
  { label: 'ChatBot', icon: IconMessageChatbot },
];
const ACTIVE = 'AI Transcription';

export function SideNav({ collapsed }: { collapsed: boolean }) {
  return (
    <Stack h="100%" gap={0}>
      <Group h={tokens.header} justify="center" px="sm">
        {collapsed
          ? <Image src={markUrl} alt="Everi Labs" h={tokens.logo.mark} w="auto" />
          : <Image src={logoUrl} alt="Everi Labs" h={tokens.logo.full} w="auto" />}
      </Group>
      <Box flex={1} mih={0}>
        <ScrollArea h="100%" type="hover">
          <Stack gap="sm" py="md">
            {NAV.map(({ label, icon: Ico }) => {
              const active = label === ACTIVE;
              const link = (
                <NavLink
                  key={label}
                  component="button"
                  label={collapsed ? undefined : label}
                  aria-label={label}
                  aria-current={active ? 'page' : undefined}
                  leftSection={<Ico size={tokens.icon.md} stroke={1.6} />}
                  active={active}
                  bdrs="md"
                  onClick={() => { if (!active) notifications.show({ message: `${label} isn't part of this prototype.` }); }}
                />
              );
              return collapsed ? <Tooltip key={label} label={label} position="right">{link}</Tooltip> : link;
            })}
          </Stack>
        </ScrollArea>
      </Box>
    </Stack>
  );
}
