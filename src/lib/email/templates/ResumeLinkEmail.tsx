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

export interface ResumeLinkProps {
  resumeUrl: string;
  businessName?: string;
  intakeLabel?: string;
}

const navy = '#1C192A';
const orange = '#F28D3D';
const cream = '#FAF7F2';

export function ResumeLinkEmail({ resumeUrl, businessName, intakeLabel = 'intake' }: ResumeLinkProps) {
  return (
    <Html>
      <Head />
      <Preview>Pick up where you left off</Preview>
      <Body style={{ background: cream, fontFamily: 'Helvetica, Arial, sans-serif', margin: 0, padding: 0 }}>
        <Container style={{ maxWidth: 600, margin: '0 auto', padding: '32px 24px' }}>
          <Text style={{ color: orange, textTransform: 'uppercase', letterSpacing: 3, fontSize: 11, margin: 0 }}>
            The Creative Strategist
          </Text>
          <Heading style={{ color: navy, fontSize: 26, lineHeight: '1.2', margin: '8px 0 16px' }}>
            Your saved {intakeLabel.toLowerCase()}
          </Heading>
          <Text style={{ color: navy, fontSize: 15, lineHeight: '1.6' }}>
            {businessName
              ? `Here is the link to continue the ${intakeLabel.toLowerCase()} for ${businessName}.`
              : `Here is the link to continue your ${intakeLabel.toLowerCase()}.`}{' '}
            It will pick up exactly where you left off.
          </Text>
          <Section style={{ margin: '24px 0' }}>
            <Link
              href={resumeUrl}
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
              Continue the intake
            </Link>
          </Section>
          <Text style={{ color: navy, fontSize: 13 }}>
            Or copy this URL into your browser:
            <br />
            <span style={{ wordBreak: 'break-all' }}>{resumeUrl}</span>
          </Text>
        </Container>
      </Body>
    </Html>
  );
}

export default ResumeLinkEmail;
