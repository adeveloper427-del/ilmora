import { Ionicons } from '@expo/vector-icons';
import { router } from 'expo-router';
import { useState } from 'react';
import { Modal, Pressable, Text, View } from 'react-native';
import { Button } from '@/components/ui/Button';
import { LogoMark } from '@/components/ui/Logo';
import { GeometricPattern } from '@/components/ui/Pattern';
import { Screen, ScreenHeader } from '@/components/ui/Screen';
import { brand } from '@/theme/colors';
import { makeStyles, useTheme } from '@/theme/ThemeProvider';
import { fonts, radius } from '@/theme/typography';

const FREE = ['All 28 letters and letter forms', 'Letter joining and word writing', 'Quranic writing practice', 'Memorization with review', 'Listen to recitation', 'Record your reading'];
const PRO = ['Everything in Free, for every student', 'Attendance for every class', 'Hifz tracking across the madrasa', 'M-Pesa fee collection and balances', 'Monthly reports for teachers', 'Parent app with progress and fees'];

export default function Upgrade() {
  const s = useStyles();
  const { c } = useTheme();
  const [sheet, setSheet] = useState(false);

  return (
    <Screen edges={['top', 'bottom']}>
      <ScreenHeader title="Plans" />

      <View style={s.banner}>
        <GeometricPattern color={brand.gold} opacity={0.18} size={56} />
        <View style={s.bannerTop}>
          <LogoMark size={52} ring={brand.ivory} star={brand.gold} glyph={brand.emerald} />
          <View style={s.proBadge}>
            <Ionicons name="sparkles" size={12} color="#2A2112" />
            <Text style={s.proBadgeText}>PRO</Text>
          </View>
        </View>
        <Text style={s.bannerTitle}>Go Pro for your madrasa</Text>
        <Text style={s.bannerBody}>Run attendance, fees and hifz tracking for the whole madrasa — while every student keeps learning in ILMORA.</Text>
        <View style={s.priceRow}>
          <Text style={s.price}>KSh 3,000</Text>
          <Text style={s.per}> / month</Text>
        </View>
        <Text style={s.bannerNote}>One simple price per madrasa — not per student.</Text>
      </View>

      <View style={[s.plan, s.planCurrent]}>
        <View style={s.planHead}>
          <View style={{ flex: 1 }}>
            <Text style={s.planName}>Free</Text>
            <Text style={s.planFor}>For students learning on their own</Text>
          </View>
          <View style={s.currentTag}>
            <Text style={s.currentText}>Current plan</Text>
          </View>
        </View>
        <Text style={s.planPrice}>KSh 0</Text>
        {FREE.map((f) => (
          <Feature key={f} text={f} color={c.textMuted} />
        ))}
      </View>

      <View style={[s.plan, s.planPro]}>
        <View style={s.planHead}>
          <View style={{ flex: 1 }}>
            <Text style={s.planName}>ILMORA Pro</Text>
            <Text style={s.planFor}>For madrasas, teachers and parents</Text>
          </View>
          <View style={s.recTag}>
            <Text style={s.recText}>Recommended</Text>
          </View>
        </View>
        <Text style={s.planPrice}>
          KSh 3,000 <Text style={s.planPer}>/ month per madrasa</Text>
        </Text>
        {PRO.map((f) => (
          <Feature key={f} text={f} color={c.primary} strong />
        ))}
        <Button title="Upgrade to Pro" icon="sparkles" onPress={() => setSheet(true)} style={{ marginTop: 8 }} />
        <Pressable onPress={() => router.push('/madrasa')} accessibilityRole="button" style={s.link}>
          <Text style={s.linkText}>See the Pro tools</Text>
          <Ionicons name="arrow-forward" size={14} color={c.primary} />
        </Pressable>
      </View>

      <Modal visible={sheet} transparent animationType="slide" onRequestClose={() => setSheet(false)}>
        <Pressable style={s.backdrop} onPress={() => setSheet(false)} accessibilityLabel="Close" />
        <View style={s.sheet}>
          <View style={s.handle} />
          <View style={s.sheetIcon}>
            <Ionicons name="phone-portrait-outline" size={26} color={c.primary} />
          </View>
          <Text style={s.sheetTitle}>Payments are not live yet</Text>
          <Text style={s.sheetBody}>
            ILMORA Pro will be paid monthly by M-Pesa. Subscriptions are not switched on in this version, so you will not be charged. You can explore the Pro tools with example students in the meantime.
          </Text>
          <Button
            title="Preview the Pro tools"
            icon="eye-outline"
            onPress={() => {
              setSheet(false);
              router.push('/madrasa');
            }}
          />
          <Button title="Close" variant="ghost" onPress={() => setSheet(false)} />
        </View>
      </Modal>
    </Screen>
  );
}

