import React from 'react';
import { View, StyleSheet, Dimensions, TouchableOpacity } from 'react-native';
import { Card, Title, Provider as PaperProvider, DefaultTheme } from 'react-native-paper';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';
//dsd
const PersonalHealth = ({ navigation }) => {
  const data = [
    { id: '1', title: 'Iron Level', icon: 'test-tube' },
    { id: '2', title: 'Status', icon: 'heart' },
    { id: '3', title: 'Blood Transfusion', icon: 'blood-bag' },
    { id: '4', title: 'Medications', icon: 'pill' },
    { id: '5', title: 'Report', icon: 'file-document' }, // Moved Report to the last
  ];

  const navigateToPage = (pageName) => {
    switch (pageName) {
      case 'Iron Level':
        navigation.navigate('IronLevelPage');
        break;
      case 'Report':
        navigation.navigate('ReportPage');
        break;
      case 'Status':
        navigation.navigate('StatusPage');
        break;
      case 'Blood Transfusion':
        navigation.navigate('BloodTransfusion');
        break;
      case 'Medications':
        navigation.navigate('MedicationPage');
        break;
      default:
        break;
    }
  };

  const renderCardItem = ({ item }) => (
    <TouchableOpacity key={item.id} onPress={() => navigateToPage(item.title)} style={styles.cardItem}>
      <Card style={styles.card}>
        <View style={styles.iconContainer}>
          <Icon name={item.icon} size={40} style={styles.icon} />
        </View>
        <Card.Content style={styles.cardContent}>
          <Title style={styles.cardTitle}>{item.title}</Title>
        </Card.Content>
      </Card>
    </TouchableOpacity>
  );
  

  return (
    <PaperProvider theme={theme}>
      <View style={styles.container}>
        <Title style={styles.header}>Personal Health Journal</Title>
        <View style={styles.cardsContainer}>
          {data.map((item) => renderCardItem({ item }))}
        </View>
      </View>
    </PaperProvider>
  );
};

const windowWidth = Dimensions.get('window').width;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f8f9fa',
    padding: 20,
  },
  header: {
    fontSize: 24,
    textAlign: 'center',
    marginBottom: 20,
    fontWeight: 'bold',
    color: '#334257',
  },
  cardsContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
  },
  card: {
    marginVertical: 10,
    width: windowWidth * 0.45,
    backgroundColor: '#fff',
    borderRadius: 15,
    elevation: 4,
    overflow: 'hidden',
  },
  iconContainer: {
    backgroundColor: '#334257',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 20,
  },
  icon: {
    color: '#fff',
  },
  cardContent: {
    alignItems: 'center',
    padding: 10,
  },
  cardTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#334257',
  },
  cardItem: {
    marginBottom: 20,
  },
});

const theme = {
  ...DefaultTheme,
  colors: {
    ...DefaultTheme.colors,
    primary: '#334257',
    accent: '#334257',
  },
};

export default PersonalHealth;
