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
  Android,
  Campaign, // 공지사항 아이콘 추가
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
      name: '공지사항',
      path: '/save/notifications',
      icon: <Campaign />,
      subItems: [
        { name: '공지사항 등록', path: '/save/notifications/register' },
        { name: '공지사항 관리', path: '/save/notifications/manage' }
      ]
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
      name: '회원 관리',
      path: '/save/users',
      icon: <People />
    },
    {
      name: '리워드',
      path: '/save/rewards',
      icon: <Storefront />,
      subItems: [
        { name: '상품 관리', path: '/save/rewards' },
        { name: '결제 내역', path: '/save/payments' },
        { name: '매장 등록', path: '/save/stores/register' },
        { name: '매장 관리', path: '/save/stores/manage' },
      ]
    },
    {
      name: '앱 버전 관리',
      path: '/save/app-version',
      icon: <Android />
    },
  ];

  const [openMenus, setOpenMenus] = useState<{ [key: string]: boolean }>({
    '공지사항': pathname.startsWith('/save/notifications'),
    '콘텐츠': pathname.startsWith('/save/content'),
    '이벤트': pathname.startsWith('/save/events'),
    'NFC': pathname.startsWith('/save/nfc'),
    '리워드': pathname.startsWith('/save/rewards') || pathname.startsWith('/save/stores') || pathname.startsWith('/save/payments'),
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
              width: 200,
              height: 200,
              mx: 'auto',
              mb: 1,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              borderRadius: 2,
              backgroundImage: `url('/xpg-icon.png')`,
              backgroundSize: 'contain',
              backgroundRepeat: 'no-repeat',
              backgroundPosition: 'center',
            }}
          >
          </Box>
        </Box>

        {/* Menu Items */}
        <List component="nav" sx={{ flexGrow: 1 }}>
          {menuItems.map((item) => {
            
            let isActive = false;
            if (item.name === '리워드') {
              // '리워드'는 특별 케이스: 여러 경로를 확인
              isActive = pathname.startsWith('/save/rewards') || pathname.startsWith('/save/stores') || pathname.startsWith('/save/payments');
            } else if (item.name === 'HOME') {
              // 'HOME'은 정확히 일치할 때만 활성화
              isActive = pathname === item.path;
            } else if (item.name === '앱 버전 관리') {
               isActive = pathname.startsWith('/save/app-version');
            } else {
              // '공지사항', '콘텐츠', 'NFC', '회원관리'는 startsWith로 활성화
              isActive = pathname.startsWith(item.path);
            }
            
            return (
              <Box key={item.name}>
                <ListItemButton
                  onClick={() => handleMenuClick(item)}
                  selected={isActive}
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
                        fontWeight: isActive ? 600 : 400
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
            );
          })}
        </List>
      </Box>
    </Drawer>
  );
}