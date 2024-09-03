// recommendPosts.js
//sdsd
export const recommendPosts = (userPostMatrix, currentUser) => {
    const similarity = (user1, user2) => {
      const commonPosts = Object.keys(user1).filter(post => post in user2);
      if (commonPosts.length === 0) return 0;
  
      const dotProduct = commonPosts.reduce((acc, post) => acc + user1[post] * user2[post], 0);
      const magnitudeUser1 = Math.sqrt(Object.values(user1).reduce((acc, val) => acc + val ** 2, 0));
      const magnitudeUser2 = Math.sqrt(Object.values(user2).reduce((acc, val) => acc + val ** 2, 0));
  
      return dotProduct / (magnitudeUser1 * magnitudeUser2);
    };
  
    const currentUserInteractions = userPostMatrix[currentUser.patientID];
    const otherUsers = Object.keys(userPostMatrix).filter(user => user !== currentUser.patientID);
  
    const recommendations = {};
    otherUsers.forEach(user => {
      const sim = similarity(currentUserInteractions, userPostMatrix[user]);
      if (sim > 0) {
        Object.keys(userPostMatrix[user]).forEach(post => {
          if (!currentUserInteractions[post]) {
            if (!recommendations[post]) {
              recommendations[post] = 0;
            }
            recommendations[post] += sim * userPostMatrix[user][post];
          }
        });
      }
    });
  
    return Object.keys(recommendations).sort((a, b) => recommendations[b] - recommendations[a]);
  };
  