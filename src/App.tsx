import { AppShell } from '@mantine/core';
import { useDisclosure } from '@mantine/hooks';
import { AppHeader } from './components/AppHeader';
import { SideNav } from './components/SideNav';
import { TranscriptionPage } from './screens/TranscriptionPage';
import { tokens } from './theme';

export default function App() {
  // Tablet widths start with the icon-rail nav so the workspace gets the room
  const [collapsed, { toggle }] = useDisclosure(!window.matchMedia(tokens.wideQuery).matches);
  return (
    <AppShell
      padding={0}
      layout="alt"
      header={{ height: tokens.header }}
      navbar={{ width: collapsed ? tokens.navbar.collapsed : tokens.navbar.open, breakpoint: 'xs' }}
    >
      <AppShell.Header>
        <AppHeader collapsed={collapsed} onToggle={toggle} />
      </AppShell.Header>
      <AppShell.Navbar px="sm">
        <SideNav collapsed={collapsed} />
      </AppShell.Navbar>
      <AppShell.Main h="100dvh" bg="everiSlate.0">
        <TranscriptionPage />
      </AppShell.Main>
    </AppShell>
  );
}
