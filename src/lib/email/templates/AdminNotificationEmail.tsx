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

interface FileLink {
  category: string;
  file_name: string;
  url: string;
}

export interface AdminNotificationProps {
  intakeLabel: string;
  businessName: string;
  contactName: string;
  contactEmail: string;
  contactPhone?: string;
  topGoals?: string;
  budget?: string;
  timeline?: string;
  submissionUrl: string;
  files: FileLink[];
}

const navy = '#1C192A';
const orange = '#F28D3D';
const cream = '#FAF7F2';
const gray = '#5A5566';

export function AdminNotificationEmail(props: AdminNotificationProps) {
  return (
    <Html>
      <Head />
      <Preview>New {props.intakeLabel.toLowerCase()} from {props.businessName}</Preview>
      <Body style={{ background: cream, fontFamily: 'Helvetica, Arial, sans-serif', margin: 0, padding: 0 }}>
        <Container style={{ maxWidth: 600, margin: '0 auto', padding: '32px 24px' }}>
          <Section>
            <Text style={{ color: orange, textTransform: 'uppercase', letterSpacing: 3, fontSize: 11, margin: 0 }}>
              The Creative Strategist · {props.intakeLabel}
            </Text>
            <Heading style={{ color: navy, fontSize: 28, lineHeight: '1.2', margin: '8px 0 16px' }}>
              {props.businessName}
            </Heading>
            <Text style={{ color: gray, fontSize: 14, margin: 0 }}>
              {props.contactName} · {props.contactEmail}
              {props.contactPhone ? ` · ${props.contactPhone}` : ''}
            </Text>
          </Section>

          <Section style={{ marginTop: 24, padding: 20, background: '#fff', borderRadius: 12 }}>
            {props.topGoals ? (
              <>
                <Text style={{ color: navy, fontWeight: 600, fontSize: 12, textTransform: 'uppercase', letterSpacing: 2, margin: 0 }}>
                  Quick read
                </Text>
                <Text style={{ color: navy, fontSize: 14, margin: '6px 0 14px', whiteSpace: 'pre-wrap' }}>
                  {props.topGoals}
                </Text>
              </>
            ) : null}
            {props.budget && props.budget !== 'Not specified' ? (
              <>
                <Text style={{ color: navy, fontWeight: 600, fontSize: 12, textTransform: 'uppercase', letterSpacing: 2, margin: 0 }}>
                  Budget
                </Text>
                <Text style={{ color: navy, fontSize: 14, margin: '6px 0 14px' }}>{props.budget}</Text>
              </>
            ) : null}
            <Text style={{ color: navy, fontWeight: 600, fontSize: 12, textTransform: 'uppercase', letterSpacing: 2, margin: 0 }}>
              Timeline
            </Text>
            <Text style={{ color: navy, fontSize: 14, margin: '6px 0 0' }}>{props.timeline || 'Not specified'}</Text>
          </Section>

          <Section style={{ marginTop: 24, textAlign: 'center' }}>
            <Link
              href={props.submissionUrl}
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
              Open the full submission
            </Link>
          </Section>

          {props.files.length > 0 && (
            <Section style={{ marginTop: 32 }}>
              <Text style={{ color: navy, fontWeight: 600, fontSize: 13, textTransform: 'uppercase', letterSpacing: 2 }}>
                Uploaded files (links expire in 24 hours)
              </Text>
              {props.files.map((file) => (
                <Text key={file.url} style={{ margin: '6px 0', fontSize: 14 }}>
                  <span style={{ color: gray }}>{file.category}: </span>
                  <Link href={file.url} style={{ color: '#2B69D8' }}>
                    {file.file_name}
                  </Link>
                </Text>
              ))}
            </Section>
          )}

          <Text style={{ color: gray, fontSize: 12, marginTop: 40, textAlign: 'center' }}>
            The full PDF is attached to this email.
          </Text>
        </Container>
      </Body>
    </Html>
  );
}

export default AdminNotificationEmail;
