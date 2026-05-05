import { Document, Page, Text, View, StyleSheet } from '@react-pdf/renderer';
import { SECTIONS, getOptionLabel } from '@/lib/questions';
import type { Responses } from '@/lib/schema';
import type { SubmissionFile } from '@/lib/types';
import { FILE_CATEGORY_LABELS } from '@/lib/types';

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
  divider: {
    borderTopWidth: 1,
    borderTopColor: colors.border,
    marginVertical: 12,
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

function formatAnswer(qid: string, value: unknown): string {
  if (value === null || value === undefined || value === '') return '—';
  if (Array.isArray(value)) {
    return value.map((v) => getOptionLabel(qid, String(v))).join(', ');
  }
  if (typeof value === 'number') {
    return String(value);
  }
  return getOptionLabel(qid, String(value));
}

export function SubmissionPdf({
  responses,
  submittedAt,
  files,
}: {
  responses: Responses;
  submittedAt: string;
  files?: Pick<SubmissionFile, 'category' | 'file_name'>[];
}) {
  return (
    <Document
      title={`Branding Intake — ${responses.business_name}`}
      author="The Creative Strategist"
    >
      <Page size="LETTER" style={styles.cover}>
        <Text style={styles.eyebrow}>The Creative Strategist · Branding Intake</Text>
        <Text style={styles.coverTitle}>{responses.business_name}</Text>
        <Text style={styles.coverMeta}>Primary contact: {responses.contact_name}</Text>
        <Text style={styles.coverMeta}>Email: {responses.contact_email}</Text>
        {responses.contact_phone ? (
          <Text style={styles.coverMeta}>Phone: {responses.contact_phone}</Text>
        ) : null}
        <Text style={styles.coverMeta}>Industry: {responses.industry}</Text>
        <Text style={styles.coverMeta}>
          Submitted{' '}
          {new Date(submittedAt).toLocaleDateString('en-US', {
            month: 'long',
            day: 'numeric',
            year: 'numeric',
          })}
        </Text>
      </Page>

      {SECTIONS.filter((s) => s.id !== 'uploads').map((section) => (
        <Page size="LETTER" style={styles.page} key={section.id} wrap>
          <Text style={styles.pageHeader}>
            Section {section.index} · {section.title}
          </Text>
          <Text style={styles.sectionTitle}>{section.title}</Text>
          <Text style={styles.sectionIntro}>{section.intro}</Text>
          {section.questions.map((q) => {
            const value = (responses as Record<string, unknown>)[q.id];
            return (
              <View key={q.id} wrap={false}>
                <Text style={styles.questionLabel}>
                  {String(q.number).padStart(2, '0')} · {q.label}
                </Text>
                <Text style={styles.questionText}>{formatAnswer(q.id, value)}</Text>
              </View>
            );
          })}
        </Page>
      ))}

      {files && files.length > 0 && (
        <Page size="LETTER" style={styles.page}>
          <Text style={styles.pageHeader}>Section 12 · Uploads</Text>
          <Text style={styles.sectionTitle}>Uploaded files</Text>
          <Text style={styles.sectionIntro}>
            Files are stored in Supabase Storage and accessible from the admin dashboard.
          </Text>
          {(['logo', 'brand_guide', 'photography', 'marketing_materials'] as const).map((cat) => {
            const list = files.filter((f) => f.category === cat);
            if (list.length === 0) return null;
            return (
              <View key={cat}>
                <Text style={styles.fileLabel}>{FILE_CATEGORY_LABELS[cat]}</Text>
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
