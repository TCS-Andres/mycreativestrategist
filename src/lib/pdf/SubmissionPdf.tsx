import { Document, Page, Text, View, StyleSheet } from '@react-pdf/renderer';
import { getIntake, getOptionLabel, intakeFileCategoryLabel } from '@/lib/intakes';
import type { IntakeKind } from '@/lib/intakes/types';
import type { SubmissionFile } from '@/lib/types';

const colors = {
  navy: '#1C192A',
  orange: '#F28D3D',
  cream: '#FAF7F2',
  gray: '#5A5566',
  border: '#E8E4DD',
};

const styles = StyleSheet.create({
  page: {
    padding: 56,
    fontFamily: 'Helvetica',
    fontSize: 10.5,
    color: colors.navy,
    backgroundColor: colors.cream,
    lineHeight: 1.5,
  },
  cover: {
    padding: 56,
    backgroundColor: colors.navy,
    color: colors.cream,
    minHeight: '100%',
  },
  eyebrow: {
    fontSize: 9,
    color: colors.orange,
    textTransform: 'uppercase',
    letterSpacing: 2,
    marginBottom: 12,
  },
  coverTitle: {
    fontSize: 30,
    color: colors.cream,
    fontWeight: 700,
    marginBottom: 18,
  },
  coverMeta: {
    fontSize: 11,
    color: '#bcb6c8',
    marginBottom: 4,
  },
  sectionTitle: {
    fontSize: 16,
    color: colors.navy,
    fontWeight: 700,
    marginTop: 16,
    marginBottom: 4,
  },
  sectionIntro: {
    fontSize: 9.5,
    color: colors.gray,
    fontStyle: 'italic',
    marginBottom: 16,
  },
  questionLabel: {
    fontSize: 9,
    color: colors.orange,
    textTransform: 'uppercase',
    letterSpacing: 1,
    marginTop: 14,
    marginBottom: 4,
  },
  questionText: {
    fontSize: 10.5,
    color: colors.navy,
  },
  pageHeader: {
    fontSize: 9,
    color: colors.gray,
    marginBottom: 18,
    textTransform: 'uppercase',
    letterSpacing: 2,
  },
  fileRow: {
    fontSize: 10,
    color: colors.navy,
    marginBottom: 4,
  },
  fileLabel: {
    color: colors.orange,
    textTransform: 'uppercase',
    fontSize: 8.5,
    letterSpacing: 1,
    marginTop: 10,
    marginBottom: 4,
  },
});

function formatAnswer(kind: IntakeKind, qid: string, value: unknown): string {
  if (value === null || value === undefined || value === '') return '—';
  if (typeof value === 'boolean') return value ? 'Yes' : 'No';
  if (Array.isArray(value)) {
    return value.map((v) => getOptionLabel(kind, qid, String(v))).join(', ');
  }
  if (typeof value === 'number') {
    return String(value);
  }
  return getOptionLabel(kind, qid, String(value));
}

export function SubmissionPdf({
  kind,
  responses,
  submittedAt,
  files,
}: {
  kind: IntakeKind;
  responses: Record<string, unknown>;
  submittedAt: string;
  files?: Pick<SubmissionFile, 'category' | 'file_name'>[];
}) {
  const intake = getIntake(kind)!;
  const businessName = (responses.business_name as string) ?? '';
  const contactName = (responses.contact_name as string) ?? '';
  const contactEmail = (responses.contact_email as string) ?? '';
  const contactPhone = (responses.contact_phone as string) ?? '';
  const industry = (responses.industry as string) ?? '';

  const nonUploadSections = intake.sections.filter((s) => s.id !== 'uploads');

  return (
    <Document
      title={`${intake.label} — ${businessName}`}
      author="The Creative Strategist"
    >
      <Page size="LETTER" style={styles.cover}>
        <Text style={styles.eyebrow}>The Creative Strategist · {intake.label}</Text>
        <Text style={styles.coverTitle}>{businessName}</Text>
        <Text style={styles.coverMeta}>Primary contact: {contactName}</Text>
        <Text style={styles.coverMeta}>Email: {contactEmail}</Text>
        {contactPhone ? <Text style={styles.coverMeta}>Phone: {contactPhone}</Text> : null}
        {industry ? <Text style={styles.coverMeta}>Industry: {industry}</Text> : null}
        <Text style={styles.coverMeta}>
          Submitted{' '}
          {new Date(submittedAt).toLocaleDateString('en-US', {
            month: 'long',
            day: 'numeric',
            year: 'numeric',
          })}
        </Text>
      </Page>

      {nonUploadSections.map((section) => (
        <Page size="LETTER" style={styles.page} key={section.id} wrap>
          <Text style={styles.pageHeader}>
            Section {section.index} · {section.title}
          </Text>
          <Text style={styles.sectionTitle}>{section.title}</Text>
          <Text style={styles.sectionIntro}>{section.intro}</Text>
          {section.questions.map((q) => {
            const value = responses[q.id];
            return (
              <View key={q.id} wrap={false}>
                <Text style={styles.questionLabel}>
                  {q.number !== undefined ? `${String(q.number).padStart(2, '0')} · ` : ''}
                  {q.label}
                </Text>
                <Text style={styles.questionText}>{formatAnswer(kind, q.id, value)}</Text>
              </View>
            );
          })}
        </Page>
      ))}

      {files && files.length > 0 && (
        <Page size="LETTER" style={styles.page}>
          <Text style={styles.pageHeader}>Uploads</Text>
          <Text style={styles.sectionTitle}>Uploaded files</Text>
          <Text style={styles.sectionIntro}>
            Files are stored in Supabase Storage and accessible from the admin dashboard.
          </Text>
          {(['logo', 'brand_guide', 'photography', 'marketing_materials'] as const).map((cat) => {
            const list = files.filter((f) => f.category === cat);
            if (list.length === 0) return null;
            return (
              <View key={cat}>
                <Text style={styles.fileLabel}>{intakeFileCategoryLabel(intake, cat)}</Text>
                {list.map((f, i) => (
                  <Text key={`${f.file_name}-${i}`} style={styles.fileRow}>
                    · {f.file_name}
                  </Text>
                ))}
              </View>
            );
          })}
        </Page>
      )}
    </Document>
  );
}
