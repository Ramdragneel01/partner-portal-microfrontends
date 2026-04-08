
/**
 * SideNav â€” Collapsible MUI permanent Drawer with role-based menu filtering.
 * Expanded: 300px showing icon + label in each row.
 * Collapsed: 56px showing icons only (labels fade out, width transitions).
 * @accessibility Semantic <nav>, aria-label, aria-current, keyboard navigation.
 */
import React, { useState } from 'react';
import { NavLink, useLocation } from 'react-router-dom';
import Drawer from '@mui/material/Drawer';
import Box from '@mui/material/Box';
import Tooltip from '@mui/material/Tooltip';
import IconButton from '@mui/material/IconButton';
import Avatar from '@mui/material/Avatar';
import Typography from '@mui/material/Typography';
import Divider from '@mui/material/Divider';
import Menu from '@mui/material/Menu';
import MenuItem from '@mui/material/MenuItem';
import ChevronLeftIcon from '@mui/icons-material/ChevronLeft';
import ChevronRightIcon from '@mui/icons-material/ChevronRight';
import ShieldIcon from '@mui/icons-material/Shield';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import ArticleIcon from '@mui/icons-material/Article';
import PolicyIcon from '@mui/icons-material/Policy';
import WarningAmberIcon from '@mui/icons-material/WarningAmber';
import BusinessIcon from '@mui/icons-material/Business';
import HandshakeIcon from '@mui/icons-material/Handshake';
import { useAuth } from '@shared/auth';
import { UserRole } from '@shared/types';
import { themeTokens } from '@shared/ui-components';
import type { NavItem } from '@shared/types';

const EXPANDED_WIDTH = themeTokens.layout.totalSidebarWidth; // 300px
const COLLAPSED_WIDTH = themeTokens.layout.iconStripWidth;    // 56px
const HEADER_HEIGHT = themeTokens.layout.headerHeight;      // 56px
const TRANSITION = `width ${themeTokens.animation.duration.shorter}ms ${themeTokens.animation.easing.easeInOut}`;


/** Navigation items with MUI icon components */
const NAV_ITEMS: (NavItem & { MuiIcon: React.ElementType })[] = [
  { key: 'risk-assessment', label: 'Risk Assessment', path: '/risk-assessment', icon: 'ðŸ›¡ï¸', MuiIcon: ShieldIcon, roles: [UserRole.Admin, UserRole.Auditor, UserRole.ComplianceOfficer, UserRole.Partner, UserRole.Viewer] },
  { key: 'compliance', label: 'Compliance', path: '/compliance', icon: 'âœ…', MuiIcon: CheckCircleIcon, roles: [UserRole.Admin, UserRole.Auditor, UserRole.ComplianceOfficer, UserRole.Partner, UserRole.Viewer] },
  { key: 'audit', label: 'Audit Management', path: '/audit', icon: 'ðŸ“‹', MuiIcon: ArticleIcon, roles: [UserRole.Admin, UserRole.Auditor, UserRole.ComplianceOfficer, UserRole.Viewer] },
  { key: 'policy', label: 'Policy Management', path: '/policy', icon: 'ðŸ“œ', MuiIcon: PolicyIcon, roles: [UserRole.Admin, UserRole.ComplianceOfficer, UserRole.Partner, UserRole.Viewer] },
  { key: 'incidents', label: 'Incident Reporting', path: '/incidents', icon: 'ðŸš¨', MuiIcon: WarningAmberIcon, roles: [UserRole.Admin, UserRole.ComplianceOfficer, UserRole.Partner, UserRole.Viewer] },
  { key: 'vendor-risk', label: 'Vendor Risk', path: '/vendor-risk', icon: 'ðŸ¢', MuiIcon: BusinessIcon, roles: [UserRole.Admin, UserRole.ComplianceOfficer, UserRole.Auditor, UserRole.Viewer] },
  { key: 'onboarding', label: 'Partner Onboarding', path: '/onboarding', icon: 'ðŸ¤', MuiIcon: HandshakeIcon, roles: [UserRole.Admin, UserRole.Partner, UserRole.Viewer] },
];

export interface SideNavProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

