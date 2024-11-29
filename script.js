// Firebase Configuration
const firebaseConfig = {
    apiKey: "AIzaSyByF4dko6o7aIk-UV-Fvg5vZTr-3qdEybE",
    authDomain: "letschat-d284a.firebaseapp.com",
    projectId: "letschat-d284a",
    storageBucket: "letschat-d284a.firebasestorage.app",
    messagingSenderId: "961555388673",
    appId: "1:961555388673:web:f6329669a99458ab13e300",
    measurementId: "G-HLCV3P8Y1P"
  };
  
  // Initialize Firebase
  firebase.initializeApp(firebaseConfig);
  const auth = firebase.auth();
  const db = firebase.firestore();
  
  // DOM Elements
  const authSection = document.getElementById("auth-section");
  const chatSection = document.getElementById("chat-section");
  const currentUserSpan = document.getElementById("current-user");
  const chatWindow = document.getElementById("chat-window");
  const receiverInput = document.getElementById("receiver");
  const messageInput = document.getElementById("message-input");
  const authError = document.getElementById("auth-error");
  const chatError = document.getElementById("chat-error");
  
  // Clear error messages
  function clearErrors() {
      authError.textContent = "";
      chatError.textContent = "";
  }
  
  // Signup
  document.getElementById("signup-btn").addEventListener("click", () => {
      clearErrors();
      const email = document.getElementById("email").value.trim();
      const password = document.getElementById("password").value.trim();
  
      if (!email || !password) {
          authError.textContent = "Please provide both email and password.";
          return;
      }
  
      auth.createUserWithEmailAndPassword(email, password)
          .then(() => alert("Signup successful!"))
          .catch(err => authError.textContent = err.message);
  });
  
  // Login
  document.getElementById("login-btn").addEventListener("click", () => {
      clearErrors();
      const email = document.getElementById("email").value.trim();
      const password = document.getElementById("password").value.trim();
  
      if (!email || !password) {
          authError.textContent = "Please provide both email and password.";
          return;
      }
  
      auth.signInWithEmailAndPassword(email, password)
          .then(user => {
              currentUserSpan.textContent = user.user.email;
              authSection.style.display = "none";
              chatSection.style.display = "block";
              listenForMessages(user.user.email);
          })
          .catch(err => authError.textContent = err.message);
  });
  
  // Logout
  document.getElementById("logout-btn").addEventListener("click", () => {
      auth.signOut().then(() => {
          authSection.style.display = "block";
          chatSection.style.display = "none";
      });
  });
  
  // Send Message
  document.getElementById("send-btn").addEventListener("click", () => {
      clearErrors();
      const sender = auth.currentUser.email;
      const receiver = receiverInput.value.trim();
      const content = messageInput.value.trim();
  
      if (!receiver || !content) {
          chatError.textContent = "Please provide both recipient and message content.";
          return;
      }
  
      db.collection("messages").add({
          sender,
          receiver,
          content,
          status: "Sent", // Default status
          timestamp: firebase.firestore.FieldValue.serverTimestamp()
      }).then(() => {
          messageInput.value = "";
      }).catch(err => chatError.textContent = err.message);
  });
  
  // Listen for Messages and Update Status
  function listenForMessages(currentUser) {
      db.collection("messages")
          .orderBy("timestamp")
          .onSnapshot(snapshot => {
              chatWindow.innerHTML = ""; // Clear chat window
              snapshot.docs.forEach(doc => {
                  const message = doc.data();
                  const messageDiv = document.createElement("div");
  
                  // Display messages for the current user
                  if (message.sender === currentUser || message.receiver === currentUser) {
                      const timestamp = message.timestamp?.toDate().toLocaleString() || "Just now";
                      const status = message.sender === currentUser ? `(${message.status})` : "";
  
                      messageDiv.textContent = `${message.sender}: ${message.content} ${status} [${timestamp}]`;
                      chatWindow.appendChild(messageDiv);
  
                      // Update status to "Delivered" if the current user is the receiver
                      if (message.receiver === currentUser && message.status === "Sent") {
                          db.collection("messages").doc(doc.id).update({ status: "Delivered" });
                      }
                  }
              });
          });
  }
  
