'use client';

import { useState } from 'react';
import { useRouter, usePathname } from 'next/navigation';
import {
  Drawer,
  List,
  ListItemButton,
  ListItemText,
  Collapse,
  Box,
  Typography,
} from '@mui/material';
import {
  ExpandLess,
  ExpandMore,
  Home,
  Article,
  Nfc,
  People,
  Celebration,
  CardGiftcard,
  Storefront,
} from '@mui/icons-material';

interface SubMenuItem {
  name: string;
  path: string;
}

interface MenuItem {
  name: string;
  path: string;
  icon: React.ReactNode;
  subItems?: SubMenuItem[];
}

export default function Sidebar() {
  const router = useRouter();
  const pathname = usePathname();
  
  const menuItems: MenuItem[] = [
    {
      name: 'HOME',
      path: '/save/dashboard',
      icon: <Home />
    },
    {
      name: '콘텐츠',
      path: '/save/content',
      icon: <Article />,
      subItems: [
        { name: '콘텐츠 등록', path: '/save/content/register' },
        { name: '콘텐츠 관리', path: '/save/content/manage' }
      ]
    },
    // {
    //   name: '이벤트',
    //   path: '/save/events',
    //   icon: <Celebration />,
    //   subItems: [
    //     { name: '이벤트 등록', path: '/save/events/register' },
    //     { name: '이벤트 관리', path: '/save/events/manage' },
    //   ],
    // },
    {
      name: 'NFC',
      path: '/save/nfc',
      icon: <Nfc />,
      subItems: [
        { name: 'NFC 등록', path: '/save/nfc/register' },
        { name: 'NFC 관리', path: '/save/nfc/manage' },
      ]
    },
    {
      name: '회원관리',
      path: '/save/users',
      icon: <People />
    },
    {
      name: '리워드관리',
      path: '/save/rewards',
      icon: <CardGiftcard />
    },
    {
      name: '매장관리',
      path: '/save/stores',
      icon: <Storefront />,
      subItems: [
        { name: '매장 등록', path: '/save/stores/register' },
        { name: '매장 관리', path: '/save/stores/manage' },
      ]
    },
  ];

  const [openMenus, setOpenMenus] = useState<{ [key: string]: boolean }>({
    '콘텐츠': pathname.startsWith('/save/content'),
    '이벤트': pathname.startsWith('/save/events'),
    'NFC': pathname.startsWith('/save/nfc'),
    '매장관리': pathname.startsWith('/save/stores'),
  });

  const handleMenuClick = (item: MenuItem) => {
    if (item.subItems) {
      setOpenMenus(prev => ({
        ...prev,
        [item.name]: !prev[item.name]
      }));
    } else {
      router.push(item.path);
    }
  };

  const handleSubMenuClick = (path: string) => {
    router.push(path);
  };

  return (
    <Drawer
      variant="permanent"
      sx={{
        width: 240,
        flexShrink: 0,
        '& .MuiDrawer-paper': {
          width: 240,
          boxSizing: 'border-box',
          bgcolor: '#ffffff',
          borderRight: 'none',
          position: 'relative',
          height: '100%'
        }
      }}
    >
      <Box sx={{ display: 'flex', flexDirection: 'column', height: '100%', p: 2 }}>
        {/* Logo Section */}
        <Box sx={{ textAlign: 'center', mb: 4, mt: 2 }}>
          <Box
            sx={{
              width: 56,
              height: 56,
              bgcolor: 'black',
              mx: 'auto',
              mb: 1,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              borderRadius: 2
            }}
          >
            <Typography variant="h5" sx={{ color: 'white', fontWeight: 'bold' }}>
              ✕
            </Typography>
          </Box>
          <Typography variant="body2" sx={{ fontWeight: 600, color: 'text.primary' }}>
            X-Play.G
          </Typography>
        </Box>

        {/* Menu Items */}
        <List component="nav" sx={{ flexGrow: 1 }}>
          {menuItems.map((item) => (
            <Box key={item.name}>
              <ListItemButton
                onClick={() => handleMenuClick(item)}
                selected={pathname === item.path || pathname.startsWith(item.path + '/')}
                sx={{
                  borderRadius: 2,
                  mb: 0.5,
                  '&.Mui-selected': {
                    bgcolor: 'primary.main',
                    color: 'white',
                    '&:hover': {
                      bgcolor: 'primary.dark'
                    },
                    '& .MuiSvgIcon-root': {
                      color: 'white'
                    }
                  },
                  '&:hover': {
                    bgcolor: 'grey.200',
                    borderRadius: 2
                  }
                }}
              >
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5, width: '100%' }}>
                  {item.icon}
                  <ListItemText 
                    primary={item.name}
                    primaryTypographyProps={{
                      fontSize: '0.95rem',
                      fontWeight: pathname === item.path || pathname.startsWith(item.path + '/') ? 600 : 400
                    }}
                  />
                  {item.subItems && (
                    openMenus[item.name] ? <ExpandLess /> : <ExpandMore />
                  )}
                </Box>
              </ListItemButton>

              {/* Sub Menu Items */}
              {item.subItems && (
                <Collapse in={openMenus[item.name]} timeout="auto" unmountOnExit>
                  <List component="div" disablePadding>
                    {item.subItems.map((subItem) => (
                      <ListItemButton
                        key={subItem.name}
                        onClick={() => handleSubMenuClick(subItem.path)}
                        selected={pathname.replace(/\/$/, '') === subItem.path}
                        sx={{
                          pl: 6,
                          py: 1,
                          borderRadius: 2,
                          ml: 2,
                          mb: 0.5,
                          '&.Mui-selected': {
                            bgcolor: 'grey.200',
                            color: 'text.primary',
                            fontWeight: 600,
                            py: 0.75,
                            '&:hover': {
                              bgcolor: '#eeeeee'
                            }
                          },
                          '&:hover': {
                            bgcolor: 'grey.200',
                            borderRadius: 2
                          }
                        }}
                      >
                        <ListItemText
                          primary={subItem.name}
                          primaryTypographyProps={{
                            fontSize: '0.875rem',
                            fontWeight: pathname.replace(/\/$/, '') === subItem.path ? 600 : 400
                          }}
                        />
                      </ListItemButton>
                    ))}
                  </List>
                </Collapse>
              )}
            </Box>
          ))}
        </List>
      </Box>
    </Drawer>
  );
}