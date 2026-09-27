import React from 'react';
import { Button, Dropdown } from 'antd';
import type { MenuProps } from 'antd';
import { GlobalOutlined } from '@ant-design/icons';

/**
 * Simple language switcher component
 * Uses localStorage to persist language preference
 */
function LanguageSwitcher() {
  const [language, setLanguage] = React.useState<string>(() => {
    if (typeof window !== 'undefined') {
      return localStorage.getItem('language') || 'en';
    }
    return 'en';
  });

  const handleLanguageChange = (lang: string) => {
    setLanguage(lang);
    if (typeof window !== 'undefined') {
      localStorage.setItem('language', lang);
      // Dispatch custom event for i18n libraries to listen to
      window.dispatchEvent(new CustomEvent('language-changed', { detail: { language: lang } }));
    }
  };

  const items: MenuProps['items'] = [
    {
      key: 'en',
      label: 'English',
      onClick: () => handleLanguageChange('en'),
    },
    {
      key: 'vi',
      label: 'Tiếng Việt',
      onClick: () => handleLanguageChange('vi'),
    },
  ];

  return (
    <Dropdown menu={{ items }} placement="bottomRight">
      <Button icon={<GlobalOutlined />}>
        {language === 'en' ? 'EN' : 'VI'}
      </Button>
    </Dropdown>
  );
}

export default LanguageSwitcher;

