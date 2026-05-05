import {
  Body,
  Container,
  Head,
  Heading,
  Html,
  Link,
  Preview,
  Section,
  Text,
} from '@react-email/components';

export interface ClientConfirmationProps {
  contactName: string;
  businessName: string;
  bodyCopy: string;
  calendlyUrl: string;
  fromName?: string;
}

const navy = '#1C192A';
const orange = '#F28D3D';
const cream = '#FAF7F2';

export function ClientConfirmationEmail({
  contactName,
  businessName,
  bodyCopy,
  calendlyUrl,
  fromName = 'Andres',
}: ClientConfirmationProps) {
  return (
    <Html>
      <Head />
      <Preview>I received your branding intake</Preview>
      <Body style={{ background: cream, fontFamily: 'Helvetica, Arial, sans-serif', margin: 0, padding: 0 }}>
        <Container style={{ maxWidth: 600, margin: '0 auto', padding: '32px 24px' }}>
          <Text style={{ color: orange, textTransform: 'uppercase', letterSpacing: 3, fontSize: 11, margin: 0 }}>
            The Creative Strategist
          </Text>
          <Heading style={{ color: navy, fontSize: 26, lineHeight: '1.2', margin: '8px 0 16px' }}>
            Thank you, {contactName.split(' ')[0]}.
          </Heading>
          <Text style={{ color: navy, fontSize: 15, lineHeight: '1.6' }}>
            I just received the branding intake for {businessName}.
          </Text>
          <Text style={{ color: navy, fontSize: 15, lineHeight: '1.6', whiteSpace: 'pre-wrap' }}>
            {bodyCopy}
          </Text>

          <Section style={{ margin: '32px 0', textAlign: 'center' }}>
            <Link
              href={calendlyUrl}
              style={{
                display: 'inline-block',
                padding: '14px 28px',
                background: orange,
                color: '#fff',
                borderRadius: 8,
                fontWeight: 600,
                textDecoration: 'none',
                fontSize: 14,
              }}
            >
              Book a strategy call
            </Link>
          </Section>

          <Text style={{ color: navy, fontSize: 15, lineHeight: '1.6' }}>
            Talk soon,
            <br />
            {fromName}
          </Text>
        </Container>
      </Body>
    </Html>
  );
}

export default ClientConfirmationEmail;
