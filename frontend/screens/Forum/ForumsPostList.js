import React, { useEffect, useState } from 'react';
import { View, FlatList, RefreshControl, Alert } from 'react-native';
import { Appbar, Button, Dialog, Portal, TextInput, Card, Title, Paragraph, IconButton, Menu, Provider } from 'react-native-paper';
import axios from 'axios';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { API_BASE_URL } from 'react-native-dotenv';
import CommentSection from './CommentSection';
import { fetchInteractions } from './fetchInteractions';
import { preprocessInteractions } from './preprocessInteractions';
import { recommendPosts } from './recommendPosts';
//sdsdssdsdfsdsds
const ForumPostList = () => {
  const [posts, setPosts] = useState([]);
  const [currentUser, setCurrentUser] = useState(null);
  const [isDialogVisible, setIsDialogVisible] = useState(false);
  const [newPostContent, setNewPostContent] = useState('');
  const [forumTitle, setForumTitle] = useState('');
  const [likes, setLikes] = useState({});
  const [commentVisibility, setCommentVisibility] = useState({});
  const [refreshing, setRefreshing] = useState(false);
  const [isEditDialogVisible, setIsEditDialogVisible] = useState(false);
  const [editPostContent, setEditPostContent] = useState('');
  const [editForumTitle, setEditForumTitle] = useState('');
  const [editPostId, setEditPostId] = useState(null);
  const [visibleMenu, setVisibleMenu] = useState(null);
  const [recommendedPosts, setRecommendedPosts] = useState([]);

  const fetchCurrentUser = async () => {
    try {
      const token = await AsyncStorage.getItem('token');
      if (token) {
        const response = await axios.get(`${API_BASE_URL}/currentuser`, {
          headers: {
            Authorization: `Bearer ${token}`
          }
        });
        setCurrentUser(response.data);
      } else {
        console.log('Token not found');
      }
    } catch (error) {
      console.error('Error fetching current user:', error);
    }
  };

  const fetchPosts = async () => {
    try {
      const token = await AsyncStorage.getItem('token');
      if (token) {
        const response = await axios.get(`${API_BASE_URL}/forumpostlist`, {
          headers: {
            Authorization: `Bearer ${token}`
          }
        });
       
        if (response.status === 200) {
          setPosts(response.data);
          const initialLikes = {};
          const initialCommentVisibility = {};
          response.data.forEach(post => {
            initialLikes[post.postID] = post.likes || 0;
            initialCommentVisibility[post.postID] = false;
          });
          setLikes(initialLikes);
          setCommentVisibility(initialCommentVisibility);
        } else {
          console.error('Error fetching posts:', response.status, response.statusText);
        }
      } else {
        console.log('Token not found');
      }
    } catch (error) {
      console.error('Error fetching forum posts:', error);
    }
  };

  const onRefresh = async () => {
    setRefreshing(true);
    await fetchPosts();
    setRefreshing(false);
  };

  useEffect(() => {
    fetchAndRecommendPosts();
  }, []);

  const fetchAndRecommendPosts = async () => {
    await fetchCurrentUser();
    await fetchPosts();
    const interactions = await fetchInteractions();
    const userPostMatrix = preprocessInteractions(interactions);
    if (currentUser) {
      const recommendations = recommendPosts(userPostMatrix, currentUser);
      
      setRecommendedPosts(recommendations);
    }
  };

  const toggleDialog = () => {
    setIsDialogVisible(!isDialogVisible);
  };

  const createForumPost = async () => {
    try {
      const token = await AsyncStorage.getItem('token');
      if (token && forumTitle && newPostContent) {
        const response = await axios.post(`${API_BASE_URL}/createforumpost`, {
          forumTitle,
          postContent: newPostContent
        }, {
          headers: {
            Authorization: `Bearer ${token}`
          }
        });
        if (response.status === 200) {
          setIsDialogVisible(false);
          setForumTitle('');
          setNewPostContent('');
          fetchAndRecommendPosts(); // Fetch posts again to refresh the list
        }
      } else {
        console.log('Token not found or missing forumTitle/postContent');
      }
    } catch (error) {
      console.error('Error creating forum post:', error);
    }
  };

  const handleLike = async (postId) => {
    try {
      const token = await AsyncStorage.getItem('token');
      if (token) {
        const response = await axios.post(`${API_BASE_URL}/likepost`, {
          postId
        }, {
          headers: {
            Authorization: `Bearer ${token}`
          }
        });
        if (response.data.message === 'Forum post liked successfully') {
          setLikes(prevLikes => ({
            ...prevLikes,
            [postId]: prevLikes[postId] + 1
          }));
        } else if (response.data.message === 'Forum post unliked successfully') {
          setLikes(prevLikes => ({
            ...prevLikes,
            [postId]: prevLikes[postId] - 1
          }));
        }
      } else {
        console.log('Token not found');
      }
    } catch (error) {
      console.error('Error liking forum post:', error);
    }
  };

  const toggleComments = (postId) => {
    setCommentVisibility(prevVisibility => ({
      ...prevVisibility,
      [postId]: !prevVisibility[postId]
    }));
  };

  const confirmDeletePost = (postId) => {
    Alert.alert(
      'Confirm Deletion',
      'Are you sure you want to delete this post?',
      [
        { text: 'Cancel', style: 'cancel' },
        { text: 'OK', onPress: () => deletePost(postId) }
      ],
      { cancelable: false }
    );
  };

  const deletePost = async (postId) => {
    try {
      const token = await AsyncStorage.getItem('token');
      if (token) {
        await axios.delete(`${API_BASE_URL}/deleteforumpost/${postId}`, {
          headers: {
            Authorization: `Bearer ${token}`
          }
        });
        fetchPosts();
      } else {
        console.log('Token not found');
      }
    } catch (error) {
      console.error('Error deleting forum post:', error);
    }
  };

  const editPost = (post) => {
    setEditForumTitle(post.forumTitle);
    setEditPostContent(post.postContent);
    setEditPostId(post.postID);
    setIsEditDialogVisible(true);
  };

  const saveEditPost = async () => {
    try {
      const token = await AsyncStorage.getItem('token');
      if (token && editPostId) {
        await axios.put(`${API_BASE_URL}/editforumpost/${editPostId}`, {
          forumTitle: editForumTitle,
          postContent: editPostContent
        }, {
          headers: {
            Authorization: `Bearer ${token}`
          }
        });
        fetchPosts();
        setIsEditDialogVisible(false);
        setEditForumTitle('');
        setEditPostContent('');
        setEditPostId(null);
      } else {
        console.log('Token not found or missing edit data');
      }
    } catch (error) {
      console.error('Error editing forum post:', error);
    }
  };

  const openMenu = (postId) => setVisibleMenu(postId);

  const closeMenu = () => setVisibleMenu(null);

  return (
    <Provider>
      <View style={{ flex: 1 }}>
        <Appbar.Header>
          <Appbar.Content title="Forum Posts" />
          <Appbar.Action icon="plus" onPress={toggleDialog} />
        </Appbar.Header>
        <FlatList
          data={posts}
          keyExtractor={item => item.postID.toString()}
          renderItem={({ item }) => (
            <Card style={{ margin: 10 }}>
              <Card.Title
                title={item.patient_username}
                right={(props) => (
                  currentUser && currentUser.username === item.patient_username && (
                    <Menu
                      visible={visibleMenu === item.postID}
                      onDismiss={closeMenu}
                      anchor={<IconButton icon="dots-vertical" onPress={() => openMenu(item.postID)} />}
                    >
                      <Menu.Item onPress={() => editPost(item)} title="Edit" />
                      <Menu.Item onPress={() => confirmDeletePost(item.postID)} title="Delete" />
                    </Menu>
                  )
                )}
              />
              <Card.Content>
                <Title>{item.forumTitle}</Title>
                <Paragraph>{item.postContent}</Paragraph>
              </Card.Content>
              <Card.Actions>
                <Button onPress={() => handleLike(item.postID)}>
                  👍 {likes[item.postID]}
                </Button>
                <Button onPress={() => toggleComments(item.postID)}>
                  💬 Comment
                </Button>
              </Card.Actions>
              {commentVisibility[item.postID] && <CommentSection postId={item.postID} />}
            </Card>
          )}
          refreshControl={
            <RefreshControl
              refreshing={refreshing}
              onRefresh={fetchAndRecommendPosts}
            />
          }
        />
        <Portal>
          <Dialog visible={isDialogVisible} onDismiss={toggleDialog}>
            <Dialog.Title>Create New Post</Dialog.Title>
            <Dialog.Content>
              <TextInput
                label="Forum Title"
                value={forumTitle}
                onChangeText={setForumTitle}
                mode="outlined"
                style={{ marginBottom: 10 }}
              />
              <TextInput
                label="Post Content"
                value={newPostContent}
                onChangeText={setNewPostContent}
                mode="outlined"
                multiline
                numberOfLines={5}
                style={{ height: 100 }}
              />
            </Dialog.Content>
            <Dialog.Actions>
              <Button onPress={toggleDialog}>Cancel</Button>
              <Button onPress={createForumPost}>Post</Button>
            </Dialog.Actions>
          </Dialog>
          <Dialog visible={isEditDialogVisible} onDismiss={() => setIsEditDialogVisible(false)}>
            <Dialog.Title>Edit Post</Dialog.Title>
            <Dialog.Content>
              <TextInput
                label="Forum Title"
                value={editForumTitle}
                onChangeText={setEditForumTitle}
                mode="outlined"
                style={{ marginBottom: 10 }}
              />
              <TextInput
                label="Post Content"
                value={editPostContent}
                onChangeText={setEditPostContent}
                mode="outlined"
                multiline
                numberOfLines={5}
                style={{ height: 100 }}
              />
            </Dialog.Content>
            <Dialog.Actions>
              <Button onPress={() => setIsEditDialogVisible(false)}>Cancel</Button>
              <Button onPress={saveEditPost}>Save</Button>
            </Dialog.Actions>
          </Dialog>
        </Portal>
      </View>
    </Provider>
  );
};

export default ForumPostList;
