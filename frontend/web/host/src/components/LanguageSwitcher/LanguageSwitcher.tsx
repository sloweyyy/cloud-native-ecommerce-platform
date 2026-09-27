import React from 'react';
import { useTranslation } from 'react-i18next';
import { Button, Dropdown } from 'antd';
import type { MenuProps } from 'antd';
import { GlobalOutlined } from '@ant-design/icons';

function LanguageSwitcher() {
  const { i18n } = useTranslation();

  const handleLanguageChange = (language: string) => {
    i18n.changeLanguage(language);
    localStorage.setItem('language', language);
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
        {i18n.language === 'en' ? 'EN' : 'VI'}
      </Button>
    </Dropdown>
  );
}

export default LanguageSwitcher;
