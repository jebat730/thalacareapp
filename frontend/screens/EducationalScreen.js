import React, { useState, useEffect } from 'react';
import { View, Text, ScrollView, StyleSheet, TouchableOpacity, Image, Linking } from 'react-native';
import { globalStyle } from '../../styles/global';
import Card from '../shared/card';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { API_BASE_URL } from 'react-native-dotenv';

const EducationalScreen = ({ navigation }) => {
  const [articles, setArticles] = useState([]);
//ddfdfcdsassdsddsds
  useEffect(() => {
    fetchArticles();
  }, []);

  const fetchArticles = async () => {
    try {
      const response = await fetch(`${API_BASE_URL}/articles`);
      const data = await response.json();
      if (data && data.length > 0) {
        setArticles(data);
      } else {
        console.error('No articles found in API response');
      }
    } catch (error) {
      console.error('Error fetching articles:', error);
    }
  };

  const handleButtonClick = () => {
    Linking.openURL('https://www.cdc.gov/ncbddd/thalassemia/facts.html');
  };

  const handleEmergencyCareClick = () => {
    navigation.navigate('Emergo', { dataType: 'emergency' });
  };
  
  const handleTreatmentClick = () => {
    navigation.navigate('Emergo', { dataType: 'symptoms' });
  };

  const handleArticlePress = (article) => {
    navigation.navigate('ArticleDetailScreen', { article });
  };

  return (
    <ScrollView style={styles.container}>
      <View style={styles.sectionContainer}>
        {/* About Thalassemia Section */}
        <View style={styles.sectionHeader}>
          <MaterialCommunityIcons name="information" size={24} color="black" style={styles.icon} />
          <View>
            <Text style={[globalStyle.titleText, styles.sectionTitle]}>
              About Thalassemia
            </Text>
            <Text style={styles.sectionDescription}>
              Education about Thalassemia
            </Text>
          </View>
        </View>
        <CardWithImageAndButton
          imageSource={require('../../assets/images/undraw_Reading_time_re_phf7.png')}
          title={'What is Thalassemia?'}
          description={'Thalassemia is a genetic blood disorder that affects the production of hemoglobin.'}
          buttonText={'Learn More'}
          onPress={handleButtonClick}
        />
      </View>

      {/* Emergency and Symptoms Sections */}
      <View style={styles.sectionHeader}>
        <MaterialCommunityIcons name="information" size={24} color="black" style={styles.icon} />
        <View>
          <Text style={[globalStyle.titleText, styles.sectionTitle]}>
            Emergo
          </Text>
          <Text style={styles.sectionDescription}>
            Guideline & How to Treat Thalassemia
          </Text>
        </View>
      </View>
      <Card>
        <TouchableOpacity onPress={handleEmergencyCareClick}>
          <View style={styles.subSection}>
            <Text style={styles.subSectionTitle}>How to Handle a Thalassemia Emergency</Text>
          </View>
        </TouchableOpacity>
      </Card>
      <Card>
        <TouchableOpacity onPress={handleTreatmentClick}>
          <View style={styles.subSection}>
            <Text style={styles.subSectionTitle}>Thalassemia Symptoms</Text>
          </View>
        </TouchableOpacity>
      </Card>

      {/* Article Section */}
      <View style={styles.sectionHeader}>
        <MaterialCommunityIcons name="information" size={24} color="black" style={styles.icon} />
        <View>
          <Text style={[globalStyle.titleText, styles.sectionTitle]}>
            Articles
          </Text>
          <Text style={styles.sectionDescription}>
            News & information on Thalassemia
          </Text>
        </View>
      </View>
      <ScrollView horizontal={true}>
        <View style={styles.articleContainer}>
          {articles.map((article, index) => (
            <TouchableOpacity key={index} onPress={() => handleArticlePress(article)}>
              <View style={styles.articleBox}>
                <Image source={{ uri: article.arImages }} style={styles.articleImage} />
                <Text style={styles.articleTitle}>{article.arTitle}</Text>
              </View>
            </TouchableOpacity>
          ))}
        </View>
      </ScrollView>
    </ScrollView>
  );
};

const CardWithImageAndButton = ({ imageSource, title, description, buttonText, onPress }) => (
  <TouchableOpacity onPress={onPress} style={styles.cardContainer}>
    <View style={styles.rowContainer}>
      <View style={styles.imageContainer}>
        <Image source={imageSource} style={styles.image} />
      </View>
      <View style={styles.textContent}>
        <Text style={[globalStyle.titleText, styles.titleText]}>{title}</Text>
        <Text style={styles.sectionContent}>{description}</Text>
        <TouchableOpacity onPress={onPress} style={styles.button}>
          <Text style={styles.buttonText}>{buttonText}</Text>
        </TouchableOpacity>
      </View>
    </View>
  </TouchableOpacity>
);

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
    padding: 20,
  },
  sectionContainer: {
    marginBottom: 20,
  },
  sectionHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 10,
  },
  icon: {
    marginRight: 10,
  },
  sectionTitle: {
    fontSize: 20,
  },
  sectionDescription: {
    fontSize: 12,
    marginBottom: 10,
    color: '#666',
  },
  cardContainer: {
    marginBottom: 20,
    borderWidth: 1,
    borderColor: '#ccc',
    borderRadius: 10,
  },
  rowContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 15,
  },
  imageContainer: {
    marginRight: 15,
  },
  image: {
    width: 100,
    height: 100,
    borderRadius: 10,
  },
  textContent: {
    flex: 1,
  },
  titleText: {
    fontSize: 20,
    marginBottom: 5,
  },
  sectionContent: {
    fontSize: 16,
    lineHeight: 24,
    marginBottom: 10,
  },
  button: {
    backgroundColor: '#007bff',
    paddingVertical: 10,
    paddingHorizontal: 20,
    borderRadius: 5,
    marginTop: 10,
  },
  buttonText: {
    color: '#fff',
    fontSize: 16,
    textAlign: 'center',
  },
  subSectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 5,
    color: '#333',
  },
  subSectionContent: {
    fontSize: 16,
    color: '#666'
  },
  articleContainer: {
    flexDirection: 'row',
    paddingVertical: 10,
    paddingHorizontal: 5,
  },
  articleBox: {
    backgroundColor: '#f0f0f0',
    borderRadius: 10,
    padding: 10,
    marginRight: 10,
    width: 200,
  },
  articleTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    marginBottom: 5,
  },
  articleImage: {
    width: 180,
    height: 120,
    borderRadius: 8,
    marginBottom: 5,
  },
  articleContent: {
    fontSize: 14,
  },
});

export default EducationalScreen;
