import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Row, Col, Typography, Input, Button, Space, Flex } from 'antd';
import {
  PhoneOutlined,
  MailOutlined,
  EnvironmentOutlined,
  FacebookOutlined,
  InstagramOutlined,
  TwitterOutlined,
  LinkedinOutlined,
} from '@ant-design/icons';
import {
  FOOTER_BRAND,
  FOOTER_NAV_LINKS,
  FOOTER_CONTACT,
  FOOTER_SOCIAL_LINKS,
  FOOTER_LEGAL_LINKS,
} from '../../constants/footer';
import { brandGradient } from '../../config/theme';

const { Title, Text, Paragraph } = Typography;

const Footer: React.FC = () => {
  const navigate = useNavigate();

  const [email, setEmail] = React.useState('');
  const [isSubscribing, setIsSubscribing] = React.useState(false);

  const handleSubscribe = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubscribing(true);

    // TODO: Implement newsletter subscription API call
    try {
      await new Promise((resolve) => setTimeout(resolve, 1000));

      alert('Thank you for subscribing to our newsletter!');
      setEmail('');
    } catch {
      alert('Failed to subscribe. Please try again later.');
    } finally {
      setIsSubscribing(false);
    }
  };

  const getSocialIcon = (name: string) => {
    switch (name) {
      case 'facebook':
        return <FacebookOutlined />;
      case 'instagram':
        return <InstagramOutlined />;
      case 'twitter':
        return <TwitterOutlined />;
      case 'linkedin':
        return <LinkedinOutlined />;
      default:
        return null;
    }
  };

  return (
    <footer
      style={{
        background: '#1e293b',
        color: '#ffffff',
        fontFamily: "'Poppins', sans-serif",
        paddingTop: 64,
        marginTop: 80,
        position: 'relative',
        overflow: 'hidden',
      }}
    >
      <div
        style={{
          position: 'absolute',
          top: 0,
          left: 0,
          width: '100%',
          height: 4,
          background: brandGradient.start,
        }}
      />
      <div
        style={{
          maxWidth: 1400,
          margin: '0 auto',
          padding: '0 32px 48px',
        }}
      >
        <Row gutter={[48, 48]}>
          <Col xs={24} sm={24} md={12} lg={6}>
            <Title
              level={3}
              style={{
                marginBottom: 16,
                fontSize: '2em',
                fontWeight: 700,
                color: brandGradient.start,
              }}
            >
              {FOOTER_BRAND.name}
            </Title>
            <Paragraph
              style={{
                fontSize: '0.9em',
                lineHeight: 1.7,
                opacity: 0.7,
                color: '#cbd5e1',
              }}
            >
              {FOOTER_BRAND.description}
            </Paragraph>
          </Col>

          <Col xs={24} sm={12} md={6} lg={6}>
            <Title
              level={4}
              style={{
                marginBottom: 24,
                fontSize: '1.2em',
                fontWeight: 600,
                position: 'relative',
                display: 'inline-block',
              }}
            >
              Navigation
              <div
                style={{
                  position: 'absolute',
                  bottom: -8,
                  left: 0,
                  width: 48,
                  height: 3,
                  background: brandGradient.start,
                  borderRadius: 2,
                }}
              />
            </Title>
            <Space direction="vertical" size="middle" style={{ width: '100%' }}>
              {FOOTER_NAV_LINKS.map((link) => (
                <Button
                  key={link.path}
                  type="text"
                  onClick={() => navigate(link.path)}
                  style={{
                    color: '#cbd5e1',
                    padding: 0,
                    textAlign: 'left',
                    height: 'auto',
                    fontSize: '0.95em',
                  }}
                >
                  {link.label}
                </Button>
              ))}
            </Space>
          </Col>

          <Col xs={24} sm={12} md={6} lg={6}>
            <Title
              level={4}
              style={{
                marginBottom: 24,
                fontSize: '1.2em',
                fontWeight: 600,
                position: 'relative',
                display: 'inline-block',
              }}
            >
              Contact Us
              <div
                style={{
                  position: 'absolute',
                  bottom: -8,
                  left: 0,
                  width: 48,
                  height: 3,
                  background: brandGradient.start,
                  borderRadius: 2,
                }}
              />
            </Title>
            <Space direction="vertical" size="middle">
              <Text style={{ color: '#cbd5e1', fontSize: '0.9em' }}>
                <PhoneOutlined
                  style={{
                    color: brandGradient.start,
                    fontSize: '1.2em',
                    marginRight: 12,
                  }}
                />
                {FOOTER_CONTACT.phone}
              </Text>
              <Text style={{ color: '#cbd5e1', fontSize: '0.9em' }}>
                <MailOutlined
                  style={{
                    color: brandGradient.start,
                    fontSize: '1.2em',
                    marginRight: 12,
                  }}
                />
                {FOOTER_CONTACT.email}
              </Text>
              <Text style={{ color: '#cbd5e1', fontSize: '0.9em' }}>
                <EnvironmentOutlined
                  style={{
                    color: brandGradient.start,
                    fontSize: '1.2em',
                    marginRight: 12,
                  }}
                />
                {FOOTER_CONTACT.address}
              </Text>
            </Space>
          </Col>

          <Col xs={24} sm={24} md={12} lg={6}>
            <Title
              level={4}
              style={{
                marginBottom: 24,
                fontSize: '1.2em',
                fontWeight: 600,
                position: 'relative',
                display: 'inline-block',
              }}
            >
              Connect With Us
              <div
                style={{
                  position: 'absolute',
                  bottom: -8,
                  left: 0,
                  width: 48,
                  height: 3,
                  background: brandGradient.start,
                  borderRadius: 2,
                }}
              />
            </Title>
            <Space size="middle" style={{ marginBottom: 24 }}>
              {FOOTER_SOCIAL_LINKS.map((social) => (
                <Button
                  key={social.name}
                  type="text"
                  href={social.url}
                  icon={getSocialIcon(social.name)}
                  aria-label={social.ariaLabel}
                  target="_blank"
                  rel="noopener noreferrer"
                  style={{
                    width: 40,
                    height: 40,
                    borderRadius: '50%',
                    background: 'rgba(255, 255, 255, 0.08)',
                    color: '#cbd5e1',
                    border: '1px solid rgba(255, 255, 255, 0.1)',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                  }}
                />
              ))}
            </Space>
            <div>
              <Title
                level={5}
                style={{ fontSize: '1em', marginBottom: 12, color: '#ffffff' }}
              >
                Subscribe to our newsletter
              </Title>
              <Space.Compact style={{ width: '100%' }}>
                <Input
                  type="email"
                  placeholder="Your email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  disabled={isSubscribing}
                  required
                  aria-label="Email address for newsletter"
                  style={{
                    flex: 1,
                    borderRadius: '8px 0 0 8px',
                    background: 'rgba(255, 255, 255, 0.05)',
                    border: '1px solid rgba(255, 255, 255, 0.1)',
                    color: '#ffffff',
                  }}
                />
                <Button
                  type="primary"
                  onClick={handleSubscribe}
                  disabled={isSubscribing}
                  loading={isSubscribing}
                  style={{
                    background: brandGradient.start,
                    border: 'none',
                    borderRadius: '0 8px 8px 0',
                    fontWeight: 600,
                    boxShadow: '0 2px 8px rgba(102, 126, 234, 0.3)',
                  }}
                >
                  {isSubscribing ? 'Subscribing...' : 'Subscribe'}
                </Button>
              </Space.Compact>
            </div>
          </Col>
        </Row>
      </div>

      <Flex
        justify="space-between"
        align="center"
        style={{
          padding: '24px 32px',
          fontSize: '0.85em',
          fontWeight: 400,
          borderTop: '1px solid rgba(255, 255, 255, 0.08)',
          background: 'rgba(0, 0, 0, 0.2)',
          flexWrap: 'wrap',
          gap: 16,
        }}
      >
        <Text style={{ margin: 0, color: '#94a3b8' }}>
          {FOOTER_BRAND.copyright}
        </Text>
        <Space size="large">
          {FOOTER_LEGAL_LINKS.map((link) => (
            <Button
              key={link.path}
              type="text"
              onClick={() => navigate(link.path)}
              style={{
                color: '#cbd5e1',
                padding: 0,
                height: 'auto',
                fontSize: 'inherit',
              }}
            >
              {link.label}
            </Button>
          ))}
        </Space>
      </Flex>
    </footer>
  );
};

export default Footer;