function Feature({ text, color, strong }: { text: string; color: string; strong?: boolean }) {
  const s = useStyles();
  return (
    <View style={s.feature}>
      <Ionicons name="checkmark-circle" size={18} color={color} />
      <Text style={[s.featureText, strong && s.featureStrong]}>{text}</Text>
    </View>
  );
}

const useStyles = makeStyles((c) => ({
  banner: { backgroundColor: brand.emerald, borderRadius: radius.lg, padding: 20, overflow: 'hidden', gap: 8 },
  bannerTop: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginBottom: 4 },
  proBadge: { flexDirection: 'row', alignItems: 'center', gap: 4, backgroundColor: '#D9B871', borderRadius: radius.pill, paddingHorizontal: 10, paddingVertical: 4 },
  proBadgeText: { fontFamily: fonts.bold, fontSize: 12, letterSpacing: 1.5, color: '#2A2112' },
  bannerTitle: { fontFamily: fonts.bold, fontSize: 26, color: '#fff' },
  bannerBody: { fontFamily: fonts.regular, fontSize: 15, lineHeight: 22, color: '#DCEAE2' },
  priceRow: { flexDirection: 'row', alignItems: 'baseline', marginTop: 6 },
  price: { fontFamily: fonts.bold, fontSize: 30, color: '#E5C98A' },
  per: { fontFamily: fonts.medium, fontSize: 15, color: '#DCEAE2' },
  bannerNote: { fontFamily: fonts.regular, fontSize: 13, color: '#CFE1D6' },
  plan: { backgroundColor: c.surface, borderRadius: radius.lg, padding: 16, gap: 8, borderWidth: 1, borderColor: c.border },
  planCurrent: {},
  planPro: { borderColor: c.gold, borderWidth: 2 },
  planHead: { flexDirection: 'row', alignItems: 'flex-start', gap: 8 },
  planName: { fontFamily: fonts.bold, fontSize: 19, color: c.text },
  planFor: { fontFamily: fonts.regular, fontSize: 13, color: c.textMuted, marginTop: 2 },
  planPrice: { fontFamily: fonts.bold, fontSize: 22, color: c.text, marginVertical: 4 },
  planPer: { fontFamily: fonts.regular, fontSize: 13, color: c.textMuted },
  currentTag: { backgroundColor: c.surfaceAlt, borderRadius: radius.pill, paddingHorizontal: 10, paddingVertical: 4 },
  currentText: { fontFamily: fonts.semibold, fontSize: 11, color: c.textMuted },
  recTag: { backgroundColor: c.goldTint, borderRadius: radius.pill, paddingHorizontal: 10, paddingVertical: 4 },
  recText: { fontFamily: fonts.semibold, fontSize: 11, color: c.gold },
  feature: { flexDirection: 'row', alignItems: 'center', gap: 10 },
  featureText: { flex: 1, fontFamily: fonts.regular, fontSize: 14, color: c.textMuted },
  featureStrong: { color: c.text },
  link: { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 6, paddingVertical: 8 },
  linkText: { fontFamily: fonts.semibold, fontSize: 14, color: c.primary },
  backdrop: { flex: 1, backgroundColor: 'rgba(0,0,0,0.4)' },
  sheet: { backgroundColor: c.surface, borderTopLeftRadius: 24, borderTopRightRadius: 24, padding: 20, paddingBottom: 32, gap: 10, alignItems: 'stretch' },
  handle: { width: 40, height: 4, borderRadius: 2, backgroundColor: c.border, alignSelf: 'center', marginBottom: 6 },
  sheetIcon: { width: 56, height: 56, borderRadius: 28, backgroundColor: c.primaryTint, alignItems: 'center', justifyContent: 'center', alignSelf: 'center' },
  sheetTitle: { fontFamily: fonts.bold, fontSize: 19, color: c.text, textAlign: 'center' },
  sheetBody: { fontFamily: fonts.regular, fontSize: 14, lineHeight: 21, color: c.textMuted, textAlign: 'center', marginBottom: 6 },
}));