const SideNav: React.FC<SideNavProps> = ({ open, onOpenChange }) => {
  const { user, logout } = useAuth();
  const location = useLocation();
  const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null);
  const openUserMenu = (e: React.MouseEvent<HTMLElement>) => setAnchorEl(e.currentTarget);
  const closeUserMenu = () => setAnchorEl(null);
  const handleLogout = () => { closeUserMenu(); logout(); };
  const getInitials = (name: string) => name.split(' ').map((n) => n[0]).slice(0, 2).join('').toUpperCase();

  const visibleItems = NAV_ITEMS.filter((item) => user && item.roles.includes(user.role));
  const currentBase = '/' + (location.pathname.split('/')[1] || '');

  return (
    <Box component="nav" aria-label="Main navigation">
      <Drawer
        variant="permanent"
        sx={{
          width: open ? EXPANDED_WIDTH : COLLAPSED_WIDTH,
          flexShrink: 0,
          whiteSpace: 'nowrap',
          boxSizing: 'border-box',
          transition: TRANSITION,
          '& .MuiDrawer-paper': {
            width: open ? EXPANDED_WIDTH : COLLAPSED_WIDTH,
            top: `${HEADER_HEIGHT}px`,
            height: `calc(100vh - ${HEADER_HEIGHT}px)`,
            overflowX: 'hidden',
            transition: TRANSITION,
            boxSizing: 'border-box',
            display: 'flex',
            flexDirection: 'column',
          },
        }}
      >
        {/* Top bar: title (when expanded) + collapse toggle */}
        <Box sx={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: open ? 'space-between' : 'center',
          px: '8px',
          minHeight: 48,
          flexShrink: 0,
          borderBottom: '1px solid',
          borderColor: 'divider',
        }}>
          {open && (
            <Typography sx={{ fontSize: '0.7rem', fontWeight: 700, letterSpacing: '0.08em', textTransform: 'uppercase', color: 'text.secondary', pl: 1, whiteSpace: 'nowrap' }}>
              Security MicroApps
            </Typography>
          )}
          <Tooltip title={open ? 'Collapse menu' : 'Expand menu'} placement="right">
            <IconButton
              aria-label={open ? 'Collapse navigation' : 'Expand navigation'}
              aria-expanded={open}
              onClick={() => onOpenChange(!open)}
              size="small"
              sx={{ color: 'text.secondary', '&:hover': { bgcolor: 'action.hover' } }}
            >
              {open ? <ChevronLeftIcon fontSize="small" /> : <ChevronRightIcon fontSize="small" />}
            </IconButton>
          </Tooltip>
        </Box>

        {/* Nav items */}
        <Box
          component="ul"
          sx={{ listStyle: 'none', m: 0, p: '8px 0', flex: 1, overflowY: 'auto', overflowX: 'hidden' }}
        >
          {visibleItems.map((item) => {
            const isActive = currentBase === item.path;
            const Icon = item.MuiIcon;
            return (
              <Box component="li" key={item.key} sx={{ px: '8px', mb: '2px' }}>
                <Tooltip title={open ? '' : item.label} placement="right">
                  <Box
                    component={NavLink}
                    to={item.path}
                    aria-label={item.label}
                    aria-current={isActive ? 'page' : undefined}
                    sx={{
                      display: 'flex',
                      alignItems: 'center',
                      gap: 1.5,
                      minHeight: 40,
                      borderRadius: '8px',
                      color: isActive ? 'secondary.main' : 'text.secondary',
                      bgcolor: isActive ? 'action.selected' : 'transparent',
                      textDecoration: 'none',
                      px: open ? 1.5 : '10px',
                      transition: 'background-color 0.15s, color 0.15s',
                      '&:hover': { bgcolor: 'action.hover', color: 'text.primary' },
                      '&:focus-visible': { outline: '2px solid', outlineColor: 'secondary.main', outlineOffset: '2px' },
                    }}
                  >
                    <Icon sx={{ fontSize: 20, flexShrink: 0 }} />
                    <Typography
                      component="span"
                      sx={{
                        fontSize: '0.875rem',
                        fontWeight: isActive ? 600 : 500,
                        whiteSpace: 'nowrap',
                        overflow: 'hidden',
                        opacity: open ? 1 : 0,
                        maxWidth: open ? '200px' : 0,
                        transition: `opacity 150ms ease, max-width ${themeTokens.animation.duration.shorter}ms ${themeTokens.animation.easing.easeInOut}`,
                        color: 'inherit',
                      }}
                    >
                      {item.label}
                    </Typography>
                  </Box>
                </Tooltip>
              </Box>
            );
          })}
        </Box>

        <Divider />

        {/* User profile at bottom */}
        <Box sx={{ px: '8px', py: 1 }}>
          <Tooltip title={open ? '' : `${user?.displayName ?? 'Account'} — ${user?.role}`} placement="right">
            <Box
              onClick={openUserMenu}
              aria-label="Open user menu"
              aria-haspopup="true"
              aria-expanded={Boolean(anchorEl)}
              sx={{
                display: 'flex',
                alignItems: 'center',
                gap: 1.5,
                px: open ? 1 : '10px',
                py: 0.75,
                borderRadius: '8px',
                cursor: 'pointer',
                minWidth: 0,
                '&:hover': { bgcolor: 'action.hover' },
                '&:focus-visible': { outline: '2px solid', outlineColor: 'secondary.main' },
              }}
              role="button"
              tabIndex={0}
              onKeyDown={(e) => e.key === 'Enter' && openUserMenu(e as unknown as React.MouseEvent<HTMLElement>)}
            >
              <Avatar sx={{ width: 32, height: 32, fontSize: '0.75rem', fontWeight: 700, bgcolor: '#a100ff', flexShrink: 0 }}>
                {user ? getInitials(user.displayName) : '?'}
              </Avatar>
              <Box sx={{
                display: 'flex',
                flexDirection: 'column',
                overflow: 'hidden',
                opacity: open ? 1 : 0,
                maxWidth: open ? '160px' : 0,
                transition: `opacity 150ms ease, max-width ${themeTokens.animation.duration.shorter}ms ${themeTokens.animation.easing.easeInOut}`,
              }}>
                <Typography sx={{ fontWeight: 600, fontSize: '0.8rem', lineHeight: 1.2, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                  {user?.displayName ?? 'Guest'}
                </Typography>
                <Typography sx={{ fontSize: '0.7rem', color: 'text.secondary', textTransform: 'capitalize', lineHeight: 1.2, whiteSpace: 'nowrap' }}>
                  {user?.role}
                </Typography>
              </Box>
            </Box>
          </Tooltip>
          <Menu
            id="user-menu"
            anchorEl={anchorEl}
            open={Boolean(anchorEl)}
            onClose={closeUserMenu}
            anchorOrigin={{ vertical: 'top', horizontal: 'right' }}
            transformOrigin={{ vertical: 'bottom', horizontal: 'left' }}
            slotProps={{ paper: { elevation: 4, sx: { minWidth: 180 } } }}
          >
            <MenuItem dense disabled sx={{ opacity: '1 !important' }}>
              <Typography variant="caption" color="text.secondary">Signed in as {user?.email}</Typography>
            </MenuItem>
            <MenuItem onClick={handleLogout} dense>Sign Out</MenuItem>
          </Menu>
        </Box>
      </Drawer>
    </Box>
  );
};

export default SideNav;
