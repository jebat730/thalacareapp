import React, { useState, useEffect } from 'react';
import { View, Text, FlatList, ActivityIndicator, TouchableOpacity } from 'react-native';
import axios from 'axios';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { API_BASE_URL } from 'react-native-dotenv';
const Forum = ({ navigation }) => {
  const [forumPosts, setForumPosts] = useState([]);
  const [loading, setLoading] = useState(true);
//sdsfggdssds
  useEffect(() => {
    fetchForumPosts();
  }, []);

  const fetchForumPosts = async () => {
    try {
      const token = await AsyncStorage.getItem('token');
      const response = await axios.get(`${API_BASE_URL}/forumposts`, {
        headers: {
          Authorization: `Bearer ${token}`
        }
      });
      setForumPosts(response.data);
    } catch (error) {
      console.error('Error fetching forum posts:', error); 
    } finally {
      setLoading(false);
    }
  };

  const handleViewPost = (postId) => {
    navigation.navigate('ForumDetail', { postId });
  };

  const renderForumPost = ({ item }) => (
    <TouchableOpacity onPress={() => handleViewPost(item.id)}>
      <View>
        <Text>{item.title}</Text>
        <Text>Author: {item.author}</Text>
        <Text>Likes: {item.likes}</Text>
        <Text>Comments: {item.comments}</Text>
      </View>
    </TouchableOpacity>
  );

  if (loading) {
    return (
      <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
        <ActivityIndicator size="large" color="blue" />
      </View>
    );
  }

  return (
    <View>
      <FlatList
        data={forumPosts}
        renderItem={renderForumPost}
        keyExtractor={(item) => item.id.toString()}
      />
    </View>
  );
};

export default Forum;
