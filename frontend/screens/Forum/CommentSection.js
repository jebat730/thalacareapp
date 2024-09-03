import React, { useState, useEffect, useRef } from 'react';
import { View, StyleSheet, FlatList, Alert } from 'react-native';
import axios from 'axios';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { API_BASE_URL } from 'react-native-dotenv';
import { Text, TextInput, Button, Card, Title, Paragraph, Provider, Dialog, Portal } from 'react-native-paper';
//dsdsaasds
const CommentSection = ({ postId }) => {
  const [comment, setComment] = useState('');
  const [comments, setComments] = useState([]);
  const [currentUser, setCurrentUser] = useState(null);
  const [isEditDialogVisible, setIsEditDialogVisible] = useState(false);
  const [editCommentContent, setEditCommentContent] = useState('');
  const [editCommentId, setEditCommentId] = useState(null);
  const commentInputRef = useRef(null);

  useEffect(() => {
    const fetchComments = async () => {
      try {
        const token = await AsyncStorage.getItem('token');
        if (token) {
          const userResponse = await axios.get(`${API_BASE_URL}/currentuser`, {
            headers: { Authorization: `Bearer ${token}` }
          });
          setCurrentUser(userResponse.data);

          const response = await axios.get(`${API_BASE_URL}/comments/${postId}`, {
            headers: { Authorization: `Bearer ${token}` }
          });
          setComments(response.data);
        } else {
          console.log('Token not found');
        }
      } catch (error) {
        console.error('Error fetching comments:', error);
      }
    };

    fetchComments();
  }, [postId]);

  const handleCommentChange = (text) => {
    setComment(text);
  };

  const handleAddComment = async () => {
    try {
      if (comment.trim() !== '') {
        const token = await AsyncStorage.getItem('token');
        if (!token) {
          console.error('Token not found');
          return;
        }

        const response = await axios.post(`${API_BASE_URL}/addcomment`, {
          postId,
          comment
        }, {
          headers: { Authorization: `Bearer ${token}` }
        });

        const newComment = response.data;
        setComments(prevComments => [...prevComments, newComment]);
        setComment('');
        commentInputRef.current.clear();
      }
    } catch (error) {
      console.error('Error adding comment:', error);
    }
  };

  const confirmDeleteComment = (commentId) => {
    Alert.alert(
      'Confirm Deletion',
      'Are you sure you want to delete this comment?',
      [
        { text: 'Cancel', style: 'cancel' },
        { text: 'OK', onPress: () => handleDeleteComment(commentId) }
      ],
      { cancelable: false }
    );
  };

  const handleDeleteComment = async (commentId) => {
    try {
      const token = await AsyncStorage.getItem('token');
      if (!token) {
        console.error('Token not found');
        return;
      }

      await axios.delete(`${API_BASE_URL}/deletecomment/${commentId}`, {
        headers: { Authorization: `Bearer ${token}` }
      });

      setComments(prevComments => prevComments.filter(comment => comment.commentID !== commentId));
    } catch (error) {
      console.error('Error deleting comment:', error);
    }
  };

  const handleEditComment = (comment) => {
    setEditCommentContent(comment.commentContent);
    setEditCommentId(comment.commentID);
    setIsEditDialogVisible(true);
  };

  const saveEditComment = async () => {
    try {
      const token = await AsyncStorage.getItem('token');
      if (token && editCommentId) {
        await axios.put(`${API_BASE_URL}/editcomment/${editCommentId}`, {
          commentContent: editCommentContent
        }, {
          headers: { Authorization: `Bearer ${token}` }
        });

        setComments(prevComments => prevComments.map(comment =>
          comment.commentID === editCommentId ? { ...comment, commentContent: editCommentContent } : comment
        ));

        setIsEditDialogVisible(false);
        setEditCommentContent('');
        setEditCommentId(null);
      } else {
        console.log('Token not found or missing edit data');
      }
    } catch (error) {
      console.error('Error editing comment:', error);
    }
  };

  const renderItem = ({ item }) => (
    <Card style={styles.commentCard}>
      <Card.Content>
        <View style={styles.commentHeader}>
          <Paragraph style={styles.commentUsername}>{item.patient_username}</Paragraph>
          {currentUser && currentUser.username === item.patient_username && (
            <Button
              mode="text"
              onPress={() => confirmDeleteComment(item.commentID)}
              style={styles.deleteButton}
            >
              Delete
            </Button>
          )}
        </View>
        <Paragraph style={styles.comment}>{item.commentContent}</Paragraph>
      </Card.Content>
    </Card>
  );

  return (
    <Provider>
      <View style={styles.commentSection}>
        <Title style={styles.commentHeader}>Comments</Title>
        <FlatList
          data={comments}
          renderItem={renderItem}
          keyExtractor={(item) => item.commentID.toString()}
          style={styles.commentList}
        />
        <View style={styles.commentInputContainer}>
          <TextInput
            ref={commentInputRef}
            style={styles.commentInput}
            label="Add a comment..."
            value={comment}
            onChangeText={handleCommentChange}
            mode="outlined"
          />
          <Button
            mode="contained"
            onPress={handleAddComment}
            style={styles.commentButton}
          >
            Post
          </Button>
        </View>
        <Portal>
          <Dialog visible={isEditDialogVisible} onDismiss={() => setIsEditDialogVisible(false)}>
            <Dialog.Title>Edit Comment</Dialog.Title>
            <Dialog.Content>
              <TextInput
                label="Edit Comment"
                value={editCommentContent}
                onChangeText={setEditCommentContent}
                mode="outlined"
                multiline
                numberOfLines={3}
                style={{ height: 80 }}
              />
            </Dialog.Content>
            <Dialog.Actions>
              <Button onPress={() => setIsEditDialogVisible(false)}>Cancel</Button>
              <Button onPress={saveEditComment}>Save</Button>
            </Dialog.Actions>
          </Dialog>
        </Portal>
      </View>
    </Provider>
  );
};

const styles = StyleSheet.create({
  commentSection: {
    flex: 1,
    marginTop: 20,
    paddingHorizontal: 20,
  },
  commentHeader: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 15,
  },
  commentList: {
    flex: 1,
    marginBottom: 15,
    backgroundColor: '#f9f9f9',
    borderRadius: 10,
    padding: 10,
  },
  commentCard: {
    marginBottom: 10,
  },
  commentHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  commentUsername: {
    fontWeight: 'bold',
    fontSize: 14,
    marginBottom: 5,
  },
  comment: {
    fontSize: 14,
  },
  commentInputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 10,
  },
  commentInput: {
    flex: 1,
    marginRight: 10,
  },
  commentButton: {
    justifyContent: 'center',
  },
  deleteButton: {
    marginTop: 5,
  },
});

export default CommentSection;
