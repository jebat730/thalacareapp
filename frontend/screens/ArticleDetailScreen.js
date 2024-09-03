import React from 'react';
import { View, Text, ScrollView, StyleSheet, Image } from 'react-native';
import { globalStyle } from '../../styles/global';

const ArticleDetailScreen = ({ route }) => {
  const { article } = route.params;
//dsdsdssdsdsdsddsd
  return (
    <ScrollView style={styles.container}>
      <View style={styles.articleContainer}>
        <Image source={{ uri: article.arImages }} style={styles.articleImage} />
        <Text style={styles.articleTitle}>{article.arTitle}</Text>
        <Text style={styles.articleContent}>{article.arContent}</Text>
      </View>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
    padding: 20,
  },
  articleContainer: {
    alignItems: 'center',
  },
  articleImage: {
    width: 180,
    height: 120,
    borderRadius: 8,
    marginBottom: 10,
  },
  articleTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    marginBottom: 10,
  },
  articleContent: {
    fontSize: 16,
    lineHeight: 24,
  },
});

export default ArticleDetailScreen;
