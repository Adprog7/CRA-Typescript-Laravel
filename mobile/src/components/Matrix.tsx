import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import React, { useEffect, useMemo, useRef, useState } from 'react';
import {
  ActivityIndicator,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from 'react-native';
import { apiGetCraWeek, apiSaveCra } from '@/services/api';
import { getWeekDates, toISOLocal } from '@/utils/getWeekDates';
import { useTheme } from '@/hooks/use-theme';

type MatrixProps = {
  missions: any[];
  userId: number;
  isClient?: boolean;
};

const toggleValue = (v: string) => {
  if (v === '') return '1';
  if (v === '1') return '0.5';
  return '';
};

export default function Matrix({ missions = [], userId, isClient = false }: MatrixProps) {
  const queryClient = useQueryClient();
  const theme = useTheme();
  const [weekOffset, setWeekOffset] = useState(0);
  const [saveMessage, setSaveMessage] = useState('');
  const timeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const week = useMemo(() => getWeekDates(weekOffset), [weekOffset]);
  const cols = week.length;
  const rows = missions.length;

  const startDate = toISOLocal(week[0].date);
  const endDate = toISOLocal(week[week.length - 1].date);

  const [matrix, setMatrix] = useState<string[][]>(() =>
    Array.from({ length: rows }, () => Array(cols).fill(''))
  );

  const { data: craEntries = [] } = useQuery({
    queryKey: ['cra', userId, startDate, endDate],
    queryFn: () => apiGetCraWeek(userId, startDate, endDate),
    enabled: missions.length > 0 && !!userId,
  });

  useEffect(() => {
    if (missions.length === 0) return;
    const newMatrix = Array.from({ length: missions.length }, () => Array(cols).fill(''));
    craEntries.forEach((entry: any) => {
      const mi = missions.findIndex((m) => m.id === entry.mission_id);
      if (mi !== -1) {
        const di = week.findIndex((d) => toISOLocal(d.date) === entry.date);
        if (di !== -1) {
          const val = parseFloat(entry.time);
          newMatrix[mi][di] = val === 1 ? '1' : val === 0.5 ? '0.5' : '';
        }
      }
    });
    setMatrix(newMatrix);
  }, [craEntries, missions, cols, week]);

  const saveMutation = useMutation({
    mutationFn: apiSaveCra,
    onMutate: () => setSaveMessage('Sauvegarde en cours...'),
    onSuccess: () => {
      setSaveMessage('CRA sauvegardé ✓');
      setTimeout(() => setSaveMessage(''), 3000);
      queryClient.invalidateQueries({ queryKey: ['cra', userId, startDate, endDate] });
      queryClient.invalidateQueries({ queryKey: ['missions'] });
    },
    onError: () => setSaveMessage('Erreur de sauvegarde'),
  });

  const handleCell = (row: number, col: number) => {
    if (isClient) return;
    const updated = matrix.map((r, i) =>
      r.map((c, j) => (i === row && j === col ? toggleValue(c) : c))
    );
    setMatrix(updated);
    setSaveMessage('En attente...');
    if (timeoutRef.current) clearTimeout(timeoutRef.current);
    timeoutRef.current = setTimeout(() => {
      const entries: any[] = [];
      updated.forEach((r, i) =>
        r.forEach((v, j) => {
          if (v !== '')
            entries.push({ mission_id: missions[i].id, date: toISOLocal(week[j].date), time: parseFloat(v) });
        })
      );
      saveMutation.mutate({ startDate, endDate, mission_ids: missions.map((m) => m.id), entries });
    }, 1000);
  };

  return (
    <View style={styles.wrapper}>
      {isClient && (
        <View style={styles.clientBadge}>
          <Text style={styles.clientBadgeText}>Vue Client — Lecture Seule</Text>
        </View>
      )}

      {/* Navigation semaine */}
      <View style={styles.nav}>
        <Pressable style={styles.navBtn} onPress={() => { setMatrix(Array.from({ length: rows }, () => Array(cols).fill(''))); setWeekOffset(w => w - 1); }}>
          <Text style={styles.navBtnText}>◀ Préc.</Text>
        </Pressable>
        {saveMessage ? <Text style={styles.saveMsg}>{saveMessage}</Text> : null}
        <Pressable style={styles.navBtn} onPress={() => { setMatrix(Array.from({ length: rows }, () => Array(cols).fill(''))); setWeekOffset(w => w + 1); }}>
          <Text style={styles.navBtnText}>Suiv. ▶</Text>
        </Pressable>
      </View>

      {/* Grille */}
      <ScrollView horizontal showsHorizontalScrollIndicator={false}>
        <View>
          {/* Header jours */}
          <View style={styles.headerRow}>
            <View style={styles.missionLabelHeader} />
            {week.map((d, i) => (
              <View key={i} style={styles.dayHeader}>
                <Text style={[styles.dayHeaderText, { color: theme.textSecondary }]}>{d.label}</Text>
              </View>
            ))}
          </View>

          {missions.length === 0 ? (
            <Text style={[styles.emptyText, { color: theme.textSecondary }]}>Aucune mission assignée.</Text>
          ) : (
            matrix.map((row, i) => (
              <View key={i} style={styles.matrixRow}>
                <View style={styles.missionLabel}>
                  <Text style={[styles.missionLabelText, { color: theme.text }]} numberOfLines={2}>{missions[i]?.name || 'Mission'}</Text>
                </View>
                {row.map((value, j) => (
                  <Pressable
                    key={j}
                    onPress={() => handleCell(i, j)}
                    style={[
                      styles.cell,
                      { backgroundColor: theme.backgroundElement, borderColor: theme.backgroundSelected },
                      value === '1' && styles.cellFull,
                      value === '0.5' && styles.cellHalf,
                    ]}
                  >
                    <Text style={styles.cellText}>{value}</Text>
                  </Pressable>
                ))}
              </View>
            ))
          )}
        </View>
      </ScrollView>
    </View>
  );
}

const CELL_SIZE = 44;
const LABEL_WIDTH = 110;

const styles = StyleSheet.create({
  wrapper: { flex: 1 },
  clientBadge: { backgroundColor: '#2c3e50', padding: 10, borderRadius: 8, marginBottom: 12 },
  clientBadgeText: { color: '#fff', fontWeight: 'bold', textAlign: 'center' },
  nav: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginBottom: 12 },
  navBtn: { backgroundColor: '#0066cc', paddingHorizontal: 14, paddingVertical: 8, borderRadius: 8 },
  navBtnText: { color: '#fff', fontWeight: '700', fontSize: 13 },
  saveMsg: { color: '#0066cc', fontSize: 12, fontWeight: '500', flex: 1, textAlign: 'center' },
  headerRow: { flexDirection: 'row', marginBottom: 4 },
  missionLabelHeader: { width: LABEL_WIDTH },
  dayHeader: { width: CELL_SIZE, alignItems: 'center', paddingVertical: 4 },
  dayHeaderText: { fontSize: 10, textAlign: 'center' },
  matrixRow: { flexDirection: 'row', marginBottom: 4, alignItems: 'center' },
  missionLabel: { width: LABEL_WIDTH, paddingRight: 6 },
  missionLabelText: { fontSize: 12 },
  cell: {
    width: CELL_SIZE,
    height: CELL_SIZE,
    borderRadius: 6,
    borderWidth: 1,
    alignItems: 'center',
    justifyContent: 'center',
    marginHorizontal: 2,
  },
  cellFull: { backgroundColor: '#0066cc', borderColor: '#0066cc' },
  cellHalf: { backgroundColor: '#0066cc55', borderColor: '#0066cc' },
  cellText: { color: '#fff', fontSize: 13, fontWeight: '700' },
  emptyText: { textAlign: 'center', marginTop: 20, fontSize: 13 },
});
