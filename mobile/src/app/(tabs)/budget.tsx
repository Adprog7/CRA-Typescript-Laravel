import { useQuery } from '@tanstack/react-query';
import React, { useState } from 'react';
import { ActivityIndicator, Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useAuth } from '@/contexts/auth-context';
import { apiGetMissionMonthly, apiGetMissions } from '@/services/api';
import { useTheme } from '@/hooks/use-theme';

function MissionDetails({ missionId }: { missionId: number }) {
  const theme = useTheme();
  const { data = [], isLoading } = useQuery({
    queryKey: ['monthlyStats', missionId],
    queryFn: () => apiGetMissionMonthly(missionId),
  });

  if (isLoading) return <ActivityIndicator color="#0066cc" size="small" />;
  if (data.length === 0) return <Text style={[styles.emptyText, { color: theme.textSecondary }]}>Aucune donnée.</Text>;

  return (
    <View>
      <View style={[styles.tableHeader, { borderBottomColor: theme.backgroundSelected }]}>
        {['Mois', 'Jours', 'Montant'].map((h) => (
          <Text key={h} style={[styles.tableHeaderCell, { color: theme.textSecondary }]}>{h}</Text>
        ))}
      </View>
      {data.map((stat: any, i: number) => (
        <View key={i} style={[styles.tableRow, { borderBottomColor: theme.backgroundSelected }]}>
          <Text style={[styles.tableCell, { color: theme.textSecondary }]}>{stat.month}</Text>
          <Text style={[styles.tableCellBold, { color: theme.text }]}>{parseFloat(stat.total_days).toFixed(1)} j</Text>
          <Text style={[styles.tableCellBold, { color: theme.text }]}>{parseFloat(stat.cost).toFixed(0)} €</Text>
        </View>
      ))}
    </View>
  );
}

