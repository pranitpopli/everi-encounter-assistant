import { ActionIcon, Avatar, Button, Group, Menu, Text } from '@mantine/core';
import { IconChevronDown, IconLayoutSidebarLeftCollapse, IconLayoutSidebarLeftExpand, IconMicrophoneOff, IconPlayerSkipForward, IconRefresh } from '@tabler/icons-react';
import { useEncounter } from '../state/encounterStore';
import { tokens } from '../theme';

export function AppHeader({ collapsed, onToggle }: { collapsed: boolean; onToggle: () => void }) {
  const { state, dispatch } = useEncounter();
  return (
    <Group h="100%" px="md" justify="space-between" wrap="nowrap">
      <Group gap="md" wrap="nowrap">
        <ActionIcon color="everiSlate" aria-label={collapsed ? 'Expand menu' : 'Collapse menu'} onClick={onToggle}>
          {collapsed ? <IconLayoutSidebarLeftExpand size={tokens.icon.md} /> : <IconLayoutSidebarLeftCollapse size={tokens.icon.md} />}
        </ActionIcon>
      </Group>
      <Group gap="sm">
        <Menu position="bottom-end" withinPortal>
          <Menu.Target>
            <Button variant="subtle" color="everiSlate" rightSection={<IconChevronDown size={tokens.icon.sm} />}>Demo controls</Button>
          </Menu.Target>
          <Menu.Dropdown>
            <Menu.Item
              leftSection={<IconPlayerSkipForward size={tokens.icon.sm} />}
              disabled={state.phase !== 'recording'}
              onClick={() => dispatch({ t: 'skipToEnd' })}
            >
              Skip to end of conversation
            </Menu.Item>
            <Menu.Item
              leftSection={<IconMicrophoneOff size={tokens.icon.sm} />}
              disabled={state.phase !== 'recording'}
              onClick={() => dispatch({ t: 'setMic', issue: true })}
            >
              Simulate mic issue
            </Menu.Item>
            <Menu.Item leftSection={<IconRefresh size={tokens.icon.sm} />} onClick={() => dispatch({ t: 'reset' })}>
              Restart demo
            </Menu.Item>
          </Menu.Dropdown>
        </Menu>
        <Text size="sm" fw={600} style={{ cursor: 'default', userSelect: 'none' }}>Everi × Pranit</Text>
        <Avatar size={tokens.avatar} color="everiBlue" radius="xl" aria-label="Signed in as Erik Dahlqvist">ED</Avatar>
      </Group>
    </Group>
  );
}
