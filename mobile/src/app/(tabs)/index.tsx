import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import React, { useState } from 'react';
import {
  ActivityIndicator,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import Matrix from '@/components/Matrix';
import { useAuth } from '@/contexts/auth-context';
import { apiCreateCompany, apiCreateMission, apiGetClients, apiGetMissions } from '@/services/api';
import { useTheme } from '@/hooks/use-theme';

export default function CraScreen() {
  const { user, logout } = useAuth();
  const theme = useTheme();
  const queryClient = useQueryClient();
  const isClient = user?.client === 1;

  const [missionName, setMissionName] = useState('');
  const [missionBudget, setMissionBudget] = useState('');
  const [missionRate, setMissionRate] = useState('');
  const [selectedClient, setSelectedClient] = useState<string>('');
  const [companyName, setCompanyName] = useState('');

  const { data: missions = [], isLoading } = useQuery({
    queryKey: ['missions', user?.id],
    queryFn: () => apiGetMissions(user!.id),
    enabled: !!user,
  });

  const { data: clients = [] } = useQuery({
    queryKey: ['clients'],
    queryFn: apiGetClients,
    enabled: !!user && !isClient,
  });

  const createMission = useMutation({
    mutationFn: apiCreateMission,
    onSuccess: () => {
      setMissionName(''); setMissionBudget(''); setMissionRate(''); setSelectedClient('');
      queryClient.invalidateQueries({ queryKey: ['missions', user?.id] });
    },
  });

  const createCompany = useMutation({
    mutationFn: apiCreateCompany,
    onSuccess: () => {
      setCompanyName('');
      queryClient.invalidateQueries({ queryKey: ['clients'] });
    },
  });

  const handleCreateMission = () => {
    if (!missionName.trim()) return;
    createMission.mutate({
      user_id: user!.id,
      name: missionName,
      client_id: selectedClient ? parseInt(selectedClient) : null,
      budget: missionBudget ? parseFloat(missionBudget) : null,
      rate: missionRate ? parseFloat(missionRate) : null,
    });
  };

  const handleCreateCompany = () => {
    if (!companyName.trim()) return;
    createCompany.mutate({ user_id: user!.id, name: companyName });
  };

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: theme.background }]}>
      <ScrollView contentContainerStyle={styles.scroll} showsVerticalScrollIndicator={false}>

        {/* Header */}
        <View style={styles.header}>
          <Text style={[styles.title, { color: theme.text }]}>PROJET <Text style={styles.highlight}>CRA</Text></Text>
          <Text style={[styles.userInfo, { color: theme.textSecondary }]}>
            {user?.email}{isClient ? ' (Client)' : ''}
          </Text>
        </View>

        {/* Matrice CRA */}
        <View style={styles.section}>
          {isLoading ? (
            <ActivityIndicator color="#0066cc" />
          ) : (
            <Matrix missions={missions} userId={user!.id} isClient={isClient} />
          )}
        </View>

        {/* Gestion entreprises (non-clients) */}
        {!isClient && (
          <View style={[styles.card, { backgroundColor: theme.backgroundElement, borderColor: theme.backgroundSelected }]}>
            <Text style={[styles.cardTitle, { color: theme.text }]}>Gestion des clients</Text>
            <View style={styles.row}>
              <TextInput
                style={[styles.input, { flex: 1, backgroundColor: theme.background, color: theme.text, borderColor: theme.backgroundSelected }]}
                value={companyName}
                onChangeText={setCompanyName}
                placeholder="Nom de la nouvelle entreprise..."
                placeholderTextColor={theme.textSecondary + '80'}
                editable={!createCompany.isPending}
              />
              <Pressable
                style={[styles.btn, { marginLeft: 8 }, createCompany.isPending && styles.btnDisabled]}
                onPress={handleCreateCompany}
                disabled={createCompany.isPending || !companyName.trim()}
              >
                <Text style={styles.btnText}>{createCompany.isPending ? '...' : '+ Créer'}</Text>
              </Pressable>
            </View>
          </View>
        )}

        {/* Missions */}
        <View style={[styles.card, { backgroundColor: theme.backgroundElement, borderColor: theme.backgroundSelected }]}>
          <View style={styles.row}>
            <Text style={[styles.cardTitle, { color: theme.text }]}>Missions ({missions.length})</Text>
          </View>

          {!isClient && (
            <View style={styles.createMissionForm}>
              <TextInput
                style={[styles.input, { backgroundColor: theme.background, color: theme.text, borderColor: theme.backgroundSelected }]}
                value={missionName}
                onChangeText={setMissionName}
                placeholder="Nouvelle mission..."
                placeholderTextColor={theme.textSecondary + '80'}
                editable={!createMission.isPending}
              />
              <View style={styles.row}>
                <TextInput
                  style={[styles.input, { flex: 1, backgroundColor: theme.background, color: theme.text, borderColor: theme.backgroundSelected }]}
                  value={missionBudget}
                  onChangeText={setMissionBudget}
                  placeholder="Budget (€)"
                  placeholderTextColor={theme.textSecondary + '80'}
                  keyboardType="numeric"
                  editable={!createMission.isPending}
                />
                <TextInput
                  style={[styles.input, { flex: 1, marginLeft: 8, backgroundColor: theme.background, color: theme.text, borderColor: theme.backgroundSelected }]}
                  value={missionRate}
                  onChangeText={setMissionRate}
                  placeholder="TJM (€/j)"
                  placeholderTextColor={theme.textSecondary + '80'}
                  keyboardType="numeric"
                  editable={!createMission.isPending}
                />
              </View>
              {clients.length > 0 && (
                <View style={styles.clientPicker}>
                  <Text style={[styles.label, { color: theme.textSecondary }]}>Client :</Text>
                  <ScrollView horizontal showsHorizontalScrollIndicator={false} style={{ marginTop: 6 }}>
                    <Pressable
                      style={[styles.clientChip, { backgroundColor: theme.background, borderColor: theme.backgroundSelected }, !selectedClient && styles.clientChipSelected]}
                      onPress={() => setSelectedClient('')}
                    >
                      <Text style={styles.clientChipText}>— Aucun —</Text>
                    </Pressable>
                    {clients.map((c: any) => (
                      <Pressable
                        key={c.id}
                        style={[styles.clientChip, { backgroundColor: theme.background, borderColor: theme.backgroundSelected }, selectedClient === String(c.id) && styles.clientChipSelected]}
                        onPress={() => setSelectedClient(String(c.id))}
                      >
                        <Text style={styles.clientChipText}>{c.name}</Text>
                      </Pressable>
                    ))}
                  </ScrollView>
                </View>
              )}
              <Pressable
                style={[styles.btn, createMission.isPending && styles.btnDisabled]}
                onPress={handleCreateMission}
                disabled={createMission.isPending || !missionName.trim()}
              >
                <Text style={styles.btnText}>{createMission.isPending ? 'Création...' : '+ Ajouter la mission'}</Text>
              </Pressable>
            </View>
          )}

          {isLoading && <ActivityIndicator color="#0066cc" style={{ marginTop: 12 }} />}
          {!isLoading && missions.length === 0 && (
            <Text style={[styles.empty, { color: theme.textSecondary }]}>Aucune mission trouvée.</Text>
          )}
          {missions.map((m: any) => (
            <View key={m.id} style={[styles.missionItem, { borderBottomColor: theme.backgroundSelected }]}>
              <Text style={[styles.missionName, { color: theme.text }]}>{m.name}</Text>
              {!isClient && m.company_name && (
                <Text style={[styles.missionMeta, { color: theme.textSecondary }]}>Entreprise : {m.company_name}</Text>
              )}
              {(m.budget || m.rate) && (
                <Text style={[styles.missionMeta, { color: theme.textSecondary }]}>
                  {m.budget ? `Budget : ${m.budget} €  ` : ''}
                  {m.rate ? `TJM : ${m.rate} €/j` : ''}
                </Text>
              )}
            </View>
          ))}
        </View>

        {/* Déconnexion */}
        <Pressable style={styles.logoutBtn} onPress={logout}>
          <Text style={styles.logoutText}>DÉCONNEXION</Text>
        </Pressable>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  scroll: { padding: 16, paddingBottom: 40 },
  header: { marginBottom: 20 },
  title: { fontSize: 26, fontWeight: '900' },
  highlight: { color: '#0066cc' },
  userInfo: { fontSize: 13, marginTop: 4 },
  section: { marginBottom: 20 },
  card: { borderRadius: 12, padding: 16, marginBottom: 16, borderWidth: 1 },
  cardTitle: { fontSize: 16, fontWeight: '700', marginBottom: 12 },
  row: { flexDirection: 'row', alignItems: 'center' },
  input: { borderWidth: 1, borderRadius: 8, padding: 10, fontSize: 14, marginBottom: 8 },
  label: { fontSize: 13 },
  btn: { backgroundColor: '#0066cc', borderRadius: 8, padding: 12, alignItems: 'center', marginBottom: 8 },
  btnDisabled: { opacity: 0.5 },
  btnText: { color: '#fff', fontWeight: '700', fontSize: 13 },
  createMissionForm: { marginBottom: 12 },
  clientPicker: { marginBottom: 8 },
  clientChip: { borderWidth: 1, borderRadius: 20, paddingHorizontal: 12, paddingVertical: 6, marginRight: 8 },
  clientChipSelected: { backgroundColor: '#0066cc', borderColor: '#0066cc' },
  clientChipText: { color: '#fff', fontSize: 12 },
  missionItem: { borderBottomWidth: 1, paddingVertical: 10 },
  missionName: { fontWeight: '700', fontSize: 14 },
  missionMeta: { fontSize: 12, marginTop: 2 },
  empty: { textAlign: 'center', fontSize: 13, marginTop: 8 },
  logoutBtn: { backgroundColor: '#cc2200', borderRadius: 10, padding: 16, alignItems: 'center', marginTop: 8 },
  logoutText: { color: '#fff', fontWeight: '800', fontSize: 14, letterSpacing: 1 },
});