export default function BudgetScreen() {
  const { user } = useAuth();
  const theme = useTheme();
  const [expanded, setExpanded] = useState<Set<number>>(new Set());

  const { data: missions = [], isLoading } = useQuery({
    queryKey: ['missions', user?.id],
    queryFn: () => apiGetMissions(user!.id),
    enabled: !!user,
  });

  const withBudget = missions.filter((m: any) => m.budget && m.rate);
  const globalBudgetDays = withBudget.reduce((a: number, m: any) => a + parseFloat(m.budget) / parseFloat(m.rate), 0);
  const globalLogged = withBudget.reduce((a: number, m: any) => a + (parseFloat(m.total_days_logged) || 0), 0);
  const globalBudgetEur = withBudget.reduce((a: number, m: any) => a + parseFloat(m.budget), 0);
  const globalLoggedEur = withBudget.reduce((a: number, m: any) => a + (parseFloat(m.total_days_logged) || 0) * parseFloat(m.rate), 0);

  const toggle = (id: number) => {
    const s = new Set(expanded);
    s.has(id) ? s.delete(id) : s.add(id);
    setExpanded(s);
  };

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: theme.background }]}>
      <ScrollView contentContainerStyle={styles.scroll} showsVerticalScrollIndicator={false}>
        <Text style={[styles.title, { color: theme.text }]}>Résumé des <Text style={styles.highlight}>Budgets</Text></Text>

        {/* Synthèse globale */}
        <View style={[styles.globalCard, { backgroundColor: theme.backgroundElement, borderColor: theme.backgroundSelected }]}>
          <Text style={styles.globalTitle}>Synthèse Globale</Text>
          <View style={styles.globalRow}>
            <Text style={[styles.globalLabel, { color: theme.textSecondary }]}>Budget total</Text>
            <Text style={[styles.globalValue, { color: theme.text }]}>{globalBudgetDays.toFixed(1)} j  <Text style={styles.muted}>({globalBudgetEur.toFixed(0)} €)</Text></Text>
          </View>
          <View style={styles.globalRow}>
            <Text style={[styles.globalLabel, { color: theme.textSecondary }]}>Total dépensé</Text>
            <Text style={[styles.globalValue, { color: theme.text }]}>{globalLogged.toFixed(1)} j  <Text style={styles.muted}>({globalLoggedEur.toFixed(0)} €)</Text></Text>
          </View>
          <View style={styles.globalRow}>
            <Text style={[styles.globalLabel, { color: theme.textSecondary }]}>Reste à placer</Text>
            <Text style={[styles.globalValue, { color: globalBudgetDays - globalLogged <= 0 ? '#dc3545' : '#0066cc' }]}>
              {Math.max(0, globalBudgetDays - globalLogged).toFixed(1)} j
            </Text>
          </View>
        </View>

        <Text style={[styles.sectionTitle, { color: theme.text }]}>Détail par Mission</Text>

        {isLoading && <ActivityIndicator color="#0066cc" />}
        {!isLoading && withBudget.length === 0 && (
          <Text style={[styles.emptyText, { color: theme.textSecondary }]}>Aucune mission avec budget défini.</Text>
        )}

        {withBudget.map((mission: any) => {
          const totalDays = parseFloat(mission.budget) / parseFloat(mission.rate);
          const logged = parseFloat(mission.total_days_logged || 0);
          const remaining = Math.max(0, totalDays - logged);
          const ratio = Math.min(1, logged / totalDays);
          const loggedEur = logged * parseFloat(mission.rate);
          const remainingEur = parseFloat(mission.budget) - loggedEur;
          const isExp = expanded.has(mission.id);
          const barColor = ratio >= 1 ? '#dc3545' : ratio > 0.8 ? '#ffc107' : '#0066cc';

          return (
            <View key={mission.id} style={[styles.missionCard, { backgroundColor: theme.backgroundElement, borderColor: theme.backgroundSelected }]}>
              <View style={styles.missionHeader}>
                <Text style={[styles.missionName, { color: theme.text }]}>{mission.name}</Text>
                <Pressable style={[styles.detailBtn, isExp && styles.detailBtnAlt]} onPress={() => toggle(mission.id)}>
                  <Text style={[styles.detailBtnText, isExp && { color: '#333' }]}>{isExp ? 'Masquer' : 'Détail'}</Text>
                </Pressable>
              </View>

              <View style={styles.metaRow}>
                {[
                  `Budget : ${mission.budget} €`,
                  `TJM : ${mission.rate} €/j`,
                  `Dépensé : ${loggedEur.toFixed(0)} €`,
                  `Reste : ${remainingEur.toFixed(0)} €`,
                ].map((t) => <Text key={t} style={[styles.metaText, { color: theme.textSecondary }]}>{t}</Text>)}
              </View>

              <View style={[styles.progressContainer, { backgroundColor: theme.background, borderColor: theme.backgroundSelected }]}>
                <View style={styles.progressLegend}>
                  <Text style={[styles.progressText, { color: theme.textSecondary }]}>Placés : {logged.toFixed(1)} j</Text>
                  <Text style={[styles.progressText, { color: remaining <= 0 ? '#dc3545' : '#0066cc' }]}>
                    Restant : {remaining.toFixed(1)} / {totalDays.toFixed(1)} j
                  </Text>
                </View>
                <View style={styles.progressBar}>
                  <View style={[styles.progressFill, { width: `${ratio * 100}%` as any, backgroundColor: barColor }]} />
                </View>
              </View>

              {isExp && (
                <View style={[styles.details, { borderTopColor: theme.backgroundSelected }]}>
                  <Text style={[styles.detailsTitle, { color: theme.textSecondary }]}>Répartition mensuelle</Text>
                  <MissionDetails missionId={mission.id} />
                </View>
              )}
            </View>
          );
        })}
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  scroll: { padding: 16, paddingBottom: 40 },
  title: { fontSize: 24, fontWeight: '900', marginBottom: 16 },
  highlight: { color: '#0066cc' },
  globalCard: { borderRadius: 12, padding: 16, marginBottom: 20, borderWidth: 1 },
  globalTitle: { color: '#0066cc', fontWeight: '700', fontSize: 15, marginBottom: 10 },
  globalRow: { flexDirection: 'row', justifyContent: 'space-between', marginBottom: 6 },
  globalLabel: { fontSize: 13 },
  globalValue: { fontWeight: '700', fontSize: 13 },
  muted: { color: '#666' },
  sectionTitle: { fontWeight: '700', fontSize: 16, marginBottom: 12 },
  missionCard: { borderRadius: 12, padding: 16, marginBottom: 12, borderLeftWidth: 4, borderLeftColor: '#0066cc', borderWidth: 1 },
  missionHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 10 },
  missionName: { fontWeight: '700', fontSize: 15, flex: 1 },
  detailBtn: { backgroundColor: '#0066cc', paddingHorizontal: 10, paddingVertical: 5, borderRadius: 6 },
  detailBtnAlt: { backgroundColor: '#f0f0f0' },
  detailBtnText: { color: '#fff', fontSize: 12, fontWeight: '700' },
  metaRow: { flexDirection: 'row', flexWrap: 'wrap', gap: 8, marginBottom: 12 },
  metaText: { fontSize: 12 },
  progressContainer: { borderRadius: 8, padding: 12, borderWidth: 1 },
  progressLegend: { flexDirection: 'row', justifyContent: 'space-between', marginBottom: 8 },
  progressText: { fontSize: 12 },
  progressBar: { height: 10, backgroundColor: '#333', borderRadius: 5, overflow: 'hidden' },
  progressFill: { height: '100%', borderRadius: 5 },
  details: { marginTop: 16, borderTopWidth: 1, paddingTop: 12 },
  detailsTitle: { fontWeight: '700', fontSize: 13, marginBottom: 8 },
  tableHeader: { flexDirection: 'row', borderBottomWidth: 1, paddingBottom: 6, marginBottom: 6 },
  tableHeaderCell: { flex: 1, fontSize: 12, fontWeight: '700' },
  tableRow: { flexDirection: 'row', paddingVertical: 6, borderBottomWidth: 1 },
  tableCell: { flex: 1, fontSize: 12 },
  tableCellBold: { flex: 1, fontWeight: '700', fontSize: 12 },
  emptyText: { fontSize: 13, textAlign: 'center', marginTop: 8 },
});
