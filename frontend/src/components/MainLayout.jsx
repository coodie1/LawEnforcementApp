import * as React from 'react';
import { styled, useTheme } from '@mui/material/styles';
import Box from '@mui/material/Box';
import MuiDrawer from '@mui/material/Drawer';
import MuiAppBar from '@mui/material/AppBar';
import Toolbar from '@mui/material/Toolbar';
import List from '@mui/material/List';
import CssBaseline from '@mui/material/CssBaseline';
import Typography from '@mui/material/Typography';
import Divider from '@mui/material/Divider';
import IconButton from '@mui/material/IconButton';
import MenuIcon from '@mui/icons-material/Menu';
import ChevronLeftIcon from '@mui/icons-material/ChevronLeft';
import ChevronRightIcon from '@mui/icons-material/ChevronRight';
import ListItem from '@mui/material/ListItem';
import ListItemButton from '@mui/material/ListItemButton';
import ListItemIcon from '@mui/material/ListItemIcon';
import ListItemText from '@mui/material/ListItemText';
import { Link, Outlet, useLocation, useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { Button, Avatar, Menu, MenuItem } from '@mui/material';
import LogoutIcon from '@mui/icons-material/Logout';
import AccountCircleIcon from '@mui/icons-material/AccountCircle';
import DarkModeIcon from '@mui/icons-material/DarkMode';

// --- IMPORT ICONS ---
import DashboardIcon from '@mui/icons-material/Dashboard';
import AssignmentIcon from '@mui/icons-material/Assignment'; // Incidents, Cases, Reports
import PeopleIcon from '@mui/icons-material/People'; // People, Officers
import GavelIcon from '@mui/icons-material/Gavel'; // Arrests, Charges, Sentences
import BusinessIcon from '@mui/icons-material/Business'; // Departments, Prisons
import PlaceIcon from '@mui/icons-material/Place'; // Locations
import ScienceIcon from '@mui/icons-material/Science'; // Evidence, Forensics
import DirectionsCarIcon from '@mui/icons-material/DirectionsCar'; // Vehicles
import SecurityIcon from '@mui/icons-material/Security'; // Weapons

const drawerWidth = 240;

const openedMixin = (theme) => ({
  width: drawerWidth,
  transition: theme.transitions.create('width', {
    easing: theme.transitions.easing.sharp,
    duration: theme.transitions.duration.enteringScreen,
  }),
  overflowX: 'hidden',
});

const closedMixin = (theme) => ({
  transition: theme.transitions.create('width', {
    easing: theme.transitions.easing.sharp,
    duration: theme.transitions.duration.leavingScreen,
  }),
  overflowX: 'hidden',
  width: `calc(${theme.spacing(7)} + 1px)`,
  [theme.breakpoints.up('sm')]: {
    width: `calc(${theme.spacing(8)} + 1px)`,
  },
});

const DrawerHeader = styled('div')(({ theme }) => ({
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'flex-end',
  padding: theme.spacing(0, 1),
  ...theme.mixins.toolbar,
}));

const AppBar = styled(MuiAppBar, {
  shouldForwardProp: (prop) => prop !== 'open',
})(({ theme, open }) => ({
  zIndex: theme.zIndex.drawer + 1,
  background: '#ffffff',
  color: '#1e293b',
  boxShadow: '0 1px 3px 0 rgba(0, 0, 0, 0.1)',
  transition: theme.transitions.create(['width', 'margin'], {
    easing: theme.transitions.easing.sharp,
    duration: theme.transitions.duration.leavingScreen,
  }),
  ...(open && {
    marginLeft: drawerWidth,
    width: `calc(100% - ${drawerWidth}px)`,
    transition: theme.transitions.create(['width', 'margin'], {
      easing: theme.transitions.easing.sharp,
      duration: theme.transitions.duration.enteringScreen,
    }),
  }),
}));

const Drawer = styled(MuiDrawer, { shouldForwardProp: (prop) => prop !== 'open' })(
  ({ theme, open }) => ({
    width: drawerWidth,
    flexShrink: 0,
    whiteSpace: 'nowrap',
    boxSizing: 'border-box',
    ...(open && {
      ...openedMixin(theme),
      '& .MuiDrawer-paper': {
        ...openedMixin(theme),
        backgroundColor: '#f8fafc',
        borderRight: '1px solid #e2e8f0',
      },
    }),
    ...(!open && {
      ...closedMixin(theme),
      '& .MuiDrawer-paper': {
        ...closedMixin(theme),
        backgroundColor: '#f8fafc',
        borderRight: '1px solid #e2e8f0',
      },
    }),
  }),
);

// --- DEFINE ALL 15 COLLECTIONS HERE ---
const menuItems = [
  { text: 'Dashboard', icon: <DashboardIcon />, path: '/' },
  // Core
  { text: 'People', icon: <PeopleIcon />, path: '/people' },
  { text: 'Arrests', icon: <GavelIcon />, path: '/arrests' },
  { text: 'Cases', icon: <AssignmentIcon />, path: '/cases' },
  { text: 'Charges', icon: <GavelIcon />, path: '/charges' },
  { text: 'Officers', icon: <PeopleIcon />, path: '/officers' },
  { text: 'Departments', icon: <BusinessIcon />, path: '/departments' },
  { text: 'Incidents', icon: <AssignmentIcon />, path: '/incidents' },
  { text: 'Locations', icon: <PlaceIcon />, path: '/locations' },
  { text: 'Prisons', icon: <BusinessIcon />, path: '/prisons' },
  { text: 'Evidence', icon: <ScienceIcon />, path: '/evidence' },
  { text: 'Forensics', icon: <ScienceIcon />, path: '/forensics' },
  { text: 'Reports', icon: <AssignmentIcon />, path: '/reports' },
  { text: 'Sentences', icon: <GavelIcon />, path: '/sentences' },
  { text: 'Vehicles', icon: <DirectionsCarIcon />, path: '/vehicles' },
  { text: 'Weapons', icon: <SecurityIcon />, path: '/weapons' },
];

export default function MainLayout() {
  const theme = useTheme();
  const [open, setOpen] = React.useState(true);
  const [anchorEl, setAnchorEl] = React.useState(null);
  const location = useLocation();
  const navigate = useNavigate();
  const { user, logout } = useAuth();

  const handleDrawerOpen = () => setOpen(true);
  const handleDrawerClose = () => setOpen(false);
  const handleMenuOpen = (event) => setAnchorEl(event.currentTarget);
  const handleMenuClose = () => setAnchorEl(null);
  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  return (
    <Box sx={{ display: 'flex' }}>
      <CssBaseline />
      <AppBar position="fixed" open={open}>
        <Toolbar>
          <IconButton
            color="inherit"
            aria-label="open drawer"
            onClick={handleDrawerOpen}
            edge="start"
            sx={{ marginRight: 2, ...(open && { display: 'none' }) }}
          >
            <MenuIcon />
          </IconButton>

          <Box sx={{ flexGrow: 1 }} />

          <IconButton color="inherit" sx={{ mr: 1 }}>
            <DarkModeIcon />
          </IconButton>

          {user && (
            <>
              <Button
                color="inherit"
                onClick={handleMenuOpen}
                startIcon={<AccountCircleIcon />}
                sx={{ textTransform: 'none' }}
              >
                {user.firstName || user.username}
              </Button>
              <Menu
                anchorEl={anchorEl}
                open={Boolean(anchorEl)}
                onClose={handleMenuClose}
              >
                <MenuItem disabled>
                  <Typography variant="body2">
                    Role: {user.role === 'officer' ? 'Officer' : 'Public'}
                  </Typography>
                </MenuItem>
                <MenuItem onClick={handleLogout}>
                  <LogoutIcon sx={{ mr: 1 }} fontSize="small" />
                  Logout
                </MenuItem>
              </Menu>
            </>
          )}
        </Toolbar>
      </AppBar>

      <Drawer variant="permanent" open={open}>
        <DrawerHeader sx={{ padding: '16px', justifyContent: 'space-between' }}>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
            <Box sx={{
              width: 40,
              height: 40,
              borderRadius: '8px',
              background: 'linear-gradient(135deg, #2563eb 0%, #1d4ed8 100%)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              color: 'white',
              fontWeight: 'bold',
              fontSize: '18px'
            }}>
              ⚖
            </Box>
            {open && (
              <Box>
                <Typography variant="subtitle1" fontWeight="600" color="#0f172a">
                  Law Enforcement
                </Typography>
                <Typography variant="caption" color="#64748b">
                  Portal System
                </Typography>
              </Box>
            )}
          </Box>
          <IconButton onClick={handleDrawerClose} size="small" sx={{ display: open ? 'flex' : 'none' }}>
            {theme.direction === 'rtl' ? <ChevronRightIcon /> : <ChevronLeftIcon />}
          </IconButton>
        </DrawerHeader>
        <Divider sx={{ borderColor: '#e2e8f0' }} />

        {open && (
          <Typography variant="caption" sx={{ px: 2.5, py: 1.5, color: '#64748b', fontWeight: 600, fontSize: '11px', letterSpacing: '0.5px', textTransform: 'uppercase' }}>
            Collections
          </Typography>
        )}

        <List sx={{ px: 1.5 }}>
          {menuItems.map((item) => (
            <ListItem key={item.text} disablePadding sx={{ display: 'block', mb: 0.5 }}>
              <ListItemButton
                component={Link}
                to={item.path}
                selected={location.pathname === item.path || (item.path !== '/' && location.pathname.startsWith(item.path))}
                sx={{
                  minHeight: 44,
                  borderRadius: '8px',
                  justifyContent: open ? 'initial' : 'center',
                  px: 2,
                  '&.Mui-selected': {
                    backgroundColor: '#e0e7ff',
                    color: '#2563eb',
                    '& .MuiListItemIcon-root': {
                      color: '#2563eb',
                    },
                    '&:hover': {
                      backgroundColor: '#dbeafe',
                    }
                  },
                  '&:hover': {
                    backgroundColor: '#f1f5f9',
                  }
                }}
              >
                <ListItemIcon sx={{
                  minWidth: 0,
                  mr: open ? 2 : 'auto',
                  justifyContent: 'center',
                  color: '#64748b',
                  fontSize: '20px'
                }}>
                  {item.icon}
                </ListItemIcon>
                <ListItemText
                  primary={item.text}
                  sx={{
                    opacity: open ? 1 : 0,
                    '& .MuiTypography-root': {
                      fontSize: '14px',
                      fontWeight: 500
                    }
                  }}
                />
              </ListItemButton>
            </ListItem>
          ))}
        </List>

        {/* User Profile at Bottom */}
        {open && user && (
          <Box sx={{
            mt: 'auto',
            p: 2,
            borderTop: '1px solid #e2e8f0',
            display: 'flex',
            alignItems: 'center',
            gap: 1.5
          }}>
            <Avatar
              sx={{
                width: 36,
                height: 36,
                bgcolor: '#2563eb',
                fontSize: '14px',
                fontWeight: 600
              }}
            >
              {user.firstName ? user.firstName[0] : user.username[0]}
            </Avatar>
            <Box sx={{ flex: 1, minWidth: 0 }}>
              <Typography variant="body2" fontWeight="600" color="#0f172a" noWrap>
                Officer {user.firstName || user.username}
              </Typography>
              <Typography variant="caption" color="#64748b" noWrap>
                Badge #{user.badgeNumber || '4521'}
              </Typography>
            </Box>
            <IconButton size="small" onClick={handleMenuOpen} title="Sidebar Settings">
              <MenuIcon fontSize="small" />
            </IconButton>
          </Box>
        )}
      </Drawer>

      <Box component="main" sx={{ flexGrow: 1, p: 3, backgroundColor: '#f8fafc' }}>
        <DrawerHeader />
        <Outlet />
      </Box>
    </Box>
  );
}